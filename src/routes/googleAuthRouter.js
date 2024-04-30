const router = require('express').Router();
const googleMiddleware = require('../middleware/googleAuthentication');
const passport = require('passport');
 


/*============================== Google authentications ===================================*/

//google setup
router.get('/', passport.authenticate('google', {scope:['profile', 'email']}));

//google redirect route
router.get('/callback', passport.authenticate('google', {failureRedirect : '/failure'}),
    (req, res) => {
        res.redirect('/google/authenticate')

});

//google profile
router.get('/authenticate', googleMiddleware.googleLogin);


module.exports = router


