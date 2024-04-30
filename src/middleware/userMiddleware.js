const Otp = require('../models/otpModel');
const bcrypt = require('bcrypt');
const userHelper = require('../helpers/validations');
const nodemailer = require('nodemailer');
const generateOtp = require('otp-generator');
const mongoose = require('mongoose');
const { Order, OrderReturn, Review } = require('../models/orderModels');
const Coupon = require('../models/couponModel');
const User = require('../models/userModel');
const Offer = require('../models/offerModel');
const Address = require('../models/addressModel');
const Category = require('../models/categoryModel');
const { Product, Inventory } = require('../models/productModels');
const { Cart, Wishlist } = require('../models/CartAndWishlistModel');
const asyncHandler = require('../utilities/asyncHandler');
const {calculateDeliveryCharge, getCordinates, getDistance} = require('../helpers/calculateDeliveryCharge');



/*==================================================User Authentication=================================================== */

















const isUserAutharized = asyncHandler(async (req, res, next) => {


    if (!req.session.user) {

        return res.redirect('/api/v1/')


    }
    let id = req.session.user._id
    let user = await User.findById({ _id: id })
    if (user.isBlocked == true) {
        req.session.user = null
        res.redirect('/api/v1/')
    }
    next()




})






/*================================================== Cart =============================================================== */

const addToCart = asyncHandler(async (req, res, next) => {
    console.log(req.body)


    let { id, addToCartFromWishlist, size } = req.body.data
    console.log(id, addToCartFromWishlist, size)
    let user = req.session.user?._id;
    if (!user) {
        return res.json({
            success: false,
            error: true,
            message: "user Not Logged in",
            userNotFound: true

        })
    }
    let inventory = await Inventory.findOne({ product: id });
    let product = inventory.sizeVariant.find(item => item.size)
    if (!product) {
        return res.json({
            success: false,
            error: true,
            message: 'Product Out of Stock'

        })
    }
    console.log(product, 'product')

    if (!product.stock > 0) {
        return res.json({
            success: false,
            error: true,
            message: 'Product Size Out of Stock'
        })


    }

    if (addToCartFromWishlist === true) {


        let userCart = await Cart.findOne({ user, });
        if (!userCart) {
            let cartCreate = await Cart.create({
                user,
                product: [{
                    product: id,
                    size,
                    quantity: 1,
                }]
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
        console.log(existInCart, 'exist in cart')

        if (existInCart) {

            return res.json({
                success: false,
                error: true,
                message: 'Product already exist in cart!',
                productAlreadyExist: true
            })



        }


        let cartData = await Cart.findOneAndUpdate({
            user
        },
            {
                $push: {
                    products: {
                        product: id,
                        quantity: 1,
                        size
                    }

                }
            },
            {

                new: true
            }
        );
        await Wishlist.deleteOne({ product: id })
        return res.status(200)
            .json({
                success: true,
                error: false,
                addToCartFromWishlist: true,
                data: cartData,
                message: 'Product moved to the cart successfully'
            })



    }
    let userCart = await Cart.findOne({ user, })
    if (!userCart) {

        let cartCreate = await Cart.create({
            user,
            product: [{
                product: id,
                size,
                quantity: 1,
            }]
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


    let cart = await Cart.findOneAndUpdate({
        user
    },
        {
            $push: {
                products: {
                    product: id,
                    quantity: 1,
                    size
                }

            }
        },
        {

            new: true
        }
    );

    res.json({
        success: true,
        error: false,
        data: cart,
        message: 'Product added to cart successfully',
        addedToCart: true
    })









})


const removeFromCart = asyncHandler(async (req, res, next) => {

    let user = req.session.user
    let { id, size } = req.body

    await Cart.updateOne({
        user: user._id
    },
        {
            $pull: {
                products: { _id: id }
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


    if (user) {
        res.json({
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
                .status(401)
                .json({
                    success: false,
                    error: true,
                    message: 'Product already Exist in Wishlist!',
                    productAlreadyExist: true
                })


        } else {
            let wishlist = await Wishlist.create({ product, user });

            //  
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
            req.session.user.wishlistUser.length = 0 ?
                req.session.user.wishlistUser.length :
                req.session.user.wishlistUser.length -= 1;
            return res.json({ success: true });
        })
        .catch((error) => {
            console.log(error);
        })


})

const updateCartCount = asyncHandler(async (req, res, next) => {

    let user = req.session.user._id
    let userCart = await Cart.findOne({ user })

    let { controlValue: count, cartId, productId, size } = req.body;
    console.log('count', count, 'productId', productId, 'cartId', cartId, 'size', size)
    let productItem = await Inventory.findOne({ product: productId });
    console.log(productItem, 'productItem')
    let product = productItem.sizeVariant.find(item => item.size == size);
    console.log('prouduct', product)
    if (!product) {
        return res.json({
            success: false,
            error: true,
            message: 'Product is out of stock'
        })
    }



    // console.log('product itme stock', stock, count)
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

    console.log(count, product)
    await Cart.updateOne({
        user,
        'products._id': new mongoose.Types.ObjectId(cartId),
        "products.size": size,
    },
        {
            $set: {
                'products.$.quantity': count
            }
        })
    return res.json({
        success: true,
        error: false,
        message: 'Prouduct count updated successfully'
    })





});


const findDeliveryCharge = asyncHandler(async (req, res, next) => {
    let {pincode} = req.body;
    console.log(req.body)
    let companyPincode = `676525`;
    let [sourceCordinate, targetCordinates] = await getCordinates(companyPincode, pincode); // find the cordinates of the company and users pincode

    if(targetCordinates.length == 0) {
        return res.status(404)
            .json({
                success: false,
                error: true,
                message: 'Could not find the Pincode location , please try again'
            })
    }
    let distance = getDistance(sourceCordinate, targetCordinates);
    if(distance === 0) {
        return res.status(200)
        .json({
            success: true,
            error: false,
            data: distance,
            message: 'Delivery charge found successfully'
        })

    }else if(!distance){
        return res.status(500)
        .json({
            success: false,
            error: true,
            message: 'something went wrong'
        })
    }
    console.log('distance', distance)
    let delivaryCharge = calculateDeliveryCharge(distance) 
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
    let { error, value } = userHelper.addressValidator.validate({ name, phone, alternatePhone, locality, district, pincode, street });
    if (error) {
        req.flash('addressError', error.message)
        return res.redirect('/profile/add-address')
    }
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
        let { name, phone, alternatePhone, state, district, locality, pincode, street } = req.body
        let { error, value } = userHelper.addressValidator.validate({
            name,
            phone,
            alternatePhone,
            locality,
            district,
            pincode,
            street
        });
        if (error) {
            req.flash('addressError', error.message)
            return res.redirect(`/profile/edit-address?id=${id}`)
        }
        req.session.user.editAddressId = undefined


        try {
            await Address.updateOne({
                _id: new mongoose.Types.ObjectId(id)
            },
                {
                    $set: {
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
        res.redirect('/profile')

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

/* =======================================Order======================================== */

const orderConfirm = asyncHandler(async (req, res, next) => {

    let orderId = Math.round(Math.random() * 10000) + 1
    let user = req.session.user
    console.log(req.body)
    let { address, paymentMethod } = req.body;
    address = await Address.findById({ _id: address });
    if (paymentMethod == 'cashOnDelivery') {

        let products = await Cart.findOne({
            user: new mongoose.Types.ObjectId(user._id)
        }, {
            products: 1,
            _id: 0

        }).populate('products.product')

        let orderedItems = await Cart.findOne({
            user: new mongoose.Types.ObjectId(user._id)
        }, {
            products: 1,
            _id: 0,


        })


        console.log('products,', JSON.stringify(products))
        console.log('orderedItems,', JSON.stringify(orderedItems))


        products.products.forEach(async (item) => {
            
            let newProduct = await Inventory.findOneAndUpdate({
                product: item.product,
                'sizeVariant.size': item.size
            }, {
                $inc: {
                    'sizeVariant.$.stock': -parseInt(item.quantity)
                }
            },
                { new: true }
            );
                console.log('newProduct', newProduct)


        })

        let orderAmout = products.products.map(item => item.product.price * item.quantity).reduce((acc, item) => acc + item);

        orderedItems = orderedItems.products.map(item => {

            return {
                product: item.product,
                quantity: item.quantity,
                size: item.size,
            }
        })

        // updating product's soldCount 
        orderedItems.forEach(async item => {
            await Product.findOneAndUpdate({
                _id: item.product
            },
                {
                    $inc: {
                        soldCount: 1
                    }
                }
            )
        })



        let order = await Order.create({
            user: user._id,
            address,
            paymentMethod: 'COD',
            orderId,
            orderedItems,
            orderAmout
        });


        await Cart.findOneAndUpdate({
             user: user._id 
            },
        {
            $set: {
                products: []
            }
        })

        req.session.user.currentOrderId = order._id;
        res.redirect('/api/v1/order-success');

    } else {
        res.send('Not configured')
    }




})

const orderCancel = asyncHandler(async (req, res, next) => {
    let user = req.session.user;
    if (!user) return res.redirect('/api/v1/')
    console.log(req.body)
    let { reason, comments, id } = req.body;
    let cancelDetails = { reason, comment: comments }

    let order = await Order.findOneAndUpdate({
        _id: id
    },
        {
            $set: {
                isCancelled: true,
                cancelDetails,
                orderStatus: 'Cancelled'

            }
        }, {

        new: true
    });
    console.log(order, 'order')
    let product;
    order.orderedItems.forEach(async item => {

        product = await Inventory.findOneAndUpdate({
            product: item.product

        },
            {
                $inc: {
                    quantity: item.quantity
                }
            }
        )
        console.log('product :', product, 'item :', item)
    })


    return res.json({
        success: true,
        error: false,

        result: order,
        message: 'Order cancelled successfully'
    });


});


const orderProductReview = asyncHandler(async (req, res) => {
    let user = req.session.user
    if(!user) return res.redirect('/api/v1')
    let { rating, comment, orderId, productId, size } = req.body;

    let updatedReviewOrder = await Order.findOneAndUpdate({
        _id: orderId,
        'orderedItems.product': productId,
        'orderedItems.size': size

    },
        {
            $set: {
                'orderedItems.$.isReviewed': true
            }

        },
        {
            new: true
        }
    )
    console.log(updatedReviewOrder, 'updatedReview')
    let product = await Product.findOne({_id: productId});
    let ratingCount = +product.productReviews.length;
    let currentRatingAvg = +product.avgRating;
    let newRatingAvg ;

    if(ratingCount != 0) {
        newRatingAvg = ((+ratingCount * +currentRatingAvg) + +rating) / (+ratingCount +1) 
    }else{
        newRatingAvg = +rating
    }


    let reviewProduct = await Product.findOneAndUpdate({
        _id: productId
    },
    {
        $set: {
            avgRating : +newRatingAvg,
            

        },
        $push: {
            productReviews: {
                rating,
                user: user._id,
                comment
            }
        }
    },
    {
        new: true
    }
    )

    return res.status(201)
        .json({
            
            success: true,
            error: false,
            data: reviewProduct,
            message: 'Product review successfully submited'
        })







})

const orderReturn = asyncHandler( async (req, res) => {
    console.log(req.body)
})











module.exports = {

    isUserAutharized,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    removeFromCart,
    addAddress,
    orderConfirm,
    updateCartCount,
    deleteAddress,
    editAddress,
    changePassword,
    changeUserDetails,
    orderCancel,
    orderProductReview,
    orderReturn,
    findDeliveryCharge,


}