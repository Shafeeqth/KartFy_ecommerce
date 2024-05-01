const Otp = require('../models/otpModel');
const bcrypt = require('bcrypt');
const userHelper = require('../helpers/validations');
const sendMail = require('../helpers/nodeMailer');
const generateOtp = require('otp-generator');
const mongoose = require('mongoose');
const ApiError = require('../utilities/apiError');
const ApiResponse = require('../utilities/apiResponse');
const asyncHandler = require('../utilities/asyncHandler');
const User = require('../models/userModel');





const loadRegister = asyncHandler(async (req, res) => {
    if(req.session.user) return res.redirect('/api/v1/') 
    res.render('user/userRegister');
})

const loadLogin = asyncHandler(async (req, res) => {
    if(req.session.user) return res.redirect('/api/v1/') 

    res.render('user/userLogin');
})


const loadOtp = asyncHandler(async (req, res) => {
    let email = req.session.user?.email || res.locals.user
    res.render('user/otp', { email });
})


const loadForgetPage = asyncHandler(async (req, res) => {

    res.render('user/forgotPassword');

})

const loadResetPassword = asyncHandler(async (req, res) => {
    let token = req.query.token;
    req.session.token = token;
    console.log(token)
    res.render('user/resetPassword');
})



const createUser = asyncHandler(async (req, res, next) => {


    console.log(req.body)

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

        console.log(value)


        const OTP = Math.floor(6000 + Math.random() * 4000);

        sendMail(req.body.email, OTP);
        req.session.value = value;

        return res.status(200)
                .json({
                    success: true,
                    error: false,
                    message:'user data recorded successfully'
                })

       
           



})


const varifyOtp = asyncHandler(async (req, res, next) => {

    let { one, two, three, four } = req.body
    let otp = `${one}${two}${three}${four}`;
   


    const user = await Otp.find({ email: req.session.value.email, otp });
        if (!user) {
            req.flash('otpError', 'Incorrect OTP! please check again.')
            return  res.redirect('/otp-verification?errorOtp=' + encodeURIComponent('Incorrect OTP'))
        }

             user = await User.create(req.session.value);

            req.session.value = null;
            req.session.user = user;
            res.redirect('/?success=' + encodeURIComponent('User account saved successfully'));


})

const forgotPassword = asyncHandler(async (req, res, next) => {

   
    let token = generateOtp.generate(8)
    console.log('token', token);
  

    let user = await User.findOneAndUpdate({
         email: req.body.email
         },
          { $set: { 
            passwordResetTocken: token 
        } 
    });
        console.log('found user');

    

    if (user) {

        sendMail(req.body.email, undefined, token);
        req.flash('sentEmail', `Please check your Email ${req.body.email}`);
        return res.redirect('/api/v1/forgot-password?checkEmail=' + encodeURIComponent('Please check your email'));

    } 
        req.flash('forgotError', 'Invalid email! try again.')
        res.status(303)
       .redirect('/api/v1/forgot-password');




})

const resetPassword = asyncHandler(async (req, res, next) => {
    
        let userTocken = req.session.token;

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
            await User.updateOne({ userTocken },
                { $set: { password } });
            req.flash('passwordSuccess', 'Password updated successfully.')
            res.status(302).redirect('/api/v1/')



    





})

const resendOtp = asyncHandler(async (req, res, next) => {

    let email = req.session.user?.email;
    if(!email){
       return res.status(301)
        .redirect('api/v1/signup')
    }
    let otp = generateOtp.generate(4, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });

    sendMail(email, otp); // sent OTP to registered email address
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
