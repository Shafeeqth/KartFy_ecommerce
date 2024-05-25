const { required } = require('joi');
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
        type: Number,
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
        enum: ['Pending', 'Shipped', 'Delivered', 'Out For Delivery', 'Cancelled', 'Placed'],
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
    coupon: {
        type: {
            couponId: {
                type: mongoose.Schema.Types.ObjectId,
        
            },
            discount:{
                type: Number
            }
        },
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

// orderSchema.pre('save', function(next) {
//     this.totalSaved = this.appliedCoupon?.discount ?? 0 + this.appliedOffer?.discount ?? 0
//     next()
// })

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
    size: {
        type: String,
        required: true,

    },
    productPrice: {
        type: Number,
        required: true,

    },
    quantity: {
        type: String,
        required: true,

    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,

    },
    returnStatus: {
        type: String,
        default: 'False',
        enum: ['Requested', 'Accepted','Rejected', 'False']
    },
    reason: {
        type: String,
        required: true

    },
    comments: {
        type: String,
        required: false

    },
    orderedItemId:{
        type: mongoose.Schema.Types.ObjectId,

    }
},
{
    timestamps: true
})

const Return = mongoose.model('Return', returnShcema);


const reviewShcema = mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',

    },rating:{
        type: Number,
        required: true,

    },user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    review:{
        type: String,
        required: true,
    },
    comment:{
        type: String,
        required: false,
    },
    
},
{
    timestamps: true
})

const Review = mongoose.model('Review', reviewShcema);


module.exports = {
    Order,
    Return,
    Review,


}