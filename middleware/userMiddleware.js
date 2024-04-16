const model = require('../models/Model');
const bcrypt = require('bcrypt');
const userHelper = require('../helpers/userHelper');
const nodemailer = require('nodemailer');
const generateOtp = require('generate-otp');





const createUser = async (req, res, next) => {
    try {

        const emailCheck = await model.userModel.findOne({email:req.body.email});

        if (emailCheck) {
             req.flash('email','User already exist!!..')
             console.log('already exist')
             res.redirect('signin');

            
            
        } else {
            let {error, value} = userHelper.userLoginVal.validate(req.body);
            if (error) {
                console.log(error)
                req.flash('error', error.message);
                res.redirect('/signup');
                    
            } else {

                    const hash = await bcrypt.hash(req.body.password, 10);
                    value.password = hash;

                    console.log(value)

                    const user = new model.userModel(value);

                    

                    try {
                        const isSaved = await user.save();
                        console.log('saved to database');
                        // next();
                        
                    } catch (error) {
                        console.log(error.message);
                    }
                    
                    const OTP = Math.floor(6000 + Math.random() * 4000);

                    sendMail(req.body.email, OTP);

                    req.session.user = user;
                    res.status(303).redirect('/otp-verification')
                    
                    
                

                    

                        

            }
            
            


            
        }



        
    } catch (error) {

        console.log(error)
        
    }
}



const varifyOtp = async (req, res, next) => {

    let {one, two, three, four}= req.body
    let otp = `${one}${two}${three}${four}`;
    console.log(otp)
    let user;

    try {
        
        user = await model.otpModel.findOne({email:req.session.user.email, otp: otp });
        console.log('user otp mathced');

    } catch (error) {
        console.log(error);
        
    }

    if (user) {

        try {
            const user = await model.userModel.updateOne({email: req.session.user.email},
                {$set:{isVerified: true}},
                
                );
            console.log('user verified');
    
        } catch (error) {
    
            console.log(error);
            
        }
    
        res.redirect('/?success='+ encodeURIComponent('User account saved successfully'));
    
    
    } else {

        res.redirect('/otp-verification?errorOtp=' + encodeURIComponent('Incorrect OTP'))
    
    }
    
    
    


}

const forgotPassword = async (req, res, next) => {
    
    let user;
    let token = generateOtp.generate(8)
    console.log('token', token);
    try {

        user = await model.userModel.findOneAndUpdate({email:req.body.email},{$set:{ userTocken: token}});
        console.log('found user');
        
    } catch (error) {
        console.log(error);
    }
    
    if (user) {

        sendMail(req.body.email,undefined,token);
        req.flash('sentEmail', `Please check your email ${req.body.email}`);
        res.redirect('/forgot-password?checkEmail=' + encodeURIComponent('Please check your email'));
          
    } else {
        req.flash('forgotError', 'Your email is not registered')
        res.status(303);
        res.redirect('/forgot-password');
        
    }

    


}

const resendOtp = async (req, res, next) => {

    let email = req.session.user.email;
    let otp = generateOtp(4,{
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
        });
    console.log(otp);
    sendMail(email, otp);
    


    
        

}

const googleLogin = async (req, res, next) => {
   
        let name = req.user.displayName;
        let email = req.user.emails[0].value;
        
        //check if user already loged
        let userAlready = await model.userModel.findOne({email});

        if (userAlready) {

            req.session.user = userAlready;
            res.redirect('/?message=' + encodeURIComponent('User already existed...'));
            
        } else {

            let user = new model.userModel({name, email});
        try {

            await user.save();

            console.log('google customer is saved to db');
            req.session.user = user;
            res.redirect('/message=' + encodeURIComponent('User saved to db..'));
        } catch (error) {

            console.log(error)
            
        }
        
            
        }

        
   
}



const isUserLoged = (req, res, next) => {

    if(!req.session.user) {

        res.redirect('/signin?=' + encodeURIComponent('User not logged in'))
    }

    next();
}


const userAuth  = async (req, res, next) => {
    const {email, password} = req.body;
    console.log(email)
    
    let user;

    try {
        user = await model.userModel.findOne({email});

        if (user) {

            if(user.isVerified) {

                if (!user.isBlocked) {

                    let same = await bcrypt.compare(password, user.password);

                    if (same) {

                        req.session.user = user;
                        res.redirect('/')
                        
                    } else {
                        req.flash('passwordError', 'Incorrect password! please check your password');
                        res.status(304).redirect('signin')
                        
                    }
                    
                } else {
                    req.flash('blockedError', 'User is blocked by Admin')
                    res.status(304).redirect('signin')
                    
                }

               


            }else{
                req.flash('verifyError', 'User is not verified plz verify by OTP');
                res.locals = user
                res.status(304).redirect('/otp-verification')
            }

        
        } else {
            req.flash('emailError', 'Email doesn\'t have an account');
            res.status(304).redirect('signin')
            
        }

    } catch (error) {
        console.log(error);
        
    }
    

    
}

const userLogout = async (req, res, next) => {
    req.session.user = null;
    req.flash('userLogout', 'User logged out successfully')
    res.status(304)
    
    next();
}






//helper functionss..




const sendMail = async (email, OTP, Token ) => {
    const Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: 'shafeeqsha06@gmail.com',
            pass: process.env.GMAIL_PASSWORD
        }
    });
    let html;
    let subject

    if(OTP) {
        html = `Your OTP is ${OTP}`
        subject = 'CartFy OTP Verification'

      }else if(Token) {
        html = `Greating Customer. Press <a href=http://localhost:3000/reset-password/?token=${Token}> here </a> to Reset your password`
        subject = 'CartFy Reset password'
      }


   

    const mailOptions = {
        from: 'CartFy',
        to: email,
        subject,
        html,
       
    }



    try {
    
        const mailSent = await Transport.sendMail(mailOptions);
        console.log(`${OTP || Token} send`);

        try {

            if(OTP) {
        
                const otp = await model.otpModel.updateOne({ email },
                    {$set:{email,otp:OTP}},{upsert:true}     
            );

                
            }

        } catch (error) {

            console.log(error);
        
        }
     
      

    } catch (error) {
    
        console.log(error);
    
    }


}










module.exports = {
    createUser,
    varifyOtp,
    forgotPassword,
    googleLogin,
    userAuth,
    isUserLoged,
    userLogout,


}