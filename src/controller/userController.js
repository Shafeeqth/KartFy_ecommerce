const mongoose = require('mongoose');
const ApiError = require('../utilities/apiError');
const ApiResponse = require('../utilities/apiResponse');
const asyncHandler = require('../utilities/asyncHandler');
const { Order, OrderReturn, Review } = require('../models/orderModels');
const Coupon = require('../models/couponModel');

const User = require('../models/userModel');
const Offer = require('../models/offerModel');
const Address = require('../models/addressModel');
const Category = require('../models/categoryModel');
const { Product, Inventory } = require('../models/productModels');
const { Cart, Wishlist } = require('../models/CartAndWishlistModel');
const { pipeline } = require('nodemailer/lib/xoauth2');
const Wallet = require('../models/walletModel');
const Banner = require('../models/bannerModel');


const loadHome = asyncHandler(async (req, res) => {
    let user = req.session.user ? req.session.user : null;
    let banners = await Banner.find({isListed: true})
    console.log(banners)

    res.status(200).render('user/homePage', { user ,banners});


})


const loadShop = asyncHandler(async (req, res) => {

    let inventories = await Inventory.aggregate([
        {
            $lookup: {
                from: 'products', // The collection name in MongoDB (plural of the model name)
                localField: 'product',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        {
            $unwind: '$productDetails' // Unwind the array to include product details
        },
        {
            $addFields: {
                totalStock1: { 
                    $sum: '$sizeVariant.stock' // Sum up all the stock values
                }
            }
        },
        // {
        //     $project: {
        //         product: 1,
        //         sizeVariant: 1,
        //         totalStock: 1,
        //         'productDetails.title': 1,
        //         'productDetails.category': 1,
        //         'productDetails.mrpPrice': 1,
        //         'productDetails.price': 1,
        //         'productDetails.description': 1,
        //         'productDetails.color': 1,
        //         'productDetails.images': 1,
        //         'productDetails.isListed': 1,
        //         'productDetails.soldCount': 1,
        //         'productDetails.avgRating': 1,
        //         'productDetails.createdAt': 1,
        //         'productDetails.updatedAt': 1
        //     }
        // }
    ]);
    return console.log(inventories)
    console.log(req.query)
    let user = req.session.user ? req.session.user : null;
    let page = parseInt(req.query.page) -1 || 0;
    let limit = parseInt(req.query.limit) || 15;
    let category =  (Array.isArray(req.query.Category) ? req.query.Category : req.query.Category?.split(' '));
    let size = req.query.size || [];
    let gender = (Array.isArray(req.query.Gender) ? req.query.Gender : req.query.Gender?.split(' '));
    let brand = (Array.isArray(req.query.Brands) ? req.query.Brands : req.query.Brands?.split(' '));
    let categor = [];
    if(gender)categor.push({'product.category.Gender':{$in: gender }});
    if(category)categor.push({'product.category.Category': {$in:category}})
    if(brand)categor.push({'product.category.Brands':{$in: brand}})
    let matchValue = {}; 
    let sort = req.query.sort?.trim() || ''

    let search =req.query.search ?String( req.query.search).trim() : ''
     search ? (search = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')): (search = '')
    if(gender ||category|| brand) {
        matchValue = {
            $or: categor
        }
        
    }


    if(sort == 'high to Low') {
        sort = { 'product.price': -1}
    }else if(sort == 'low-to-High') sort = { 'product.price': 1}
    else if(sort == 'date') sort = { 'product.createdAt': -1}
    else if(sort == 'rating' || sort == '') sort = { 'product.avgRating': -1}

    
    

    

    let categories = await Category.find({isListed: true})
 

    

    let inventory = await Inventory.aggregate([
        {
            $lookup: {
                from: 'products', 
                localField: 'product',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $match: {
                'product.isListed': true
            }
        },
        {
            $unwind: '$product'
        },
        {
            $match: matchValue
        },
        {
            $match: {
                'product.title': { $regex: search, $options: "i" },

            }
        },
        {
            $addFields: {
                category: {
                    $first: "$product.category.Gender"
                }
            }
        },
        {
            $sort: sort
        },
        {
            $skip: page * limit
        },
        {
            $limit: limit
        }
        
    ])
    

    let count = await Product.countDocuments()
    
    res.render('user/shopPage', { user, inventory, count , categories});



})

const loadWishlist = asyncHandler(async (req, res) => {


    let user = req.session.user ? req.session.user : null;

    let wishlist = await Wishlist.find({ user: user._id }).populate('product');
    console.log('wishlist', wishlist);

        res.render('user/wishlistPage', { user, wishlist });





})

const loadCart = asyncHandler(async (req, res) => {
    
  
    let user = req.session.user ? req.session.user : null;
    let cart = await Cart.findOne({ user }).populate('products.product');
    console.log((cart))

    res.render('user/cartPage', { user, cart });


})

const loadCheckout = asyncHandler(async (req, res) => {
    // if(! req.session.allowedToCheckout) {
    //     return res.status(401)
    //     .redirect('/api/v1/')

    // }
    const referrer = req.get('Referrer');
    console.log(referrer)
    if (!referrer || !referrer.includes('/cart')) {
        console.log('comes here');
        return res.status(401)
        .redirect('/api/v1/')
      
    }


    let user = req.session.user ? req.session.user : null;

    if (user) {
        let cartData = await Cart.findOne({ user }).populate('products.product') 
        cartData = cartData ?? []
        let address = await Address.find({ user });
        address = address ?? []
        let coupons = await Coupon.find({isListed: true})
        let wallet = await Wallet.findOne({user:user._id}).select('balance');
        coupons = coupons ?? []
        res.render('user/checkoutPage', { user, cartData, address, coupons, wallet });

    }
    



})

const loadProductDetail = asyncHandler(async (req, res) => {
    
    let productId = req.query['id'];
    console.log(productId)

    let user = req.session.user ? req.session.user : null;
    let product = await Inventory.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId)

            }
        },
        {
            $lookup: {
                from: 'reviews',
                localField: 'product',
                foreignField: 'product',
                 as: 'reviews',
                 pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'user',
                            foreignField: '_id',
                             as: 'user',
                             pipeline: [{
                                
                                $project: {
                                    name: 1
                                }
                        }]
                
                        }
            
                    },
                 ]
    
            }
        },
        {
        $lookup: {
             from: 'products',
             localField: 'product',
             foreignField: '_id',
             as: 'product'
             }
        
        },
        {
            $unwind: '$product'
        }
       
        ])

    // console.log(product.product.productReviews)
    const sizeVariant = JSON.stringify(product[0].sizeVariant)

    res.status(200).render('user/productDetail', { user, product :product[0],sizeVariant });



})


const loadProfile = asyncHandler(async (req, res, next) => {

    let user = req.session.user ? req.session.user : null;
    if (user) {
        let wallet = await Wallet.findOne({user: user._id }).populate('user')
        wallet.transactions.sort((a, b) => b.date - a.date)
        let userProfile = await User.aggregate([
            {
                $match: {
                    email: user.email
                }
            },
           
            {
                $lookup: {
                    from: 'addresses',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'addresses'
                }
            },





        ])
        console.log(userProfile)
        res.render("user/userProfile", { user, userProfile: userProfile[0], wallet })
    }
       
    


})

const loadAddAddress = asyncHandler(async (req, res) => {
    let user = req.session.user ?? null;
    res.render('user/addAddress', { user });

})

const editAddress = asyncHandler(async (req, res) => {

    let user = req.session.user ? req.session.user : null
    if (user) {
        let id = req.query.id
        req.session.user.editAddressId = id

        let address = await Address.findById({ _id: id })
    }
   
})

const loadOrderSuccess = asyncHandler(async (req, res) => {
    
    let orderId = req.query['orderId'];
    let user = req.session?.user ?? null
    res.locals.orderId = orderId ;
    let currentOrder = await Order.findById({
        _id: orderId
    })
        .populate('user')
        .populate('address')

    res.render('user/orderSuccess', { user, currentOrder,orderId })


})




const loadWallet = asyncHandler( async (req, res) => {
    let user = req.session.user ?? null;
    
    
    res.render('user/userWallet', {user, wallet} )
})
















module.exports = {
    loadHome,

    loadShop,
    loadWishlist,
    loadCart,
    loadCheckout,
    loadProductDetail,
    loadProfile,
    loadAddAddress,
    editAddress,
    loadOrderSuccess,
   
    loadWallet
    
    



}
