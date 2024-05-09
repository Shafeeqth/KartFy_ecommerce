const mongoose = require('mongoose');

const ApiError = require('../utilities/apiError');
const ApiResponse = require('../utilities/apiResponse');
const asyncHandler = require('../utilities/asyncHandler');
const { Order, OrderReturn, Review, Return } = require('../models/orderModels');
const Coupon = require('../models/couponModel');
const User = require('../models/userModel');
const Offer = require('../models/offerModel');
const Address = require('../models/addressModel');
const { v4: uuidv4, v5: uuidv5 } = require('uuid');
const Category = require('../models/categoryModel');
const Banner = require('../models/bannerModel');
const path = require('node:path');
const sharp = require('sharp');
const Wallet = require('../models/walletModel');
const { pipeline } = require('node:stream');



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
    let page = parseInt(req.query.page) -1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await User.countDocuments({});


    // (page > Math.trunc(total / limit) -1) ? ( page =  Math.trunc(total / limit) -1) : page = page

    const customers = await User.find({}).sort({ createdAt: -1 }).skip(page * limit).limit(limit)

    res
        .render('admin/userManagement', { customers, page, total })



})

const loadOrders = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) -1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await Order.countDocuments({});


    // (page > Math.trunc(total / limit) -1) ? ( page =  Math.trunc(total / limit) -1) : page = page


    let order = await Order.find({})
        .populate('user')
        .populate('address')
        .populate('orderedItems.product')
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
    console.log(order)
    res
        .render('admin/order-details', {
            order,
            page,
            total
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
    let page = parseInt(req.query.page) -1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await Coupon.countDocuments({});


    let coupon = await Coupon.find({}).skip(limit * page).limit(limit);
    

    console.log(coupon)
    res.render('admin/couponManagement', { coupon, total, page });
})



const loadReturns = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) -1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await Return.countDocuments({});


    let returns = await Return.find({})
            .populate('productId')
            .populate('user')
            .populate('order')
            .skip(limit * page)
            .limit(limit)
    console.log(returns)
   
    res.render('admin/returnRequest', {returns, total, page});
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


    let { orderId, productId, index, status, userId, orderAmount } = req.body;
    let order = await Order.findOneAndUpdate({
        _id: orderId
    },
        {
            $set: {
                orderStatus: status
            }
        },
        {
            new: true
        });
    if (status == 'Cancelled') {
        if(['PayPal', 'RazorPay', 'Wallet'].includes(order.paymentMethod)) {
            let wallet = await Wallet.updateOne({
                user: userId
            }, {
                $inc: {
                    balance: order.orderAmount
    
                },
                $push: {
                    transactions: {
                        mode: 'Debit',
                        amount: order.orderAmount,
                        description: 'Order canceled by admin amount debited ',

                    }
                }
            })

        }
        
    }

    console.log(order);
    return res.json({
        success: true,
        result: order,
        error: null,
        message: 'Order status changed Successfully.'
    })



})

const createCoupon = asyncHandler(async (req, res) => {

    let { name: title, description, discount, minOrder: minCost, edate: expiryDate, limit } = req.body;
    console.log('title', title, description, discount, minCost, expiryDate, limit)
    let firstCode = title.split(' ')[0];
    let middleCode = generateRandomString(4);
    let lastCode = discount;
    let couponCode = firstCode + middleCode + lastCode;
    console.log(firstCode, middleCode, lastCode)
    console.log('coupn', couponCode);

    await Coupon.create({
        title,
        description,
        discount,
        minCost,
        expiryDate,
        limit,
        couponCode

    })
    return res.redirect('/api/v1/admin/coupons')
    // return res.status(200)
    //     .json({
    //         success: true,
    //         error: false,
    //         message: 'Coupon created successfully'
    //     })

    // let uuid = uuidv4();
    // console.log(uuid, firstTitle)

    function generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }


});

const editCoupon = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { name, id, description, discount, minOrder, edate, limit } = req.body;

    const coupon = await Coupon.findOneAndUpdate({
        _id: id,
    },
        {
            $set: {
                title: name,
                description,
                discount,
                expiryDate: edate,
                limit,
                minCost: minOrder

            }
        },
        {
            new: true
        }
    )
    res.redirect('/api/v1/admin/coupons')
    // return res.status(200)
    //     .json({
    //         success: true,
    //         error: false,
    //         data: coupon,
    //         message: 'Coupon edited successfully'
    //     })
})


const listAndUnlistCoupon = asyncHandler(async (req, res) => {
    let { id } = req.body
    let coupon = await Coupon.findOne({ _id: id })

    if (coupon.isListed == true) {
        coupon = await Coupon.findOneAndUpdate({
            _id: id,
        },
            {
                $set: {
                    isListed: false
                }
            },
            {
                new: true
            }

        )
    } else {
        coupon = await Coupon.findOneAndUpdate({
            _id: id
        },
            {
                $set: {
                    isListed: true
                }
            },
            {
                new: true
            }

        )
    }
    return res.status(200)
        .json({
            success: true,
            error: false,
            data: coupon,
            message: 'Coupn updated successfully'
        })
})


const loadOffers = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) -1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await Offer.countDocuments({});


    let offers = Offer.find({}).skip(page * limit).limit(limit)
    let categories = await Category.find({ isListed: true }).select('title subCategories');
    console.log('categories', categories);
    res.render('admin/offerManagement', { categories, offers, page, total })

})

const loadBanners = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) -1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await Coupon.countDocuments({});


    let banners = await Banner.find({}).skip(limit * page).limit();

    console.log('categories', banners);
    res.render('admin/bannerManagement', { banners, page, total })

})

const createBanner = asyncHandler(async (req, res) => {
    let { name, description, url } = req.body;
    let cropPath = path.join(__dirname, '../../public/Data/banners/sharped');
    let crop = await sharp(req.file.path).resize(1600, 900).toFile(`${cropPath}/${req.file.originalname}`);

    let banner = await Banner.create({
        title: name,
        description,
        url,
        image: req.file.originalname
    })
    return res.status(201)
        .redirect('/api/v1/admin/banners')
    // .json({
    //     success: true,
    //     error: false,
    //     message: 'Banner created successfylly'
    // })
    // .then((result) => {
    //     console.log(result);
    // })
    // .catch((error) => {
    //     console.log(error);
    // })
    console.log(req.file)

})


const editBanner = asyncHandler(async (req, res) => {
    let { name, description, url, id } = req.body;
    console.log(req.body)
    console.log(req.file)
    // return     

    if (req.file) {
        let cropPath = path.join(__dirname, '../../public/Data/banners/sharped');
        let crop = await sharp(req.file.path).resize(1600, 900).toFile(`${cropPath}/${req.file.originalname}`);


        let newBanner = await Banner.findOneAndUpdate({
            _id: id
        },
            {
                $set: {
                    title: name,
                    description,
                    url,
                    image: req.file.originalname
                }
            }
        )
    } else {
        let newBanner = await Banner.findOneAndUpdate({
            _id: id
        },
            {
                $set: {
                    title: name,
                    description,
                    url
                }
            },
            {
                new: true
            }
        )

    }
    return res.status(200)
        .redirect('/api/v1/admin/banners')
    // .json({
    //     success: true,
    //     error: false,
    //     data: newBanner,
    //     message: 'Banner updated successfully'
    // })

})

const listAndUnlistBanner = asyncHandler(async (req, res) => {
    const { bannerId } = req.body;

    let banner = await Banner.findOne({
        _id: bannerId
    })
    if (banner.isListed == true) {
        banner.isListed = false
    } else {
        banner.isListed = true
    }
    banner = await banner.save();

    return res.status(200)
        .json({
            success: true,
            error: false,
            data: banner,
            message: 'Banner updated successfully'
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
    createCoupon,
    editCoupon,
    listAndUnlistCoupon,
    loadOffers,
    loadBanners,
    createBanner,
    editBanner,
    listAndUnlistBanner



}