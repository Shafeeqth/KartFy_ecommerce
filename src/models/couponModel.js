const mongoose = require('mongoose');


const CouponSchema = mongoose.Schema({
    couponCode: {
        type: String,
        required: true,

    }, description: {
        type: String,
        required: true,
    }
    ,
    couponName: {
        type: String,
        required: true,

    }, discount: {
        type: String,
        required: true,

    },
    couponExp: {
        type: Date,
        required: true,

    }, isListed: {
        type: Boolean,

    }, minConst: {
        type: Number,

    }, appliedUsers: {
        type: Array,

    }

},
    {
        timestamps: true
    });

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;