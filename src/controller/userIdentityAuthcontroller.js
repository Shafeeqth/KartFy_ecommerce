const OTP = require('../models/otpModel');
const bcrypt = require('bcrypt');
const userHelper = require('../helpers/validations');
const sendMail = require('../helpers/nodeMailer');
const generateOtp = require('otp-generator');
const mongoose = require('mongoose');
const ApiError = require('../utilities/apiError');
const ApiResponse = require('../utilities/apiResponse');
const asyncHandler = require('../utilities/asyncHandler');
const User = require('../models/userModel');
const Wallet = require('../models/walletModel');
const Referrel = require('../models/referrelModel')
const Notification = require('../models/notificationModel')
const { otpTemplate, passwordUpdated } = require('../helpers/emailTemplates');



const loadRegister = asyncHandler(async (req, res, next) => {
    if (req.session.user) return res.redirect('/api/v1/')
    res.render('user/userRegister');
})

const loadLogin = asyncHandler(async (req, res, next) => {
    if (req.session.user) return res.redirect('/api/v1/')

    res.render('user/userLogin');
})

const loadOtp = asyncHandler(async (req, res, next) => {
    let email = req.session.user?.email || res.locals.user
    res.render('user/otp', { email });
})

const loadForgetPage = asyncHandler(async (req, res, next) => {

    res.render('user/forgotPassword');

})

const loadResetPassword = asyncHandler(async (req, res, next) => {
    let token = req.query.token;
    req.session.token = token;
    console.log(token)
    res.render('user/resetPassword');
})

const createUser = asyncHandler(async (req, res, next) => {

    const emailCheck = await User.findOne({
        email: req.body.email
    });

    if (emailCheck) {
        return res
            .status(400)
            .json({
                success: false,
                error: true,
                emailExist: 'Email already exist!',
                message: 'Email already exist!'
            })
    }
    let { error, value } = userHelper.userValidation.validate(req.body);
    if (error) {
        console.log(error)
        return res
            .status(401)
            .json({
                success: false,
                error: true,
                message: error.message
            })
    }
    const hash = await bcrypt.hash(req.body.password, 10);
    value.password = hash;
    const Otp = Math.floor(6000 + Math.random() * 4000);
    sendMail(value.email, 'CartFy OTP Verification', otpTemplate(Otp, value.name));
    const otp = await OTP.updateOne({
        email : value.email,
        otp: Otp
       },
       {
            $set: { 
               email: value.email , 
               otp: Otp 
           } 
       }, 
       {
            upsert: true 
           }
   );
    req.session.value = value;
    console.log('Otp has sent', Otp)
    return res.status(200)
        .json({
            success: true,
            error: false,
            message: 'user data recorded successfully'
        })
})

const varifyOtp = asyncHandler(async (req, res, next) => {
    let { otp } = req.body;
    let user = await OTP.findOne({ email: req.session?.value?.email, otp });
    if (!user) {
        return res.status(400)
            .json({
                error: true,
                success: false,
                message: 'Incorrect OTP! please check again.'
            })
    }
    let referrelCode = generateOtp.generate(5, {
        digits: true,
        lowerCaseAlphabets: true,
        upperCaseAlphabets: true,
        specialChars: false,
    });
    user = await User.create(req.session.value);
    await Wallet.create({ user: user._id })
    await Referrel.create({ user: user._id, code: referrelCode })
    await Notification.create({
        recipient: user._id,
        type: 'message',
        title: 'Welcome to CartFy',
        message: `Hello member, Welcome to the world of Fashion, where  Fashion meats the customers's expectations `,
        url: '/api/v1/profile',
        image: '/notificationImages/5538691_2887096.jpg'

    })

    req.session.value = null;
    req.session.user = user;
    return res.status(400)
        .json({
            error: false,
            success: true,
            message: 'User account saved successfully'
        })
})

const forgotPassword = asyncHandler(async (req, res, next) => {
    let token = generateOtp.generate(8)
    console.log('token', token);
    let email = req.body.email;
    let user = await User.findOne({ email })
    if (user) {

        const tokens = await OTP.updateOne({
            email ,
            token  
           },
           {
                $set: { 
                   email, 
                   token  
               } 
           }, 
           {
                upsert: true 
               }
       );
      
        sendMail(email, 'Reset Account Password', passwordUpdated(token, user.name));
        req.flash('sentEmail', `Please check your Email ${req.body.email}`);
        return res.redirect('/api/v1/forgot-password?checkEmail=' + encodeURIComponent('Please check your email'));
    }
    req.flash('forgotError', 'Email does not exist!.')
    res.status(303)
        .redirect('/api/v1/forgot-password');
})

const resetPassword = asyncHandler(async (req, res, next) => {
    let userTocken = req.session.token;
    console.log('token', userTocken)
    if (!userTocken) {
        req.flash('resetError', 'Something went wrong')
        return res.status(302)
            .redirect('/api/v1/reset-password')
    }
    let { password, confirmPassword } = req.body;
    console.log(password, confirmPassword)
    let { error, value } = userHelper.resetPasswordValidation.validate({
        password, confirmPassword
    })
    if (error) {
        req.flash('resetError', error.message)
        return res.status(302)
            .redirect('/api/v1/reset-password')
    }
    password = await bcrypt.hash(password, 10); // Hashing new password
    let tokens = await OTP.findOne({ token: userTocken });
    if(!tokens) {
        req.flash('resetError', 'Token got expired Try again!.')
        return res.status(302)
            .redirect('/api/v1/reset-password')
    }
    let user = await User.findOneAndUpdate({ email: tokens.email },
        {
            $set: {
                password
            }
        });
        req.session.user = user;
    req.flash('passwordSuccess', 'Password updated successfully.');
    res.status(302).redirect('/api/v1/')

})

const resendOtp = asyncHandler(async (req, res, next) => {
    let email = req.session.value?.email;
    console.log(email);
    if (!email) {
        return res.status(400)
            .json({
                success: false,
                error: true,
                message: 'Something went wrong'
            })
    }
    let otp = generateOtp.generate(4, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });

    sendMail(email, 'CartFy OTP Verification', otpTemplate(otp, req.session?.value?.name));
    ; // sent OTP to registered email address
    return res.json({
        success: true,
        error: null,
        message: 'OTP resent successfully',
    })

})

const userLogin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
        return res.json({
            success: false,
            error: true,
            message: 'Invalid email!, try again.'
        })
    }
    if (user.isBlocked) {
        return res.json({
            success: false,
            error: true,
            errorType: 'blockError',
            message: 'User is blocked by Admin'
        })
    }

    let match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.json({
            success: false,
            error: true,
            errorType: 'passwordError',
            message: 'Incorrect password! please check your password'
        })
    }
    req.session.user = user;
    return res.json({
        success: true,
        error: false,
        message: 'User logged in successfully'
    })

})

const userLogout = async (req, res, next) => {
    req.session.user = null;
    req.flash('userLogout', 'User logged out successfully')
    next()
}

module.exports = {
    loadLogin,
    loadRegister,
    loadOtp,
    loadForgetPage,
    loadResetPassword,
    userLogin,
    userLogout,
    resendOtp,
    resetPassword,
    forgotPassword,
    varifyOtp,
    createUser,

}
