const mongoose = require('mongoose');

const ApiError = require('../utilities/apiError');
const ApiResponse = require('../utilities/apiResponse');
const asyncHandler = require('../utilities/asyncHandler');
const {Order, OrderReturn, Review} = require('../models/orderModels');
const Coupon = require('../models/couponModel');
const User = require('../models/userModel');
const Offer = require('../models/offerModel');
const Address = require('../models/addressModel');



const loadDashboard = asyncHandler(async (req, res) => {

    res
        .status(200)
        .render('admin/adminDashboard');
})


const loadLogin = asyncHandler(async (req, res) => {
    if (req.session.admin) {
        res.redirect('/api/v1/admin')
    }
    if (req.query.LogoutMessage) {
        console.log(req.query.LogoutMessage)
        res
            .render('admin/adminLogin', {
                LogoutMessage: req.params.LogoutMessage
            });
    } else {
        res
            .render('admin/adminLogin');
    }
})

const checkAuthentic = asyncHandler(async (req, res) => {
    email = process.env.ADMIN_EMAIL;
    password = process.env.ADMIN_PASSWORD;
    if (email == req.body.email) {

        if (password == req.body.password) {
            req.session.admin = req.body.email;
            res.redirect('/api/v1/admin')

        } else {
            req.flash('passwordError', 'Invalid password!. try again.');
            res.redirect('/api/v1/admin/login')

        }


    } else {
        req.flash('emailError', 'Invalid email!. try again.');
        res.redirect('/api/v1/admin/login');
    }
})




const loadCustomers = asyncHandler(async (req, res) => {

    const customers = await User.find({}).sort({createdAt:-1});
    console.log('fetched the customers');
    res
        .render('admin/userManagement', { customers })



})

const loadOrders = asyncHandler(async (req, res) => {

    let order = await Order.find({})
        .populate('user')
        .populate('address')
        .populate('orderedItems.product')
        .sort({createdAt:-1});
    console.log(order)
    res
        .render('admin/order-details', {
            order
        });

})

const loadSingleOrderDetails = asyncHandler(async (req, res) => {

    let orderId = req.query.id
    let order = await Order.findOne({
        _id: orderId
    })
        .populate('user')
        .populate('address')
        .populate('orderedItems.product');
    js = JSON.parse(JSON.stringify(order))

    console.log(js);
    res
        .render('admin/singleOrderDetials',
            {
                order
            })


})





const loadCoupons = asyncHandler(async (req, res) => {
    let coupon =  null;
    let couponLength = 0;
    let page = 0;
    res.render('admin/couponManagement', {coupon, couponLength, page});
})



const loadReturns = asyncHandler(async (req, res) => {

    res.render('admin/returnRequest');
})




const blockOrUnblockUser = asyncHandler(async (req, res, next) => {
    let { id } = req.body;
    return User.findOne({ _id: id })
        .then((user) => {
            if (user.isBlocked) {

                return User.updateOne(
                    { _id: id },
                    {
                        $set: {
                            isBlocked: false
                        }
                    })

            } else {
                return User.updateOne(
                    { _id: id },
                    {
                        $set:
                            { isBlocked: true }
                    }
                )
            }

        }).then(() => {
            res.json({ block: true })
        })
        .catch((error) => {
            console.log(error)
        })

})










const changeOrderStatus = asyncHandler(async (req, res, next) => {
   

        let { orderId, productId, index, status, userId } = req.body
        let order = await Order.findOneAndUpdate({ _id: orderId }, { $set: { orderStatus: status } }, { new: true });
        console.log(order);
        return res.json({
            success: true,
            result: order,
            error: null,
            message: 'Order status changed Successfully.'
        })


    
})




















module.exports = {
    loadDashboard,
    loadLogin,
    checkAuthentic,
    loadCustomers,
    loadOrders,
    loadCoupons,
    loadReturns,
    loadSingleOrderDetails,
    blockOrUnblockUser,
    changeOrderStatus,

}