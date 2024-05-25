const express = require('express');
const router = express.Router();

//Requre all admin functions
const userController = require('../controller/userController.js');
const userMiddleware = require('../middleware/userMiddleware.js');
const UserIdentityAndAuth = require('../controller/userIdentityAuthcontroller.js');
const { userAndemailValid } = require('../helpers/validations.js');
const userOrderController = require('../controller/userOrderController.js')
const userCartAndWishlistController = require('../controller/userCartAndWishlistController.js')
const userCouponController = require('../controller/userCouponController.js')
const upload = require('../helpers/multer.js');

// Load the Home Page
router.get('/', userMiddleware.userHeaderPopulator, userController.loadHome);

router.get('/user-notifications', userController.loadUserNotifications);
router.patch('/user-notifications/mark-as-seen', userController.notificationMarkAsSeen )



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

router.post('/referrel-apply', userController.applyUserReferrel)



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
router.get('/wishlist' ,userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userCartAndWishlistController.loadWishlist);

//add to wishlist
router.post('/add-wishlist',  userCartAndWishlistController.addToWishlist);

// remove from wishlist
router.delete('/remove-wishlist', userMiddleware.isUserAutharized, userCartAndWishlistController.removeFromWishlist)




/* ===================================Cart===================================================== */

// Get user cart Page
router.get('/cart',userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userCartAndWishlistController.loadCart);

// Add product to cart 
router.post('/add-cart',  userCartAndWishlistController.addToCart);

//update count in cart
router.put('/update-cart', userMiddleware.isUserAutharized, userCartAndWishlistController.updateCartCount)


// Remove from cart
router.delete('/remove-cart', userMiddleware.isUserAutharized, userCartAndWishlistController.removeFromCart);

router.post('/find-delivery-charge', userMiddleware.isUserAutharized, userMiddleware.findDeliveryCharge)




/*=====================Load shop ===============================================================*/

//load shop
router.get('/shop',userMiddleware.userHeaderPopulator,  userController.loadShop)

// Get product detail Page

router.get('/product-detail',userMiddleware.userHeaderPopulator, userController.loadProductDetail );


/* ===============================Checkout======================================================= */
router.get('/start-checkout', userMiddleware.checkoutValidator)
// load checkout page
router.get('/checkout',  userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userController.loadCheckout);

//add address of users
router.post('/apply-coupon', userMiddleware.isUserAutharized, userCouponController.addCoupon);


//add address of users
router.put('/remove-coupon', userMiddleware.isUserAutharized, userCouponController.removeCoupon);






/* ================================orders ======================================================= */


router.get('/check-valid-coupon', userMiddleware.isUserAutharized, userCouponController.checkValidCoupon)

// Get orders
router.get('/proceed-to-checkout', userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userOrderController.proceedtToCheckout)

router.get('/my-orders',userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userOrderController.loadMyOrders);

//Load order details
router.get('/my-orders/single-orderDetails', userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userOrderController.loadSingleOrderDetails);

router.post('/my-orders/single-orderDetails/order-invoice-download', userMiddleware.isUserAutharized, userOrderController.downloadOrderInvoice)

// confirm order
router.post('/order-place', userMiddleware.isUserAutharized, userOrderController.orderConfirm);

//laod order success page
router.get('/order-success', userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userOrderController.loadOrderSuccess)

//Cancel order 
router.put('/order-cancel', userMiddleware.isUserAutharized, userOrderController.orderCancel);

// load review of product
router.post('/product-review', userMiddleware.isUserAutharized, userOrderController.orderProductReview  );

//sumbit return page
router.post('/orders/order-return', userMiddleware.isUserAutharized, userOrderController.orderReturn  );


/*==================================E-payment================================================= */

//RazorPay success
router.put('/orders/razorpay-success', userMiddleware.isUserAutharized, userOrderController.razorpaySuccess)


//RazorPay failure
router.put('/orders/razorpay-failure', userMiddleware.isUserAutharized, userOrderController.razorpayFailure)


//RazorPay success
router.get('/orders/paypal-success', userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userOrderController.paypalSuccess)


//RazorPay failure
router.get('/orders/paypal-failure', userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userOrderController.paypalFailure)


router.put('/retry-order-payment', userMiddleware.isUserAutharized, userOrderController.retryOrderPay);

router.put('/orders/razorpay-retry-failure', userMiddleware.isUserAutharized, userOrderController.retryPaymentFailure)

router.put('/orders/razorpay-retry-success', userMiddleware.isUserAutharized, userOrderController.retryPaymentSuccess)



/* ======================================User profile======================================= */

//show user profile

router.get('/profile', userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userController.loadProfile);

//Edit user profile

router
.route('/profile/add-address')
.get(userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userController.loadAddAddress)
.post(upload.none() ,userMiddleware.isUserAutharized, userController.addAddress);

//load edit address
router.route('/profile/edit-address')
.get(userMiddleware.isUserAutharized, userMiddleware.userHeaderPopulator, userController.editAddress)
.post(upload.none(), userMiddleware.isUserAutharized, userController.editAddress)

//Delete user address
router.delete('/delete-address', userMiddleware.isUserAutharized, userController.deleteAddress)

//change user password
router.put('/profile/change-password', userMiddleware.isUserAutharized, userController.changePassword);

router.put('/profile/change-user-details', userMiddleware.isUserAutharized, userController.changeUserDetails)



module.exports = router;
