const mongoose = require('mongoose');


const CouponSchema = mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true,

    }, description: {
        type: String,
        required: true,
    }
    ,
    title: {
        type: String,
        required: true,

    }, discount: {
        type: Number,
        required: true,

    },
    expiryDate: {
        type: Date,
        required: true,

    }, isListed: {
        type: Boolean,
        default: true

    }, minCost: {
        type: Number,

    }, appliedUsers: {
        type: Array,

    },
    limit: {
        type: Number,
        required: true
    }

},
    {
        timestamps: true
    });

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;