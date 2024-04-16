const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        

    },phone:{
        type:String,
        required:true,
    },alterPhone:{
        type:String,
        
    },fullname: {
        type: String,
        required: true,
    },city:{
        type:String,
        required:true,
    },pincode:{
        type:String,
        required: true,
    },locality:{
        type:String,
        required:true,
    },buildingName:{
        type:String,
    }

});

const addressModel= mongoose.model('Address', addressSchema);



const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',    

    },productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product', 
    },quantity:{
        type:Number,
        required:true,
        
    },totalAmout:{
        type:Number,
        required:true,
    }

});

cartModel= mongoose.model('Cart', cartSchema);


const categorySchema = mongoose.Schema({
    title:{
        type:String,
        required:true,
        
    },description: {
        type: String,
      
    },isListed:{
        type:Boolean,
        default: true,
    },appliedOffer: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Offer', 
        
    }

});

const categoryModel = mongoose.model('Category', categorySchema);


const CouponSchema = mongoose.Schema({
    couponCode:{
        type:String,
        required:true,
        
    },couponName: {
        type: String,
        required: true,
      
    },couponStrt: {
        type: Date,
        required: true,
      
    },
    couponExp:{
        type: Date,
        required:true,
        
    },isListed: {
        type: Boolean,
      
    },minConst:{
        type:Number,

    },appliedUsers:{
        type:Array,
        
    }

});

const couponModel = mongoose.model('Coupon', CouponSchema);


// const userSchema = mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//     },name:{
//         type:String,
//         required:true,
//     },phone:{
//         type:String,
//         required:true,
//     },password: {
//         type: String,
//         required: true,
//     },isBlocked:{
//         type:Boolean,
//         default:false,
//     },isVerified:{
//         type:Boolean,
//         default:false,
//     },joinedAt:{
//         type:Date,
//         default:Date.now(),
//     }        
// });

// module.exports = mongoose.model('User', userSchema);



const offerSchema = mongoose.Schema({
    offerName: {
        type: String,
        required: true,
      
    },offerStrt: {
        type: Date,
        required: true,
      
    },offerExp:{
        type: Date,
        required:true,
        
    },isListed: {
        type: Boolean,
      
    },minConst:{
        type:Number,

    },

});

const offerModel = mongoose.model('Offer', offerSchema);


const orderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    },addressId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
    },paymentMethod: {
        type: String,
        
    },orderDate:{
        type:Date,
        default:Date.now(),
    },orderStatus:{
        type:String,
        
    },joinedAt:{
        type:Date,
        default:Date.now(),
    }        
});

const orderModel = mongoose.model('Order', orderSchema);



const otpSchema = mongoose.Schema({
    otp: {
        type:String,
    },email: {
        type: String,

    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
});

otpSchema.index({createdAt: 1},
    {expireAfterSeconds: 180});

const otpModel = mongoose.model('OTP', otpSchema);


const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },mrpPrice:{
        type:String,
        required: true,
    },price:{
        type:String,
        required: true
    },
    description:{
        type:String,
        required:true,
    },color:{
        type: String,
        
    },
    size:{
        type:String,
    },
    stock:{
        type:String,
        required: true,
    },images:{
        type: Array,
        validate:[arrayLimit, 'must be four images']
    },type:{
        type:String,

    },addedAt:{
        type:Date,
        default:Date.now(),
    },isList:{
        type:Boolean,
        default:true,
    },isDeleted:{
        type: Boolean,
        default: false
    } 
         
});
function arrayLimit(val) {
    return val.length >= 4
        
} 

const productModel = mongoose.model('Product', productSchema);


const returnSchema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },reason:{
        type:String,
        required:true,
    },reasonDesc:{
        type:String,
        required:false,
    },isApproved: {
        type: String,
        required: true,
    },dateAt:{
        type:Date,
        default:Date.now(),
    }        
});

const returnModel = mongoose.model('Return', returnSchema);


const reviewSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },rating:{
        type:Number,
    },review: {
        type: String,
        required: true,
    },dateAt: {
        type:Date,
        default: Date.now(),
    }

});

const reviewModel = mongoose.model('Review', reviewSchema);



const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },name:{
        type:String,
        required:true,
    },password: {
        type: String,
    },isBlocked:{
        type:Boolean,
        default:false,
    },isVerified:{
        type:Boolean,
        default:false,
    },joinedAt:{
        type:Date,
        default:Date.now(),
    },userTocken: {
        type: String,
        default: ''

    },isDeleted:{
        type: Boolean,
        default:false
    }       
});

const userModel = mongoose.model('User', userSchema);


const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }
});

const wishlistModel = mongoose.model('Wishlist', wishlistSchema);


module.exports = {
    otpModel,
    wishlistModel,
    cartModel,
    userModel,
    reviewModel,
    returnModel,
    orderModel,
    otpModel,
    productModel,
    addressModel,
    offerModel,
    categoryModel,

}