
const bcrypt = require('bcrypt');
const userHelper = require('../helpers/validations');
const nodemailer = require('nodemailer');
const generateOtp = require('otp-generator');
const mongoose = require('mongoose');

const Coupon = require('../models/couponModel');
const User = require('../models/userModel');
const Offer = require('../models/offerModel');
const Address = require('../models/addressModel');
const Category = require('../models/categoryModel');
const { Product, Inventory } = require('../models/productModels');
const { Cart, Wishlist } = require('../models/CartAndWishlistModel');
const asyncHandler = require('../utilities/asyncHandler');
const { calculateDeliveryCharge, getCordinates, getDistance } = require('../helpers/calculateDeliveryCharge');
const { findOneAndUpdate } = require('../models/walletModel');


const isUserAutharized = asyncHandler(async (req, res, next) => {


    if (!req.session.user) {

        return res.redirect('/api/v1/')


    }
    let id = req.session.user._id
    let user = await User.findById({ _id: id, })
    if (user.isBlocked == true) {
        req.session.user = null
        res.redirect('/api/v1/')
    }
    next()


})

const userHeaderPopulator = asyncHandler(async (req, res, next) => {
    
    let user = req.session.user ?? null
    if(!user) {
        res.locals.user =  null
       return  next();
    }
     user = await User.aggregate([
        {
            $match:
            {
                _id: new mongoose.Types.ObjectId(user._id),
                
            }
        },
        {
            $project: {
                _id: 1,
                name: 1
            }
        },
        {
            $lookup: {
                from: 'notifications',
                localField: '_id',
                foreignField: 'recipient',
                as: 'notifications',
                pipeline: [
                    {
                        $match:{
                            read: false
                        }
                    }
                ]
               
            }
        },     
        {
            $lookup: {
                from: 'carts',
                localField: '_id',
                foreignField: 'user',
                as: 'cart',
               
            }
        },
        {
            $lookup: {
                from: 'wishlists',
                localField: '_id',
                foreignField: 'user',
                as: 'wishlist',
            }
        },
        
        {
            $unwind: {
                path: '$cart',
                preserveNullAndEmptyArrays: true,
            }

        },
        {
            $addFields: {
                cartCount: {
                    $sum: '$cart.products.quantity'
                },
                wishlistCount: {
                    $size: '$wishlist'
                },
                notificationCount: {
                    $size: '$notifications'
                }
            }
        },
        {
            $project: {
                cartCount: 1,
                wishlistCount: 1,
                name: 1,
                notificationCount: 1
            }
        }
       

    ])
   
   
    user = {
        wishlistCount : user[0]?.wishlistCount,
        cartCount: user[0]?.cartCount,
        userName: user[0]?.name,
        notificationCount: user[0]?.notificationCount,
    }
    res.locals.user = user;
    
    next();

})




const checkoutValidator = asyncHandler(async (req, res, next) => {
    req.session.allowCheckout = true,
     res.redirect('/api/v1/checkout')
})





const findDeliveryCharge = asyncHandler(async (req, res, next) => {
    let { pincode } = req.body;
    let user = req.session.user;

    let companyPincode = `676525`;
    let [sourceCordinate, targetCordinates] = await getCordinates(companyPincode, pincode); // find the cordinates of the company and users pincode

    if (targetCordinates.length == 0) {
        return res.status(404)
            .json({
                success: false,
                error: true,
                message: 'Could not find the Pincode location , please try again'
            })
    }
    let distance = getDistance(sourceCordinate, targetCordinates);
    if (distance === 0) {
        return res.status(200)
            .json({
                success: true,
                error: false,
                data: distance,
                message: 'Delivery charge found successfully'
            })

    } else if (!distance) {
        return res.status(500)
            .json({
                success: false,
                error: true,
                message: 'something went wrong'
            })
    }
    console.log('distance', distance)
    let delivaryCharge = calculateDeliveryCharge(distance);
    await Cart.findOneAndUpdate({
        user: user._id
    },
    {
        $set: {
            deliveryCharge: delivaryCharge + 20
        }
    }
)
    return res.status(200)
        .json({
            success: true,
            error: false,
            data: delivaryCharge + 20,
            message: 'Delivery charge found successfully'
        })


})




module.exports = {
    isUserAutharized,
    checkoutValidator,
    findDeliveryCharge,
    userHeaderPopulator,
    


}