const mongoose = require('mongoose');


const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }, orderedItems: [{
        type: {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            size: {
                type: String,
                required: true,
            },
            totalPrice: {
                type: Number,
                required: true

            },
            isReviewed: {
                type: Boolean,
                default: false,
            },
            returnStatus: {
                type: String,
                default: 'False',
                enum: ['Requested', 'Accepted','Rejected', 'False']
            },
        }
    }],totalSaved: {
        type: String,
        required: false,
        default: 0
    },
     orderAmount: {
        type: Number,
        required: true
    }, address: {
        type: Object,
        required: true,
    }, paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'PayPal', 'RazorPay', 'Wallet']

    },
    paymentId: {
        type: String,
    },
    paymentStatus: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Paid', 'Failed', 'Refunded']

    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Placed'],
        default: 'Pending'
    },
    orderId: {
        type: Number,
        required: true,


    },
    deliveryCharge: {
        type: Number,
        default: 0,

    },
    appliedOffer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',


    },
    appliedCoupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    },
    isCancelled: {
        type: Boolean,
        default: false,
    },
    cancelDetails: {

        type: {
            reason: {
                type: String,
                required: true
            },
            comment: {
                type: String,
                required: false
            }
        }
    }



},
    {
        timestamps: true
    });

const Order = mongoose.model('Order', orderSchema);

const returnShcema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,

    },
    orderedItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,

    },
    reason: {
        type: String,
        required: true

    },
    comments: {
        type: String,
        required: false

    }
},
{
    timestamps: true
})

const Return = mongoose.model('Return', returnShcema);


const reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }, product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }, rating: {
        type: Number,
    }, review: {
        type: String,
        required: true,
    }, dateAt: {
        type: Date,
        default: Date.now(),
    }

});

const Review = mongoose.model('Review', reviewSchema);


module.exports = {
    Order,
    Return,
    Review,


}