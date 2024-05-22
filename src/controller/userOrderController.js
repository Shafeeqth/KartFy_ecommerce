
const { Order, Return, Review } = require('../models/orderModels');
const Coupon = require('../models/couponModel');
const User = require('../models/userModel');
const Address = require('../models/addressModel');
const { Product, Inventory } = require('../models/productModels');
const { Cart, Wishlist } = require('../models/CartAndWishlistModel');
const asyncHandler = require('../utilities/asyncHandler');
const { calculateDeliveryCharge, getCordinates, getDistance } = require('../helpers/calculateDeliveryCharge');
const { createRazorpayOrder, createPayPalPayment } = require('../controller/paymentControllers');
const mongoose = require('mongoose');
const Wallet = require('../models/walletModel');
const { findDeliveryCharge } = require('../middleware/userMiddleware');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('node:fs');
const ejs = require('ejs');




const loadOrderSuccess = asyncHandler(async (req, res) => {

    let orderId = req.query['orderId'];
    let user = req.session?.user ?? null
    res.locals.orderId = orderId;
    let currentOrder = await Order.findById({
        _id: orderId
    })
        .populate('user')
        .populate('address')

    res.render('user/orderSuccess', { currentOrder, orderId })


})


const proceedtToCheckout = asyncHandler(async (req, res) => {
    let user = req.session.user;
    let cart = await Cart.findOne({ user: user._id });

    let inventory = await Inventory.find({});

    let product;
    let productVariant;

    let outOfStockProducts = cart.products.filter(cartProduct => {
        product = inventory.find(item => cartProduct.product.toString() == item.product.toString())
        if (!product) return false;
        productVariant = product.sizeVariant.find(variant => cartProduct.size == variant.size);
        if (!productVariant) return false
        return productVariant.stock < cartProduct.quantity

    }).map(item => item._id);

    if (!outOfStockProducts.length == 0) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                errorData: outOfStockProducts,
                message: 'Some products are out of stock'
            })
    };
    let listcart = await Cart.findOne({ user: user._id }).populate('products.product');
    const unListedProducts = listcart.products.filter(cartProduct => cartProduct.product.isListed == false).map(item => item._id);

    if (!unListedProducts.length == 0) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                errorData: unListedProducts,
                message: 'Some products are Unavialable'
            })
    };





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


    let cart = await Cart.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId( user._id)
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
                as: 'productss',
                
            }
        },
        {
            $unwind: '$productss'
        },
        {
            $lookup: {
                from: 'offers',
                localField: 'productss._id',
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
                localField: 'productss.category.Category',
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
                            $subtract: ['$productss.price',
                                {
                                    $multiply: ['$productss.price',
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
                            $subtract: ['$productss.price',
                                {
                                    $multiply: ['$productss.price',
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
                            $min: ['$productOfferPrice', '$categoryOfferPrice', '$productss.price']
                        }

                    ]
                },
            }
        },
        {
            $addFields: {
                savedPrice: {
                    $subtract: [ '$productss.mrpPrice', '$minimumPrice']
                }
            }

        },
        {
            $project: {
                products: 1,
                coupon: 1,
                minimumPrice: 1,
                savedPrice: 1,
                deliveryCharge: 1

            }
        }
    ])
        console.log(cart);
    let cartCoupon = cart[0].coupon;
    if(cartCoupon) {
        await Coupon.findOneAndUpdate({
            _id: cartCoupon.couponId
        },
        {
            $push: {
                appliedUsers: user._id

            }
        }
    )
    }

    let orderedItems = cart.map(item => {
        return {
            product: item.products.product,
            quantity: item.products.quantity,
            size: item.products.size,
            totalPrice:  item.minimumPrice
        }

    })
    
    let orderAmount = orderedItems.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0 );
    let totalSaved = cart.reduce((acc, item) => acc + item.savedPrice * item.products.quantity, 0);
    totalSaved += (cart[0].coupon?.discount ? cart[0].coupon?.discount: 0); // total price after deducting the coupn discount if there is any discount
    orderAmount -= (cart[0].coupon?.discount ? cart[0].coupon?.discount : 0);
    orderAmount += (cart[0].deliveryCharge ? cart[0].deliveryCharge : 0);
   
    let coupon;

   
    if( !orderAmount > 5000){
    let sourcePincode = '676525';
    // if(cart.deliveryCharge > 0) {
    //    let [sourceCordinate , destinationCordinate] = getCordinates(sourcePincode, userAddress.pincode);
    //    if(!destinationCordinate) {
    //     cart.deliveryCharge = 40
    //    }
    //    let distance = getDistance(sourceCordinate, destinationCordinate);
    //    let deliveryCharge = calculateDeliveryCharge(distance)
    //    cart.deliveryCharge = deliveryCharge;
    // }
    }


    orderedItems.forEach(async (item) => {
     
        let newProduct = await Inventory.findOneAndUpdate({
            product: item.product,
            'sizeVariant.size': item.size
        }, {
            $inc: {
                'sizeVariant.$.stock': -parseInt(item.quantity),
               
            }
        },
            { new: true }
        );

    })
  

    if(cart[0].coupon) {
         coupon = {
            couponId: cart[0].coupon.couponId,
            discount: cart[0].coupon.discount,
        }

    }
    

    if (paymentMethod == 'COD') {

        let order = await Order.create({
            user: user._id,
            address: userAddress,
            paymentMethod,
            paymentStatus: 'Paid',
            orderId,
            coupon,
            totalSaved,
            orderedItems,
            orderAmount,
            deliveryCharge: cart[0].deliveryCharge ?? 0,
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

    } else if (paymentMethod == 'Wallet') {
        let wallet = await Wallet.findOne({ user: user._id });
        if (orderAmount > wallet.balance) {
            return res.status(400)
                .json({
                    success: false,
                    error: true,
                    message: 'Wallet has insufficient balance'
                })
        } else {
            let order = await Order.create({
                user: user._id,
                address: userAddress,
                paymentMethod,
                paymentStatus: 'Paid',
                orderId,
                coupon,
                orderedItems,
                orderAmount,
                totalSaved,
                deliveryCharge: cart[0].deliveryCharge ?? 0,
                orderStatus: 'Placed'
            });
            await Cart.deleteOne({
                user: user._id
            })
            wallet.balance -= order.orderAmount;

            wallet.transactions.push({
                amount: order.orderAmount,
                description: 'Product ordered with wallet ',
                mode: 'Debit'
            })
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
            coupon,
            totalSaved,
            orderAmount,
            deliveryCharge: cart[0].deliveryCharge ?? 0,
            orderStatus: 'Pending'
        });


        await Cart.deleteOne({
            user: user._id
        })
        if (paymentMethod == 'RazorPay') {

            createRazorpayOrder(req, res, order);

        } else if (paymentMethod == 'PayPal') {

            createPayPalPayment(req, res, next, order);

            req.session.orderId = order._id;



        }
       
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
            product:  item.product,
            "sizeVariant.size": item.size

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
                        mode: 'Credit',
                        description: 'Order cancel amount credited ',

                    }
                }

            },
            {
                new: true
            }
        )

    }


    order.isCancelled = true;
    order.cancelDetails = cancelDetails;
    order.orderStatus = 'Cancelled';

    order = await order.save();

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
    let { rating, comment, review, orderId, productId, orderedItemId, size } = req.body;
console.log(req.body)


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
    let product = await Product.findOne({ _id: productId });
    let ratingCount = await Review.countDocuments({product:productId})
    let currentRatingAvg = +product.avgRating;
    let newRatingAvg;

    if (ratingCount != 0) {
        newRatingAvg = ((+ratingCount * +currentRatingAvg) + +rating) / (+ratingCount + 1).toFixed(1);
    } else {
        newRatingAvg = +rating
    }


    let reviewProduct = await Review.create({
        product: productId,
        rating,
        user: user._id,
        comment,
        review,
    })

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

    let { reason, comments, orderId, quantity, price, size, productId,orderedItemId } = req.body;
    let userReturn = await Return.create({
        user: user._id,
        order: orderId,
        size,
        reason,
        returnStatus: 'Requested',
        productId,
        comments,
        quantity,
        productPrice: price,
        orderedItemId


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
    let page = parseInt(req.query.page) - 1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page
    if (!user) return res.redirect('/api/v1/')
    let total = await Order.countDocuments({user: user._id});

    // (page > Math.trunc(total / limit) - 1) ? (page = Math.trunc(total / limit) - 1) : page = page

    let order = await Order.find({
        user: user._id
    })
        .populate('address')
        .populate('orderedItems.product')
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)


    res
        .render('user/myOrders',
            {
                order,
                total,
                page
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

    res.render('user/singleOrderDetails', { order })
})

const downloadOrderInvoice = asyncHandler(async (req, res) => {
    let user = req.session.user;
    let { orderId } = req.body;
    let userDetails = await User.findById(user._id);
    let orderDetails = await Order.findById(orderId).populate('orderedItems.product');
    const data = {
        order: orderDetails,
        user: userDetails,
    }

    let filePath = path.resolve(__dirname, '../views/user/invoice.ejs');

    let html =  fs.readFileSync(filePath).toString();
    const ejsData = ejs.render(html, data);

    let browser = await puppeteer.launch({headless: 'new'});
    let page = await browser.newPage();
    await page.setContent(ejsData, {waitUntil: 'networkidle0'});
    let pdfBytes = await page.pdf( {format: 'letter'});
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        'attachment; filename= orderinvoice.pdf'
    );
    res.send(pdfBytes);

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

const retryOrderPay = asyncHandler(async (req, res) => {
    let orderId = req.body.orderId;
    let order = await Order.findOne({ _id: orderId });
    createRazorpayOrder(req, res, order);
})

const retryPaymentSuccess = asyncHandler(async (req, res) => {
    let { orderId, paymentId } = req.body;
    let order = await Order.findOneAndUpdate({
        _id: orderId
    },
        {
            paymentMethod: 'RazorPay',
            paymentId,
            orderStatus: 'Placed',
            paymentStatus: "Paid",

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
            message: 'Payment complete successfully'
        })
})

const retryPaymentFailure = asyncHandler(async (req, res) => {
    let { orderId } = req.body;
    let order = await Order.findOneAndUpdate({
        _id: orderId
    },
        {
            paymentMethod: 'RazorPay',
            orderStatus: 'Pending',
            paymentStatus: "Failed",

        },
        {
            new: true
        }
    )
    return res.status(200)
        .json({
            success: false,
            error: true,
            data: order,
            message: 'Payment complete successfully'
        })
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
    retryOrderPay,
    retryPaymentSuccess,
    retryPaymentFailure,
    downloadOrderInvoice,
    loadOrderSuccess,



}