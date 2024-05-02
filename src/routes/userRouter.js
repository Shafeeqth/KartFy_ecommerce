const express = require('express');
const router = express.Router();

//Requre all admin functions
const userController = require('../controller/userController.js');
const userMiddleware = require('../middleware/userMiddleware.js');
const UserIdentityAndAuth = require('../controller/userIdentityAuthcontroller.js');
const { userAndemailValid } = require('../helpers/validations.js');
const userOrderController = require('../controller/userOrderController.js')


// Load the Home Page
router.get('/',  userController.loadHome);



/* ================User validation and authentications ==================================*/

//user logout
router.get('/logout', UserIdentityAndAuth.userLogout)

// Load register page
router
.route('/signin')
.get(UserIdentityAndAuth.loadLogin )
.post( UserIdentityAndAuth.userLogin);

// Load login page
router
.route('/signup')
.get(UserIdentityAndAuth.loadRegister )
.post( UserIdentityAndAuth.createUser);

// User login 
router
.route('/otp-verification')
.get(UserIdentityAndAuth.loadOtp)
.post(UserIdentityAndAuth.varifyOtp);



//resend OTP 
router.put('/resend-otp', UserIdentityAndAuth.resendOtp)

router
.route('/forgot-password')
.get(UserIdentityAndAuth.loadForgetPage)
.post(UserIdentityAndAuth.forgotPassword);



//verify password 
router.get('/reset-password', UserIdentityAndAuth.loadResetPassword);

//submit resetpassword
router.post('/reset-password', UserIdentityAndAuth.resetPassword)








/* ==============================Wishlist====================================================== */

// show wishlist page
router.get('/wishlist',userMiddleware.isUserAutharized, userController.loadWishlist);

//add to wishlist
router.post('/add-wishlist',  userMiddleware.addToWishlist);

// remove from wishlist
router.delete('/remove-wishlist', userMiddleware.isUserAutharized, userMiddleware.removeFromWishlist)




/* ===================================Cart===================================================== */

// Get user cart Page
router.get('/cart',userMiddleware.isUserAutharized, userMiddleware.isUserAutharized, userController.loadCart);

// Add product to cart 
router.post('/add-cart',  userMiddleware.addToCart);

//update count in cart
router.put('/update-cart', userMiddleware.isUserAutharized, userMiddleware.updateCartCount)


// Remove from cart
router.delete('/remove-cart', userMiddleware.isUserAutharized, userMiddleware.removeFromCart);

router.post('/find-delivery-charge', userMiddleware.findDeliveryCharge)



/*=====================Load shop ===============================================================*/

//load shop
router.get('/shop',  userController.loadShop)

// Get product detail Page

router.get('/product-detail', userController.loadProductDetail );


/* ===============================Checkout======================================================= */

// load checkout page
router.get('/checkout',  userMiddleware.isUserAutharized, userController.loadCheckout);

//add address of users
router.post('/apply-coupon', userMiddleware.addCoupon);





/* ================================orders ======================================================= */


// Get orders

router.get('/my-orders',userMiddleware.isUserAutharized, userOrderController.loadMyOrders);

//Load order details
router.get('/my-orders/single-orderDetails', userMiddleware.isUserAutharized, userOrderController.loadSingleOrderDetails);




// confirm order
router.post('/order-place', userMiddleware.isUserAutharized, userOrderController.orderConfirm);

//laod order success page
router.get('/order-success', userMiddleware.isUserAutharized, userController.loadOrderSuccess)

//Cancel order 
router.put('/order-cancel', userMiddleware.isUserAutharized, userOrderController.orderCancel);

// load review of product
router.post('/product-review', userOrderController.orderProductReview  );

//sumbit return page
router.post('orders/order-return', userOrderController.orderReturn  );






/* ======================================User profile======================================= */

//show user profile

router.get('/profile', userMiddleware.isUserAutharized, userController.loadProfile);

//Edit user profile

router
.route('/profile/add-address')
.get(userMiddleware.isUserAutharized, userController.loadAddAddress)
.post(userMiddleware.isUserAutharized, userMiddleware.addAddress);

//load edit address
router.route('/profile/edit-address')
.get(userMiddleware.isUserAutharized, userController.editAddress)
.post(userMiddleware.isUserAutharized, userMiddleware.editAddress)

//Delete user address
router.delete('/delete-address', userMiddleware.isUserAutharized, userMiddleware.deleteAddress)

//change user password
router.put('/profile/change-password', userMiddleware.isUserAutharized, userMiddleware.changePassword);

router.put('/profile/change-user-details', userMiddleware.isUserAutharized, userMiddleware.changeUserDetails)

router.get('/profile/wallet', userController.loadWallet)


module.exports = router;
