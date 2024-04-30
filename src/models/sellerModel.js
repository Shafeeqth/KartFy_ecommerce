const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },name:{
        type:String,
        required:true,
    },phone:{
        type:String,
        required:true,
    },password: {
        type: String,
        required: true,
    },isBlocked:{
        type:Boolean,
        default:false,
    },isVerified:{
        type:Boolean,
        default:false,
    },joinedAt:{
        type:Date,
        default:Date.now(),
    }        
});

module.exports = mongoose.model('User', userSchema);

