const { required } = require('joi');
const mongoose = require('mongoose');
const otpSchema = mongoose.Schema({
    token: {
        type: String,
        unique: true,
        null: true,
        required: false
    },
    otp: {
        type: String,
        unique: true,
        null: true,
        required: false

    },
    email: {
        type: String,

    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

otpSchema.index({ createdAt: 1 },
    { expireAfterSeconds: 180 });

const Otp = mongoose.model('OTP', otpSchema);





module.exports = Otp
    


