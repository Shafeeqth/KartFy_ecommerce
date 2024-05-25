const mongoose = require('mongoose');
const Coupon = require('../models/couponModel');
const { Cart, Wishlist } = require('../models/CartAndWishlistModel');
const asyncHandler = require('../utilities/asyncHandler');

const checkValidCoupon = asyncHandler(async (req, res, next) => {
    let user = req.session.user;
    if (!user) return false

    let cart = await Cart.findOne({ user: user._id }).populate('products.product','price -_id');
    let cartTotal = cart?.products.reduce((acc, item) => acc + item.product.price * item.quantity,0);
    if (!cart) return res.status(500)
    if (cart.isCouponApplied == false) {
        return res.status(200)
            .json({
                success: true,
                error: false,
                message: 'No coupon found'
            })
    }
    let coupon = await Coupon.findOne({ _id: cart.coupon.couponId });
    let today = new Date()

    if (coupon.minCost > cartTotal) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Cart balance is less than Coupon min Amount'

            })

    }
    if (coupon.expiryDate < today) {
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


const addCoupon = asyncHandler(async (req, res, next) => {
    let code = req.body.code;
    let user = req.session.user;
    let coupon = await Coupon.findOne({ 
        couponCode: code
    })
    let cart = await Cart.findOne({ user: user._id }).populate('products.product','price -_id');
    let cartTotal = cart.products.reduce((acc, item) => acc + item.product.price * item.quantity,0);
   
    console.log('coupon', coupon)
    let now = new Date;

    if (!coupon) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon not found!'
            })
    }
    let expiryDate = new Date(coupon.expiryDate)
    if (cartTotal < coupon.minCost) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Order amount is less than coupn Min Order amount!'
            })

    }
    if (now.getTime() > expiryDate.getTime()) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon is expired!'
            })

    }
    if (coupon.appliedUsers.includes(user._id)) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'You have already rediemed this coupon!'
            })

    }
    if (!coupon.limit) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Coupon limit is over!'
            })

    }
    coupon.limit -= 1;
    await coupon.save()


    let discount = Math.floor((coupon.discount * cartTotal) / 100)
    cart.isCouponApplied = true;
    cart.coupon = {
        code: coupon.couponCode,
        couponId: coupon._id,
        discount,
    }
    cart = await cart.save();
    return res.status(200)
        .json({
            success: true,
            error: false,
            data: cart,
            message: 'Coupon rediemed!'
        })


});


const removeCoupon = asyncHandler(async (req, res, next) => {
    let { discount } = req.body;
    let user = req.session.user._id
    console.log(discount);

    let cart = await Cart.findOneAndUpdate({
         user
    },
        {
            $set: {
                isCouponApplied: false,

            },
            $unset: {
                coupon: ""

            },
           
        }

    )
   
    return res.json({
        success: true,
        error: true,
        message: 'Coupon removed successfully'
    })
})



module.exports = {
    checkValidCoupon,
    removeCoupon,
    addCoupon,


   
}
