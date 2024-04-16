const express = require('express');
const router = express();
const path = require('path');


const userController = require('../controller/userController.js');
const userMiddleware = require('../middleware/userMiddleware.js');


// view engine setup
router.set('view engine', 'ejs');
router.set('views', path.join(__dirname, '../views/user'));
router.use(express.static(path.join(__dirname, '../public')));


//google auth configurations
const passport = require('passport');
require('../helpers/passport-setup.js');
router.use(passport.initialize());
router.use(passport.session());



// Load the Home Page
router.get('/',  userController.loadHome);






/* ================User validation and authentications ==================================*/

//user logout
router.get('/logout', userMiddleware.userLogout)

// Load register page
router.get('/signin',  userController.loadLogin );

// Load login page
router.get('/signup', userController.loadRegister);

// User login 
router.post('/signin', userMiddleware.userAuth);


// Submit registration form
router.post('/signup',userMiddleware.createUser,);


//load OTP page
router.get('otp-verification', userController.loadOtp);

//verify user
router.post('/otp-verification', userMiddleware.varifyOtp);


//load forget-password
router.get('/forgot-password', userController.loadForget);

//forgot password logic
router.post('/forgot-password', userMiddleware.forgotPassword);

//verify password 
router.get('/reset-password', userController.loadResetPassword)


//verify user with OTP
router.put('')



//forget password
router.get('/d',)





/* ==============================Wishlist====================================================== */

// show wishlist page
router.get('/wishlist',  userController.loadWishlist);

//add to wishlist
router.post('add_wishlist');

// remove from wishlist
router.delete('remove-wishlist')




/* ===================================Cart===================================================== */

// Get user cart Page
router.get('/cart',  userController.loadCart);

// Add product to cart 
router.post('/add-cart', );


// Remove from cart
router.delete('/remove_cart', );





/*=====================Load shop ===============================================================*/

//load shop
router.get('/shop',  userController.loadShop)

// Get product detail Page

router.get('/product_detail', );


/* ===============================Checkout======================================================= */

// load checkout page
router.get('/checkout',  userController.loadCheckout);

//add address of users
router.post('/add_address');





/* ================================orders ======================================================= */


// Get order details

router.get('/orders');


// Place order 
router.get('/order-place', );


// confirm order
router.post('/confirm_order', );

//Cancel order 
router.put('/order_cancel');

// load review of product
router.get('/product-review', );

// submit review of product
router.post('/submit-review');

//load return page
router.get('/return_product', );

//sumbit return page
router.post('/submit_return');






/* ======================================User profile======================================= */

//show user profile

router.get('/profile');

//Edit user profile

router.put('/profile/edit-profile')




/*============================== Google authentications ===================================*/

//google setup
router.get('/google', passport.authenticate('google', {scope:['profile', 'email']}));

//google redirect route
router.get('/google/callback', passport.authenticate('google', {failureRedirect : '/failure'}),
    (req, res) => {
        res.redirect('/googleProfile')

});

//google profile
router.get('googleProfile', userMiddleware.googleLogin);














module.exports = router;
