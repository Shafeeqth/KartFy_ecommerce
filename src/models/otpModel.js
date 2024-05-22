const mongoose = require('mongoose');
const otpSchema = mongoose.Schema({
    otp: {
        type: String,
        unique: true
    }, email: {
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
    


