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
const { Product, Inventory } = require('../models/productModels')
const Wallet = require('../models/walletModel');
const excelJs =  require('exceljs');



const loadDashboard = asyncHandler(async (req, res) => {
    let now  = new Date();
    let users = await User.countDocuments({})
    let products = await Product.countDocuments({ isListed: true });
    let orders = await Order.countDocuments({ orderStatus: 'Delivered' });
    let revenue = await Order.aggregate([
        {
            $match: {
                orderStatus: 'Delivered'
            }
        },
        {
            $unwind: '$orderedItems'
        },
        {
            $group: {
                _id: null,
                revenue: {
                    $sum: '$orderedItems.totalPrice'
                }
            }

        }

    ]);

   
    let topTenCetagory = await findTopTen('Category')
    let topTenBrand = await findTopTen('Brands')
    // let topTenCetagory = await findTopTen('Category')

    async function findTopTen(filter) {

        let result = await Order.aggregate([

            {
                $match: {
                    orderStatus: 'Delivered'
                }
            },
            {
                $unwind: '$orderedItems'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderedItems.product',
                    foreignField: '_id',
                    as: 'product'


                }
            },
            {
                $unwind: '$orderedItems.product'
            },
            {
                $unwind: '$product'

            },
            {
                $group: {
                    _id: `$product.category.${filter}`,
                    sum: {
                        $sum: 1
                    }
                }
            }, {
                $sort: {
                    sum: -1
                }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0,
                    item: '$_id',
                    sum: 1
                }
            }

        ])

        return result.map(item => {
            return {
                item: item.item[0],
                count: item.sum
            }
        })
    }

    let topSellingProduct = await Order.aggregate([

        {
            $match: {
                orderStatus: 'Delivered'
            }
        },
        {
            $unwind: '$orderedItems'
        },
        {
            $group: {
                _id: '$orderedItems.product',
                count: {
                    $sum: 1
                }
            }
        },
        {
            $sort: {
                count: -1
            }
        },
        {
            $limit: 10
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
                
            }
        },
        {
            $unwind: '$product'
        }
    ])

    let monthlyDataAggre = await Order.aggregate([
       
        {
            $match: {
                orderStatus: 'Delivered'
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%m',
                        date: '$createdAt'
                    }
                },
                totalAmount: {
                    $sum: '$orderAmount'
                }
            }
        },
 
    ])
    let monthlyData = Array.from({length: 12}).fill(0);
    monthlyDataAggre.forEach(item => {
        let monthIndex = parseInt(item._id, 10);
        if(monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex] = item.totalAmount
        }
    })
   monthlyRevenue = monthlyDataAggre.find(item => item._id ==  now.getMonth()+1).totalAmount 

    res.status(200)
        .render('admin/adminDashboard', { userCount: users, orderCount: orders, product: products, revenue: revenue[0].revenue, monthlyRevenue, monthlyData, name: topSellingProduct, brand: topTenBrand, topTenCetagory: topTenCetagory });
})

const getFilterData = asyncHandler( async (req, res) => {
    console.log(req.body);
    const data = requiredMonth = req.body.data;
    const startDay = new Date(requiredMonth + '-01T00:00:00Z');
    const endDay = new Date(requiredMonth + '-31T23:59:59Z');

    const monthData = await Order.aggregate([
        {
            $match: {
                orderStatus: 'Delivered',
                createdAt: {
                    $gte: startDay,
                    $lt: endDay
                }
            }
        },
        {
            $unwind: '$orderedItems'
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%d',
                        date: '$createdAt'
                    }
                },
                totalAmount: {
                    $sum: '$orderAmount'
                }
            }
        },
])
const newData = Array({length: 30}).fill(0);

monthData.forEach(item => {
    monthIndex = parseInt(item._id, 10) -1;
    if(monthIndex >= 0 && monthIndex < 30) {
        newData[monthIndex] = item.totalAmount;
    }
});
 res.status(200)
 .json({
    success: true,
    newData,
    data,
    error: false,
    message: 'filter data fetched successfully'

 })
})

const loadSalesReport = asyncHandler(async (req, res) => {
    let query = {orderStatus: 'Delivered'};
    if(req.query.startDate) {
        const {startDate, endDate} = req.query;
        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        query = {
            orderStatus: 'Delivered',
            createdAt: {
                $gte: sDate,
                $lt: eDate
            }
        }
    }
    const report = await Order.find(query).populate('orderedItems.product')
    res.render('admin/salesreport', {report})
})

const salesReportDownLoadExcel = asyncHandler( async (req, res) => {
    let query = {orderStatus: 'Delivered'};
    if(req.query.startDate) {
        const {startDate, endDate} = req.body;
        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        query = {
            orderStatus: 'Delivered',
            createdAt: {
                $gte: sDate,
                $lt: eDate
            }
        }
    }
    let report = await Order.aggregate([
        {
            $match: query
        },
        {
            $unwind: '$orderedItems'
        
        },
        {
            $lookup: {
                from: 'products',
                localField: 'orderedItems.product',
                foreignField: '_id',
                as: 'products'
            }
        },
        {
            $unwind: '$products'
        },
        {
            $group: {
                _id: '$orderId',
                item:{ $first: '$$ROOT'}
            }
        },
        // {
        //     $project: {
        //         orderId: 1,

        //     }
        // }

        
       
    ])
    console.log(report)

       

    const workBook = new excelJs.Workbook();
    const workSheet = workBook.addWorksheet('Report');
    const destinationPath = path.join(__dirname,'../../public/excelSheets');
    workSheet.columns = [
        {header: "S no.", key: "s_no", width: 10},
        {header: "OrderId", key: "o_id", width: 10},
        {header: "Proudct Details", key: "product_details", width: 30},
        {header: "Order price", key: "order_price", width: 10},
        {header: "Payment Method", key: "payment_method", width: 10},
        {header: "Date", key: "date", width: 10},


    ]
    report = report.map(item => {

    })

   
    
    // let counter = 1;
    // report.forEach(item => {
    //     item
    // })

    

})


const loadLogin = asyncHandler(async (req, res) => {
    if (req.session.admin) {
        res.redirect('/api/v1/admin')
    }
    if (req.query.LogoutMessage) {
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
    let page = parseInt(req.query.page) - 1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await User.countDocuments({});


    // (page > Math.trunc(total / limit) -1) ? ( page =  Math.trunc(total / limit) -1) : page = page

    const customers = await User.find({}).sort({ createdAt: -1 }).skip(page * limit).limit(limit)

    res
        .render('admin/userManagement', { customers, page, total })



})

const loadOrders = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) - 1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await Order.countDocuments({});



    let order = await Order.find({})
        .populate('user')
        .populate('address')
        .populate('orderedItems.product')
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)

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
    res
        .render('admin/singleOrderDetials',
            {
                order
            })


})





const loadCoupons = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) - 1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await Coupon.countDocuments({});


    let coupon = await Coupon.find({}).skip(limit * page).limit(limit);

    res.render('admin/couponManagement', { coupon, total, page });
})



const loadReturns = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) - 1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await Return.countDocuments({});


    let returns = await Return.find({})
        .populate('productId', 'images title')
        .populate('user', 'name  email')
        .populate('order')
        .skip(limit * page)
        .limit(limit)
    console.log(returns)

    res.render('admin/returnRequest', { returns, total, page });
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
        if (['PayPal', 'RazorPay', 'Wallet'].includes(order.paymentMethod)) {
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

    return res.json({
        success: true,
        result: order,
        error: null,
        message: 'Order status changed Successfully.'
    })



})

const createCoupon = asyncHandler(async (req, res) => {

    let { name: title, description, discount, minOrder: minCost, edate: expiryDate, limit } = req.body;
    let firstCode = title.split(' ')[0];
    let middleCode = generateRandomString(4);
    let lastCode = discount;
    let couponCode = firstCode + middleCode + lastCode;
  
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
    let page = parseInt(req.query.page) - 1 || 0;
    let limit = parseInt(req.query.limit) || 7;
    page < 0 ? (page = 0) : page = page

    let total = await Offer.countDocuments({});


    let offers = await Offer.find({})
        .populate('productIds', 'title images')
        .skip(page * limit)
        .limit(limit)

    res.render('admin/offerManagement', { offers, page, total })

})

const loadBanners = asyncHandler(async (req, res) => {
    let page = parseInt(req.query.page) - 1 || 0;
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
  
})


const editBanner = asyncHandler(async (req, res) => {
    let { name, description, url, id } = req.body;


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

const getOfferData = asyncHandler(async (req, res) => {
    let { offerType } = req.body;
    if (offerType == 'product') {
        let product = await Product.find({ isListed: true });

        if (product) {
            return res.status(200)
                .json({
                    success: true,
                    error: false,
                    productData: product,
                    message: 'Products fetched successfully'
                })
        }
    } else {
        let category = await Category.findOne({ title: 'Category' });

        let categoryData = category?.subCategories
        console.log(categoryData)
        if (categoryData) {
            return res.status(200)
                .json({
                    success: true,
                    error: false,
                    categoryData,
                    message: 'Products fetched successfully'
                })
        }

    }
})

const createOffer = asyncHandler(async (req, res) => {
    console.log(req.body)
    let { name, description, edate, offertype, discount, selecteditems } = req.body;
    if (offertype == 'product') {
        let offer = await Offer.create({
            title: name,
            description,
            endDate: edate,
            discount,
            productIds: selecteditems
        })
    } else {
        let offer = await Offer.create({
            title: name,
            description,
            endDate: edate,
            discount,
            appliedCategory: selecteditems

        })
    }
    res.status(201)
        .redirect('/api/v1/admin/offers')
})

const listAndUnlistOffer = asyncHandler(async (req, res) => {
    let { id } = req.body
    let offer = await Offer.findOne({ _id: id })

    if (offer.isListed == true) {
        offer = await Offer.findOneAndUpdate({
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
        offer = await Offer.findOneAndUpdate({
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
            data: offer,
            message: 'Coupn updated successfully'
        })
})

const editOffer = asyncHandler(async (req, res) => {
 
    const { name, id, description, discount, edate } = req.body;

    const offer = await Offer.findOneAndUpdate({
        _id: id,
    },
        {
            $set: {
                title: name,
                description,
                discount,
                endDate: edate,


            }
        },
        {
            new: true
        }
    )
    res.redirect('/api/v1/admin/offers')
  
})




const returnChangeStatus = asyncHandler(async (req, res) => {
    console.log(req.body)
    let { returnId, status } = req.body;
    let returns = await Return.findOne({ _id: returnId })
    if (!returns.returnStatus == 'Requested') {
        return res.status(500)
            .json({
                success: false,
                error: true,
                message: 'Something went wrong'
            })
    }

    if (status == 'Accepted') {
        let wallet = await Wallet.findOneAndUpdate({
            user: new mongoose.Types.ObjectId(returns.user)
        },
            {
                $inc: {
                    balance: returns.productPrice
                },
                $push: {
                    transactions: {


                        amount: returns.productPrice,
                        mode: 'Debit',
                        description: 'Product return accepted'
                    }
                }

            },
            {
                new: true
            }

        )

        await Inventory.findOneAndUpdate({
            product: returns.product,
            'sizeVariant.size': returns.size 
        },
    {
        $inc: {
            'sizeVariant.$.stock': returns.quantity,
            totalStock: returns.quantity

        }
    })


    }


    let order = await Order.findOneAndUpdate({
        _id: returns.order,
        'orderedItems._id': returns.orderedItemId
    }, {
        $set: {
            'orderedItems.$.returnStatus': status
        }
    })

    returns.returnStatus = status;
    returns = await returns.save();

    return res.json({
        success: true,
        errer: false,
        message: 'Return status updated successfully'
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
    listAndUnlistBanner,
    getOfferData,
    createOffer,
    editOffer,
    listAndUnlistOffer,
    returnChangeStatus,
    loadSalesReport,
    getFilterData,
    salesReportDownLoadExcel,



}