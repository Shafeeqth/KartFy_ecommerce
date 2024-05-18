
const bcrypt = require('bcrypt');
const userHelper = require('../helpers/validations');
const nodemailer = require('nodemailer');
const generateOtp = require('otp-generator');
const mongoose = require('mongoose');

const Coupon = require('../models/couponModel');
const User = require('../models/userModel');
const Offer = require('../models/offerModel');
const Address = require('../models/addressModel');
const Category = require('../models/categoryModel');
const { Product, Inventory } = require('../models/productModels');
const { Cart, Wishlist } = require('../models/CartAndWishlistModel');
const asyncHandler = require('../utilities/asyncHandler');
const { calculateDeliveryCharge, getCordinates, getDistance } = require('../helpers/calculateDeliveryCharge');
const { findOneAndUpdate } = require('../models/walletModel');



/*==================================================User Authentication=================================================== */

















const isUserAutharized = asyncHandler(async (req, res, next) => {


    if (!req.session.user) {

        return res.redirect('/api/v1/')


    }
    let id = req.session.user._id
    let user = await User.findById({ _id: id, })
    if (user.isBlocked == true) {
        req.session.user = null
        res.redirect('/api/v1/')
    }
    next()


    // let id = req.session.user._id

    // let user = await User.aggregate([
    //     {
    //         $match:
    //         {
    //             _id: new mongoose.Types.ObjectId(id),
    //             isBlocked: false
    //         }
    //     },
    //     {
    //         $project: {
    //             _id: 1,
    //             name: 1
    //         }
    //     },
        

    //     {
    //         $lookup: {
    //             from: 'carts',
    //             localField: '_id',
    //             foreignField: 'user',
    //             as: 'cart',
    //             pipeline: [{
    //                 $unwind: '$products'
    //                 },{
    //                     $project: {
    //                         products: 1
    //                     }
    //                 }
    //             ]
    //         }
    //     },
    //     {
    //         $unwind: '$cart'
    //     },
    //     {
    //         $unwind: '$cart.products'
    //     },
    //     {
    //         $unwind: '$cart.products'
    //     },       
    //     {
    //         $group: {
    //             _id: null,
    //             cartCount : {
    //                 $sum: '$cart.products.quantity'
    //             },
               
               
               

               
               
    //         }
    //     }

    // ])
    // res.locals.userName = await User.findOne({_id: id}, {_id: 0, name: 1})
    // console.log(res.locals.userName )
    // res.locals.cartCount = user[0].cartCount
    // res.locals.wishlistCount = await Wishlist.countDocuments({user: id})
    // console.log(JSON.stringify(user), 'user')

})






/*================================================== Cart =============================================================== */

const addToCart = asyncHandler(async (req, res, next) => {


    let { id, addToCartFromWishlist, size } = req.body.data
    let user = req.session.user?._id;
   
    
    if (!user) {
        return res.json({
            success: false,
            error: true,
            message: "user Not Logged in",
            userNotFound: true

        })
    }

    
    let inventory = await Inventory.findOne({ product: id }).populate('product')
    console.log('Inventory', inventory)
    

    let product = inventory.sizeVariant.find(item => item.size == size);

    if (!product) {
        return res.json({
            success: false,
            error: true,
            message: 'Product Out of Stock'

        })
    }
    console.log(product, 'product')
    let userCart = await Cart.findOne({ user });
   
    if (!product.stock > 0) {
        return res.json({
            success: false,
            error: true,
            message: 'Product Size Out of Stock'
        })


    }
    if(userCart && userCart.isCouponApplied) {
        userCart.isCouponApplied = false,
        delete userCart.coupon;
    }

    if (addToCartFromWishlist === true) {
     
        if (!userCart) {
            let cartCreate = await Cart.create({
                user,
                products: [{
                    product: id,
                    size,
                    quantity: 1,
                 
                }],
            })

            return res.json({
                success: true,
                error: false,
                data: cartCreate,
                addToCartFromWishlist: true,
                message: 'Product added to cart successfully'
            })

        }
        let existInCart = userCart.products.find(item => {
            if (item.size === size && item.product._id == id) return true
            return false;
        });

        if (existInCart) {

            return res.json({
                success: false,
                error: true,
                message: 'Product already exist in cart!',
                productAlreadyExist: true
            })

        }

        userCart.products.push({
            product: id,
            quantity: 1,
            size,
        
        })
   
        await Wishlist.deleteOne({ product: id })
        userCart = await userCart.save()


        return res.status(200)
            .json({
                success: true,
                error: false,
                addToCartFromWishlist: true,
                data: userCart,
                message: 'Product moved to the cart successfully'
            })



    }
   
    if (!userCart) {

        let cartCreate = await Cart.create({
            user,
            products: [{
                product: id,
                size,
                quantity: 1,
            }],
        })

        return res.json({
            success: true,
            error: false,
            data: cartCreate,
            addedToCart: true,
            message: 'Product added to cart successfully'
        })


    }
    let exist = userCart.products.find(item => {
        if (item.size == size && item.product._id == id) return true
        return false;

    })


    if (exist) {
        return res.json({
            success: false,
            error: true,
            message: 'Product already exist in cart!',
            productAlreadyExist: true
        })
    }


    userCart.products.push({
        product: id,
        quantity: 1,
        size,

    })

    userCart = await userCart.save()

    res.json({
        success: true,
        error: false,
        data: userCart,
        message: 'Product added to cart successfully',
        addedToCart: true
    })









})

const checkoutValidator = asyncHandler(async (req, res, next) => {
    req.session.allowCheckout = true,
     res.redirect('/api/v1/checkout')
})


const removeFromCart = asyncHandler(async (req, res, next) => {

    let user = req.session.user
    let { id, size, total } = req.body;
    let product = await Product.findOne({ _id: id })
    let userCart = await Cart.findOne({ user:user._id });
    if(userCart && userCart.isCouponApplied) {
        userCart.isCouponApplied = false,
   
        await Coupon.findOneAndUpdate({
            couponCode: userCart.coupon.code
        },
        {
            $pull: {
                appliedUsers: user._id
            }
        },
        {
            new: true

        }
    )
    userCart.totalPrice += userCart.coupon.discount;
    delete userCart.coupon
    }
    await userCart.save()


    await Cart.updateOne({
        user: user._id
    },
        {
            $pull: {
                products: { _id: id }
            },
            $inc: {
                cartTotal: -1 * total

            }

        }
    );
    return res
        .status(200)
        .json({
            success: true,
            error: false,
            message: 'Product removed from Cart successully!'
        });


})



/*================================================== Wishlist =============================================================== */

const addToWishlist = asyncHandler(async (req, res, next) => {

    let user = req.session.user?._id;
    let product = req.body?.id
    console.log(product)


    if (!user) {
        return res.json({
            success: false,
            error: true,
            message: 'User not logged in!',
            userNotFound: true
        });
    }
    let exist = await Wishlist.findOne({ user, product })
    console.log(exist);

    if (exist) {
        return res
            .status(200)
            .json({
                success: false,
                error: true,
                message: 'Product already Exist in Wishlist!',
                productAlreadyExist: true
            })


    } else {
        let wishlist = await Wishlist.create({ product, user });


        return res
            .status(201)
            .json({
                success: true,
                error: false,
                message: 'Product added to wishlist successfully!',
                addedToWishlist: true
            })

    }








})


const removeFromWishlist = asyncHandler(async (req, res, next) => {

    let { id } = req.body
    console.log(id)
    return Wishlist.deleteOne({ _id: id })
        .then((result) => {
            // req.session.user.wishlistUser.length = 0 ?
            //     req.session.user.wishlistUser.length :
            //     req.session.user.wishlistUser.length -= 1;
            return res.json({ success: true });
        })
        .catch((error) => {
            console.log(error);
        })


})

const updateCartCount = asyncHandler(async (req, res, next) => {

    let user = req.session.user._id
    let {  count, cartId, productId, size, price } = req.body;



    console.log('count', count, 'productId', productId, 'cartId', cartId, 'size', size)
    let productItem = await Inventory.findOne({ product: productId });
  
    let product = productItem.sizeVariant.find(item => item.size == size);
  
    if (!product) {
        return res.json({
            success: false,
            error: true,
            message: 'Product is out of stock'
        })
    }


    if (+count < 1) {
        return res.json({
            success: false,
            error: true,
            message: 'Minimum quantity should be atleast One!'
        })
    }
    if (+count > 6) {
        return res.json({
            success: false,
            error: true,
            message: 'Maximum quantity 6 exceeded!'
        })
    }
    if (+product.stock < +count) {
        return res.json({
            success: false,
            error: true,
            message: 'item count Exceeds product stock'
        })
    }

   
    let userCart = await Cart.findOne({
        user,
    });
  
    if(userCart && userCart.isCouponApplied) {
        userCart.isCouponApplied = false,
   
        await Coupon.findOneAndUpdate({
            couponCode: userCart.coupon.code
        },
        {
            $pull: {
                appliedUsers: user
            }
        },
        {
            new: true

        }
    )
    userCart.totalPrice += userCart.coupon.discount;
    delete userCart.coupon
    }
   

   let cartItem = userCart.products.find(item => item.size == size && item.product == productId);
   console.log(cartItem);
   
   userCart.cartTotal -= cartItem.totalPrice;
   cartItem.quantity = count;
   cartItem.totalPrice = price * count;
   await cartItem.save()

   userCart.cartTotal += count * price
   await userCart.save();
  
    return res.json({
        success: true,
        error: false,
        message: 'Prouduct count updated successfully'
    })




});


const findDeliveryCharge = asyncHandler(async (req, res, next) => {
    let { pincode } = req.body;
    let user = req.session.user;

    let companyPincode = `676525`;
    let [sourceCordinate, targetCordinates] = await getCordinates(companyPincode, pincode); // find the cordinates of the company and users pincode

    if (targetCordinates.length == 0) {
        return res.status(404)
            .json({
                success: false,
                error: true,
                message: 'Could not find the Pincode location , please try again'
            })
    }
    let distance = getDistance(sourceCordinate, targetCordinates);
    if (distance === 0) {
        return res.status(200)
            .json({
                success: true,
                error: false,
                data: distance,
                message: 'Delivery charge found successfully'
            })

    } else if (!distance) {
        return res.status(500)
            .json({
                success: false,
                error: true,
                message: 'something went wrong'
            })
    }
    console.log('distance', distance)
    let delivaryCharge = calculateDeliveryCharge(distance);
    await Cart.findOneAndUpdate({
        user: user._id
    },
    {
        $set: {
            deliveryCharge: delivaryCharge + 20
        }
    }
)
    return res.status(200)
        .json({
            success: true,
            error: false,
            data: delivaryCharge + 20,
            message: 'Delivery charge found successfully'
        })


})

/* ==========================================User Profile ============================================================ */

const addAddress = asyncHandler(async (req, res, next) => {

    let user = req.session?.user
    if (!user) res.redirect('/api/v1/')
    let body = req.body;
    body.user = req.session.user._id;
    console.log('===========================================================', body)
    let { name, phone, alternatePhone, state, district, locality, pincode, street, type } = req.body
    // let { error, value } = userHelper.addressValidator.validate({ name, phone, alternatePhone, locality, district, pincode, street });
    // if (error) {
    //     req.flash('addressError', error.message)
    //     return res.redirect('/api/v1/profile/add-address')
    // }
    let address = await Address.create(body);
    res.redirect('/api/v1/profile')
    






})

const deleteAddress = asyncHandler(async (req, res, next) => {

    let user = req.session.user?._id
    let { id } = req.body
    if (user) {
        await Address.deleteOne({ user, _id: id })
        res.json({ success: true })


    } else {
        res.redirect('/')

    }

})

const editAddress = asyncHandler(async (req, res, next) => {

    let user = req.session.user
    console.log(req.body)
    if (user) {

        let id = req.session.user.editAddressId;
        let { name, phone, alternatePhone, state, district, locality, pincode, street, type } = req.body
        // let { error, value } = userHelper.addressValidator.validate({
        //     name,
        //     phone,
        //     alternatePhone,
        //     locality,
        //     district,
        //     pincode,
        //     street
        // });
        // if (error) {
        //     req.flash('addressError', error.message)
        //     return res.redirect(`/profile/edit-address?id=${id}`)
        // }
        req.session.user.editAddressId = undefined


        try {
            await Address.updateOne({
                _id: new mongoose.Types.ObjectId(id)
            },
                {
                    $set: {
                        type,
                        name,
                        phone,
                        alternatePhone,
                        state,
                        district,
                        locality,
                        pincode,
                        street
                    }
                });
        } catch (error) {
            consoel.log(error)

        }
        res.redirect('/api/v1/profile')

    } else {

    }

})

const changePassword = asyncHandler(async (req, res, next) => {

    let userId = req.session.user._id
    let { curPassword, nPassword, conPassword } = req.body;

    if (userId) {

        let user = await User.findById({
            _id: userId
        })
        let currentPasswordMatch = await bcrypt.compare(curPassword, user.password)
        console.log(currentPasswordMatch)

        if (!currentPasswordMatch) {
            return res.json({
                success: false,
                currentError: true,
                error: 'invalid current password'
            });
        }

        let { error, value } = userHelper.resetPasswordValidation.validate({
            password: nPassword,
            confirmPassword: conPassword
        });
        if (error) {
            return res.json({
                success: false,
                validateError: true,
                error: error.message
            })
        }

        await model.User.updateOne({
            _id: userId
        }, {
            $set: {
                password: nPassword
            }
        })
        return res.json({ success: true })

    } else {

    }
    console.log(curPassword, nPassword, conPassword)

})

const changeUserDetails = asyncHandler(async (req, res, next) => {

    let id = req.session.user._id;
    let { name } = req.body;

    let { error, value } = userHelper.userAndemailValid.validate({ name });

    if (error) {
        return res.json({
            validateError: true,
            success: false,
            error: error.message
        })
    }

    await User.updateOne({ _id: id }, { $set: { name } });
    return res.json({
        success: true,
        error: null
    })

})
const addCoupon = asyncHandler(async (req, res) => {
    let code = req.body.code;
    let user = req.session.user;
    let coupon = await Coupon.findOne({ 
        couponCode: code
    })
    let cart = await Cart.findOne({ user: user._id }).populate('products.product','price -_id');
    let cartTotal = cart.products.reduce((acc, item) => acc + item.product.price * item.quantity,0);
   
    console.log('coupon', coupon)
    let now = new Date;

    if (!coupon) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon not found!'
            })
    }
    let expiryDate = new Date(coupon.expiryDate)
    if (cartTotal < coupon.minCost) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Order amount is less than coupn Min Order amount!'
            })

    }
    if (now.getTime() > expiryDate.getTime()) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon is expired!'
            })

    }
    if (coupon.appliedUsers.includes(user._id)) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'You have already rediemed this coupon!'
            })

    }
    if (!coupon.limit) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon limit is over!'
            })

    }
    coupon.limit -= 1;
    await coupon.save()


    let discount = Math.floor((coupon.discount * cartTotal) / 100)
    cart.isCouponApplied = true;
    cart.coupon = {
        code: coupon.couponCode,
        couponId: coupon._id,
        discount,
    }
    cart = await cart.save();
    return res.status(200)
        .json({
            success: true,
            error: false,
            data: cart,
            message: 'Coupon rediemed!'
        })


});

const removeCoupon = asyncHandler(async (req, res) => {
    let { discount } = req.body;
    let user = req.session.user._id
    console.log(discount);

    let cart = await Cart.findOneAndUpdate({
         user
    },
        {
            $set: {
                isCouponApplied: false,

            },
            $unset: {
                coupon: ""

            },
           



        }

    )
    console.log('===========================================coupon Code', cart.coupon.code)
    // await Coupon.findOneAndUpdate({
    //     couponCode: cart.coupon.code
    // },
    //     {
    //         $pull: {
    //             appliedUsers: user

    //         }
    //     }
    // )

    return res.json({
        success: true,
        error: true,
        message: 'Coupon removed successfully'
    })
})



/* =======================================Order======================================== */







module.exports = {


    isUserAutharized,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    removeFromCart,
    addAddress,
    addCoupon,
    removeCoupon,

    updateCartCount,
    deleteAddress,
    editAddress,
    changePassword,
    changeUserDetails,
    checkoutValidator,


    findDeliveryCharge,
    




}