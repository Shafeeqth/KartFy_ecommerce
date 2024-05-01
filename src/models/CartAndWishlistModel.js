
const { required } = require('joi');
const mongoose = require('mongoose');

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
            type: Number
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
            discount: {
                type: Number,
                required: true

            }
        }


    }
},
    {
        timestamps: true
    });

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