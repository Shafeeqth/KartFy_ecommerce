const mongoose = require('mongoose');
const { Product, Inventory } = require('../models/productModels');
const { Cart, Wishlist } = require('../models/CartAndWishlistModel');
const asyncHandler = require('../utilities/asyncHandler');
const { calculateDeliveryCharge, getCordinates, getDistance } = require('../helpers/calculateDeliveryCharge');

const loadCart = asyncHandler(async (req, res, next) => {

    let user = req.session.user ? req.session.user : null;
    let cart = await Cart.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $unwind: '$products'
        },
        {
            $lookup: {
                from: 'products',
                localField: 'products.product',
                foreignField: '_id',
                as: 'product',
            }
        },
        {
            $lookup: {
                from: 'offers',
                localField: 'product._id',
                foreignField: 'productIds',
                as: 'productOffer',
                pipeline: [
                    {
                        $match: {
                            isListed: true
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'offers',
                localField: 'product.category.Category',
                foreignField: 'appliedCategory',
                as: 'categoryOffer',
                pipeline: [
                    {
                        $match: {
                            isListed: true
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$product'
        },
        {
            $addFields: {
                shouldUnwindCategory: {
                    $cond: [{
                        $eq: [{
                            $size: '$categoryOffer'
                        }, 0]
                    },
                        false,
                        true
                    ]
                },
                shouldUnwindProduct: {
                    $cond: [{
                        $eq: [{
                            $size: '$productOffer'
                        }, 0]
                    },
                        false,
                        true
                    ]
                }
            }
        },
        {
            $unwind: {
                path: '$productOffer',
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: '$categoryOffer',
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $addFields: {

                categoryOfferPrice: {
                    $cond: [
                        '$shouldUnwindCategory',
                        {
                            $subtract: ['$product.price',
                                {
                                    $multiply: ['$product.price',
                                        {
                                            $divide: ['$categoryOffer.discount', 100]
                                        }
                                    ]
                                }
                            ]
                        },
                        null
                    ]
                },
                productOfferPrice: {
                    $cond: [
                        '$shouldUnwindProduct',
                        {
                            $subtract: ['$product.price',
                                {
                                    $multiply: ['$product.price',
                                        {
                                            $divide: ['$productOffer.discount', 100]
                                        }
                                    ]
                                }
                            ]
                        },
                        null
                    ]
                },
            }
        },
        {
            $addFields: {
                minimumPrice: {
                    $round: [
                        {
                            $min: ['$productOfferPrice', '$categoryOfferPrice', '$product.price']
                        }
                    ]
                },
            },
        },
        {
            $project: {
                categoryOffer: 0,
                productOffer: 0,
                shouldUnwindCategory: 0,
                shouldUnwindProduct: 0,
            }
        }
    ])
    res.render('user/cartPage', { cart });
})


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
  
    

    let product = inventory.sizeVariant.find(item => item.size == size);

    if (!product) {
        return res.json({
            success: false,
            error: true,
            message: 'Product Out of Stock'

        })
    }
    let userCart = await Cart.findOne({ user });
    if (userCart && userCart.isCouponApplied) {
        await userCart.removeCouponIfApplied();
    }

   
    if (!product.stock > 0) {
        return res.json({
            success: false,
            error: true,
            message: 'Product Size Out of Stock'
        })


    }
    
    console.log('userCart)', userCart)

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

const removeFromCart = asyncHandler(async (req, res, next) => {

    let user = req.session.user
    let { id, size, total } = req.body;
    console.log(req.body)
  
    let userCart = await Cart.findOne({ user:user._id });
   
    if (userCart && userCart.isCouponApplied) {
        await userCart.removeCouponIfApplied();
    }
    await userCart.save()


    let cart = await Cart.findOneAndUpdate({
        user: user._id
    },
        {
            $pull: {
                products: { _id: new mongoose.Types.ObjectId(id )}
            },
    
        }
    );
     console.log(cart, 'cart')
    return res
        .status(200)
        .json({
            success: true,
            error: false,
            message: 'Product removed from Cart successully!'
        });


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

   
    let userCart = await Cart.findOne({ user });
    if (userCart && userCart.isCouponApplied) {
        await userCart.removeCouponIfApplied();
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


const loadWishlist = asyncHandler(async (req, res, next) => {
    let user = req.session.user ? req.session.user : null;
    let wishlist = await Wishlist.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product'
            }

        },
        {
            $lookup: {
                from: 'offers',
                localField: 'product._id',
                foreignField: 'productIds',
                as: 'productOffer',
                pipeline: [
                    {
                        $match: {
                            isListed: true
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'offers',
                localField: 'product.category.Category',
                foreignField: 'appliedCategory',
                as: 'categoryOffer',
                pipeline: [
                    {
                        $match: {
                            isListed: true
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$product'
        },
        {
            $addFields: {
                shouldUnwindCategory: {
                    $cond: [{
                        $eq: [{
                            $size: '$categoryOffer'
                        }, 0]
                    },
                        false,
                        true
                    ]
                },
                shouldUnwindProduct: {
                    $cond: [{
                        $eq: [{
                            $size: '$productOffer'
                        }, 0]
                    },
                        false,
                        true
                    ]
                }
            }
        },
        {
            $unwind: {
                path: '$productOffer',
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $unwind: {
                path: '$categoryOffer',
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $addFields: {

                categoryOfferPrice: {
                    $cond: [
                        '$shouldUnwindCategory',
                        {
                            $subtract: ['$product.price',
                                {
                                    $multiply: ['$product.price',
                                        {
                                            $divide: ['$categoryOffer.discount', 100]
                                        }
                                    ]
                                }
                            ]

                        },
                        null
                    ]

                },
                productOfferPrice: {
                    $cond: [
                        '$shouldUnwindProduct',
                        {
                            $subtract: ['$product.price',
                                {
                                    $multiply: ['$product.price',
                                        {
                                            $divide: ['$productOffer.discount', 100]
                                        }
                                    ]
                                }
                            ]
                        },
                        null
                    ]
                },
            }
        },
        {
            $addFields: {
                minimumPrice: {
                    $min: ['$productOfferPrice', '$categoryOfferPrice', '$product.price']
                },
            },
        },
        {
            $project: {
                categoryOffer: 0,
                productOffer: 0,
                shouldUnwindCategory: 0,
                shouldUnwindProduct: 0
            }
        }

    ])
    res.render('user/wishlistPage', { wishlist });
})





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


module.exports = {
    loadCart,
    updateCartCount,
    removeFromCart,
    removeFromWishlist,
    addToWishlist,
    addToCart,
    loadWishlist,






}