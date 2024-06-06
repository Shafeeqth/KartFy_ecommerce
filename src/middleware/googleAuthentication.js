const User = require('../models/userModel');
const asyncHandler = require('../utilities/asyncHandler');
const Notification = require('../models/notificationModel');
const Wallet = require('../models/walletModel');
const Referrel = require('../models/referrelModel');
const generateOtp = require('generate-otp');



const googleLogin = asyncHandler(async (req, res, next) => {
   

        let name = req.user.displayName;
        let email = req.user.emails[0].value;
        let password = req.user.emails[0].value;

        //check if user already loged
        let userAlready = await User.findOne({ email });

        if (userAlready) {

            if (userAlready.isBlocked) {

                req.flash('blockedError', 'User is blocked by Admin')
                res
                .status(304)
                .redirect('/api/v1/signin');

            } else {
                let user = await User.aggregate([
                    { $match: { email } },
                    {
                        $lookup: {
                            from: 'wishlists',
                            localField: '_id',
                            foreignField: 'user',
                            as: 'wishlistUser'
                        }
                    },
                    {
                        $lookup: {
                            from: 'carts',
                            localField: '_id',
                            foreignField: 'user',
                            as: 'cartUser'
                        }
                    }
                ])

                req.session.user = user[0];
                res
                .redirect('/api/v1?message=' + encodeURIComponent('User already existed...'));

            }

        } else {
            let referrelCode = generateOtp.generate(5, {
                digits: true,
                lowerCaseAlphabets: true,
                upperCaseAlphabets: true,
                specialChars: false,
            });

            let user = await User.create({ name, email ,password});
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

               console.log('google customer is saved to db');
                req.session.user = user;
                res.redirect('/api/v1?message=' + encodeURIComponent('User saved to db..'));
         

        }
   

})

module.exports =  {
    googleLogin
}
   

