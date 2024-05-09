

const mongoose = require('mongoose');
const Coupon = require('../models/couponModel');
const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    }, products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }, quantity: {
            type: Number,
            required: true,
            default: 1
        },
        size: {
            type: String,
            required: true
        },
        totalPrice: {
            type: Number,

        }

    }],
    isCouponApplied: {
        type: Boolean,
        default: false
    },
    coupon: {
        type: {
            name: {
                type: String,
                required: true
            },
            code: {
                type: String,
                required: true
            }
            ,
            discount: {
                type: Number,
                required: true

            }
        }


    },
    deliveryCharge: {
        type: Number,
        required: false,
        default: 0
    },
    cartTotal: {
        type: Number,
        required: true,
    }
},
    {
        timestamps: true
    });
cartSchema.pre('save', async (next) => {
    if(this.isCouponApplied === true) {
        this.isCouponApplied = false;
        this.cartTotal -= this.coupon.discount;
        delete this.coupon

    }
    next();
})

const Cart = mongoose.model('Cart', cartSchema);



const wishlistSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }, product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = {
    Wishlist,
    Cart,
}