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
    console.log(req.query)



    let user = req.session.user ? req.session.user : null;
    

    let page = parseInt(req.query.page) -1 || 0;
    let limit = parseInt(req.query.limit) || 15;
    let category =  (Array.isArray(req.query.Category) ? req.query.Category : req.query.Category?.split(' '));
    let size = req.query.size || [];
    let gender = (Array.isArray(req.query.Gender) ? req.query.Gender : req.query.Gender?.split(' '));
    let brand = (Array.isArray(req.query.Brands) ? req.query.Brands : req.query.Brands?.split(' '));
    console.log('gnede', gender, 'brand', brand, 'categ', category)
    let categor = [];
    if(gender)categor.push({'product.category.Gender':{$in: gender }});
    if(category)categor.push({'product.category.Category': {$in:category}})
    if(brand)categor.push({'product.category.Brands':{$in: brand}})
    let matchValue = {};
    console.log(categor)

    let sort = req.query.sort || ''

    let search = req.query.search || ''

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

    console.log(page, limit, category, size, brand, sort, search);
    

    

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
    console.log('ivn',inventory)
   
        

    //     {
    //         $match: {
    //             isListed: true
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: 'inventories',
    //             localField: '_id',
    //             foreignField: 'product',
    //             as: 'inventory'
    //         }
    //     },
    //     {
    //         $unwind: '$inventory'
    //     }, 
        
    //     {
    //         $group: {
    //             _id: '$_id',
    //             title: { $first: '$title'},
    //             category: { $first: '$category'},
    //             mrpPrice: { $first: '$mrpPrice'},
    //             price: {$first: '$price'},
    //             description: {$first: '$description'},
    //             color: {$first: '$color'},
    //             images: {$first: '$images'},
    //             soldCount: {$first: '$soldCount'},
    //             productReviews: {$first: '$productReviews'},
    //             totalStock: {$sum : '$inventory.sizeVariant'}

    //         }
    //     }

    // ])

        
    //     {
    //         $lookup: {
    //             from: 'product',
    //             foreignField: '_id',
    //             localField: 'product',
    //             as: 'product'
    //         },

    //     },
            
    //     {
    //         $match : {
    //             'product.isListed': true
    //         },
    //     },
        
    //     {
    //         $unwind: '$sizeVariant'
    //     },
    //     {
    //         $unwind: '$sizeVariant.sizeVariant'
    //     },
    //     // {$group: {
    //     //     _id: '$_id',
    //     //     totalStock: {$sum: '$sizeVariant.stock'}

    //     // }},

    //     {
    //         $project: {
    //             title: 1,
    //             category: '$category.Brands',
    //             mrpPrice: 1,
    //             price: 1,
    //             description: 1,
    //             color: 1,
    //             images: 1,
    //             soldCount:1,
    //             productReviews: 1,
    //             sizeVariant: 1
               


    //         }
    //     }
        

    // ])
    // console.log(inventory)


    let count = await Product.countDocuments()
    // if (req.query.sort) {
    //     let sort = req.query.sort == 'low-to-High' ?
    //         { 'product.price': 1 } : req.query.sort == 'high to Low' ?
    //             { 'product.price': -1 } : req.query.sort == 'date' ?
    //                 { 'product.createdAt': -1 } : null

    //     let products = await Inventory.aggregate([
            
    //         {
    //             $lookup: {
    //                 from: "products",
    //                 localField: "product",
    //                 foreignField: "_id",
    //                 as: "product",
    //                 pipeline: [
                       
    //                     {
    //                         $match: {
    //                             isListed: true
    //                         }
    //                     },
    //                     {
    //                         $project: {
    //                             product: 1,
    //                             category: 'product.category.Brands',
                                

    //                         }
    //                     }
                       


    //                 ]
    //             }
    //         },
            

    //     ])
    //     // console.log(inventory)


    //     return res.render('user/shopPage', { user, products, count });

    // }



    // let products = await Product.find({ isListed: true, })


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

    let user = req.session.user ? req.session.user : null;

    if (user) {
        let cartData = await Cart.findOne({ user }).populate('products.product') 
        cartData = cartData ?? []
        let address = await Address.find({ user });
        address = address ?? []
        let coupons = await Coupon.find({isListed: true})
        let wallet = await Wallet.findOne({user:user._id}).select('balance');
        console.log(wallet, 'wallet')
        coupons = coupons ?? []
        console.log(cartData, address, coupons)
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
        console.log(JSON.stringify(product))

    // console.log(product.product.productReviews)
    const sizeVariant = JSON.stringify(product[0].sizeVariant)
    console.log(sizeVariant)

    res.status(200).render('user/productDetail', { user, product :product[0],sizeVariant });



})


const loadProfile = asyncHandler(async (req, res, next) => {

    let user = req.session.user ? req.session.user : null;
    if (user) {
        let wallet = await Wallet.findOne({user: user._id }).populate('user')
        wallet.transactions.sort((a, b) => b.date - a.date)
        console.log('wallet', wallet)
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




        console.log('user1', userProfile)

        res.render("user/userProfile", { user, userProfile, wallet })
    } else {

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
        console.log("address========================================",address)
        res.render('user/editAddress', { user, address })
    } else {


    }



})

const loadOrderSuccess = asyncHandler(async (req, res) => {
    
    let orderId = req.query['orderId'];
    let user = req.session?.user ?? null
    let currentOrder = await Order.findById({
        _id: orderId
    })
        .populate('user')
        .populate('address')
    console.log(currentOrder)

    res.render('user/orderSuccess', { user, currentOrder })


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
