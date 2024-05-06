
const { Order, Return, Review } = require('../models/orderModels');
const Coupon = require('../models/couponModel');
const User = require('../models/userModel');
const Offer = require('../models/offerModel');
const Address = require('../models/addressModel');
const Category = require('../models/categoryModel');
const { Product, Inventory } = require('../models/productModels');
const { Cart, Wishlist } = require('../models/CartAndWishlistModel');
const asyncHandler = require('../utilities/asyncHandler');
const { calculateDeliveryCharge, getCordinates, getDistance } = require('../helpers/calculateDeliveryCharge');
const userHelper = require('../helpers/validations');
const { createRazorpayOrder, createPayPalPayment } = require('../controller/paymentControllers');
const mongoose = require('mongoose');
const Wallet = require('../models/walletModel');
const { date } = require('joi');



const checkValidCoupon = asyncHandler( async (req, res) => {
    let user = req.session.user ;
    if(!user) return false
    
    let cart = await Cart.findOne({user: user._id});
    if(!cart) return res.status(500)
    if(cart.isCouponApplied == false) {
        return res.status(200)
            .json({
                success: true,
                error: false,
                message: 'No coupon found'
            })
    }
    let coupon = await Coupon.findOne({couponCode:cart.coupon.code});
    let today = new Date()
    console.log('td',today)

    console.log('exp', coupon.expiryDate)

    if(coupon.minCost > cart.cartTotal) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Cart balance is less than Coupon min Amount'

            })

    }
    if(coupon.expiryDate < today){
        return res.status(400)
        .json({
            success: false,
            error: true,
            message: 'Coupon has expired'

        })
    }
    return res.status(200)
        .json({
            success: true,
            error: false,
            message: 'Valid coupon'
        })

})


const proceedtToCheckout = asyncHandler (async (req, res) => {
    let user = req.session.user;
    let cart = await Cart.findOne({user: user._id})
    let inventory = await Inventory.find({});
    console.log('inventory', inventory);
    console.log('cart', cart);
   
    let product;
    let productVariant;
    
    let outOfStockProducts = cart.products.filter(cartProduct => {
   
       product =  inventory.find(item =>  cartProduct.product.toString() == item.product.toString() )
      
       if(!product)  return false;
      

       productVariant = product.sizeVariant.find(variant => cartProduct.size == variant.size);

       if(!productVariant) return false
    


      return productVariant.stock < cartProduct.quantity    
       
      
        
    }).map(item => item._id)
    console.log('out of stock products', outOfStockProducts);

    if(!outOfStockProducts.length == 0) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                errorData : outOfStockProducts,
                message: 'Some products are out of stock'
            })
    }
    return res.status(200)
        .json({
            success: true,
            error: false,
            message: 'Cart data validated'
        })
})



const orderConfirm = asyncHandler(async (req, res, next) => {

    let orderId = Math.round(Math.random() * 1000000) + 1
    let user = req.session.user
    let { address, paymentMethod } = req.body;
    console.log(req.body);

    let userAddress = await Address.findById({ _id: address });


    let cart = await Cart.findOne({
        user: new mongoose.Types.ObjectId(user._id)
    }).populate('products.product')

    let orderedItems = await Cart.findOne({
        user: new mongoose.Types.ObjectId(user._id)
    }, {
        products: 1,
        _id: 0,


    })


    console.log('products,', JSON.stringify(cart))
    console.log('orderedItems,', JSON.stringify(orderedItems))


    cart.products.forEach(async (item) => {

        let newProduct = await Inventory.findOneAndUpdate({
            product: item.product,
            'sizeVariant.size': item.size
        }, {
            $inc: {
                'sizeVariant.$.stock': -parseInt(item.quantity),
                totalStock: -parseInt(item.quantity)
            }
        },
            { new: true }
        );
        console.log('newProduct', newProduct)


    })

    let orderAmount = cart.products.map(item => item.product.price * item.quantity).reduce((acc, item) => acc + item);

    orderedItems = orderedItems.products.map(item => {

        return {
            product: item.product,
            quantity: item.quantity,
            size: item.size,
            totalPrice: item.totalPrice
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

    if (paymentMethod == 'COD') {

        let order = await Order.create({
            user: user._id,
            address: userAddress,
            paymentMethod,
            paymentStatus: 'Paid',
            orderId,
            orderedItems,
            orderAmount,
            orderStatus: 'Placed',
        });
        await Cart.deleteOne({
            user: user._id
        })
        return res.status(201)
            .json({
                success: true,
                error: false,
                data: order,
                orderType: 'COD',
                message: 'order placed'
            })

    }else if(paymentMethod == 'Wallet') {
        let wallet = await Wallet.findOne({ user: user._id});
        if(cart.cartTotal > wallet.balance) {
            return res.status(400)
                .json({
                    success: false,
                    error: true,
                    message: 'Wallet has insufficient balance'
                })
        }else {
            let order = await Order.create({
                user: user._id,
                address: userAddress,
                paymentMethod,
                paymentStatus: 'Paid',
                orderId,
                orderedItems,
                orderAmount,
                orderStatus: 'Placed'
            });
            await Cart.deleteOne({
                user: user._id
            })
            wallet.balance -= order.orderAmount;
            wallet.transactions.push({ amount: order.orderAmount, mode: 'Credit' })
            await wallet.save()
            res.status(200)
            .json({
                success: true,
                error: false,
                data: order,
                orderType: 'Wallet',
                message: 'order placed'
            })

        }


    } else {

        let order = await Order.create({
            user: user._id,
            address: userAddress,
            paymentMethod,
            orderId,
            orderedItems,
            orderAmount,
            orderStatus: 'Placed'
        });


        await Cart.deleteOne({
            user: user._id
        })
        if (paymentMethod == 'RazorPay') {

            createRazorpayOrder(req, res, order);

        } else if (paymentMethod == 'PayPal') {

            createPayPalPayment(req, res, order);

            req.session.orderId = order._id;



        }
        // return res.status(200)
        //     .json({
        //         success: true,
        //         error: false,
        //         orderType: paymentMethod,
        //         data: order,
        //         message: 'order placed'
        //     })

    }







})

const orderCancel = asyncHandler(async (req, res, next) => {
    let user = req.session.user;
    if (!user) return res.redirect('/api/v1/')
    console.log(req.body)
    let { reason, comments, id } = req.body;
    let cancelDetails = { reason, comment: comments }

    let order = await Order.findOne({
        _id: id
    })

    let orderedItems = order.orderedItems;

    orderedItems.forEach(async item => {
        await Inventory.updateOne({
            product: item.product,
            "sizeVariant.size": item.product.size

        },
            {
                $inc: {
                    'sizeVariant.$.stock': item.quantity
                }

            })

    })

    if (order.orderStatus == 'Placed' && ['PayPal', 'RazorPay', 'Wallet'].includes(order.paymentMethod)) {
        let wallet = await Wallet.findOneAndUpdate({
            user: user._id
        },
            {
                $inc: {
                    balance: order.orderAmount
                },
                $push: {
                    transactions: {
                        amount: order.orderAmount,
                        mode: 'Debit',

                    }
                }

            },
            {
                new: true
            }
        )
        console.log('new wallet', wallet);
    }
        

        order.isCancelled = true;
        order.cancelDetails = cancelDetails;
        order.orderStatus = 'Cancelled';

        order = await order.save();


        console.log(order, 'order')




        return res.json({
            success: true,
            error: false,
            data: order,
            result: order,
            message: 'Order cancelled successfully'
        });


    });


const orderProductReview = asyncHandler(async (req, res) => {
    let user = req.session.user
    if (!user) return res.redirect('/api/v1')
    let { rating, comment,review, orderId, productId,orderedItemId, size } = req.body;

    let updatedReviewOrder = await Order.findOneAndUpdate({
        _id: orderId,
        'orderedItems._id': orderedItemId,
       

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
    let product = await Product.findOne({ _id: productId });
    let ratingCount = +product.productReviews.length;
    let currentRatingAvg = +product.avgRating;
    let newRatingAvg;

    if (ratingCount != 0) {
        newRatingAvg = ((+ratingCount * +currentRatingAvg) + +rating) / (+ratingCount + 1)
    } else {
        newRatingAvg = +rating
    }


    let reviewProduct = await Product.findOneAndUpdate({
        _id: productId
    },
        {
            $set: {
                avgRating: +newRatingAvg,


            },
            $push: {
                productReviews: {
                    rating,
                    user: user._id,
                    comment,
                    review
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

const orderReturn = asyncHandler(async (req, res) => {
    console.log(req.body)
    let user = req.session.user

    let {reason, comments, orderId, orderedItemId} = req.body;
    let userReturn = await Return.create({
        user:user._id,
        order: orderId,
        orderedItemId,
        reason,

        comments,


    })


    let order = await Order.findOneAndUpdate({
        _id: orderId,
        'orderedItems._id': orderedItemId
    }, {
        $set: {
            'orderedItems.$.returnStatus': 'Requested'
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
            message: 'Product returned  successfully'
        })
})



const loadMyOrders = asyncHandler(async (req, res) => {

    let user = req.session?.user;
    if (!user) return res.redirect('/api/v1/')

    let order = await Order.find({
        user: user._id
    })
        .populate('address')
        .populate('orderedItems.product')
        .sort({ createdAt: -1 })
    

    res
        .render('user/myOrders',
            {
                order,
                user,
            })


})

const loadSingleOrderDetails = asyncHandler(async (req, res, next) => {
    let user = req.session.user
    let id = req.query.id;
    let order = await Order.findOne({ _id: id, user: user._id })
        .populate('user')
        .populate('orderedItems.product')
        .sort({ createdAt: -1 });

    if (!order) {
        return res.json({
            success: false,
            error: true,
            message: " something went wrong"
        })
    }

    res.render('user/singleOrderDetails', { user, order })
})


const razorpaySuccess = asyncHandler(async (req, res) => {

    let { paymentId, orderId } = req.body;
    let order = await Order.findOneAndUpdate({
        _id: orderId
    },
        {
            $set: {
                orderStatus: 'Placed',
                paymentStatus: "Paid",
                paymentId

            }

        },
        {
            new: true
        }
    )

    return res.status(200)
        .json({
            success: true,
            error: false,
            data: order,
            message: "RazorPay payment successfull"
        })

})

const razorpayFailure = asyncHandler(async (req, res) => {
    let { orderId } = req.body;
    let order = await Order.findOneAndUpdate({
        _id: orderId
    },
        {
            $set: {
                orderStatus: 'Pending',
                paymentStatus: "Failed",


            }

        },
        {
            new: true
        }
    )

    return res.status(400)
        .json({

            success: true,
            error: false,
            data: order,
            message: "RazorPay payment failure"
        })

})

const paypalSuccess = asyncHandler(async (req, res) => {
    let orderId = req.session.orderId;
    req.session.orderId = null;
    console.log(req.query)

    let { paymentId } = req.query;
    let order = await Order.findOneAndUpdate({
        _id: orderId
    },
        {
            $set: {
                orderStatus: 'Placed',
                paymentStatus: "Paid",
                paymentId

            }

        },
        {
            new: true
        }
    )
    return res.redirect('/api/v1/order-success?orderId=' + orderId)



    // return res.status(200)
    //     .json({
    //         success: true,
    //         error: false,
    //         data: order,
    //         message: "RazorPay payment successfull"
    //     })


})


const paypalFailure = asyncHandler(async (req, res) => {

    let orderId = req.session.orderId;
    req.session.orderId = null;
    let order = await Order.findOneAndUpdate({
        _id: orderId
    },
        {
            $set: {
                orderStatus: 'Pending',
                paymentStatus: "Failed",


            }

        },
        {
            new: true
        }
    )
   
    return res.redirect(`api/v1/admin//my-orders/single-orderDetails?id=${orderId}`)

    // return res.status(400)
    //     .json({

    //         success: true,
    //         error: false,
    //         data: order,
    //         message: "RazorPay payment failure"
    //     })
})



module.exports = {
    orderConfirm,
    orderCancel,
    orderProductReview,
    orderReturn,
    loadMyOrders,
    loadSingleOrderDetails,
    razorpaySuccess,
    razorpayFailure,
    paypalSuccess,
    paypalFailure,
    proceedtToCheckout,
    checkValidCoupon

}