const User = require('../models/userModel');
const asyncHandler = require('../utilities/asyncHandler');



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

            let user = await User.create({ name, email ,password});

               console.log('google customer is saved to db');
                req.session.user = user;
                res.redirect('/api/v1?message=' + encodeURIComponent('User saved to db..'));
         

        }
   

})

module.exports =  {
    googleLogin
}
   

