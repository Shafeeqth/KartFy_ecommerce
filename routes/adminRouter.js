const express = require('express');
const router = express();
const upload = require('../helpers/multer')

const path = require('path');
const adminController = require('../controller/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');


router.use(express.json());
router.use(express.urlencoded({extended: true}))


// view engine setup

router.set('view engine', 'ejs');
router.set('views', path.join(__dirname, '../views/admin'));






/*============================= Routes related to admin authentications  ================================*/

//Get admin dashboard 
router.get('/', adminController.loadDashboard ); 

//submit admin login
router.get('/login', adminController.loadLogin );

//load admin login
router.post('/login', adminController.checkAuthentic);

//admin logout
router.post('/logout', adminController.adminLogout)







/* =======================Routes related UserManagement ====================================*/

//view all users 
router.get('/users', adminController.loadCustomers );

//Block a specific user
router.post('/users/block-user',adminMiddleware.blockOrUnblockUser );

//delete a specific user
router.delete('/users/delete-user', adminMiddleware.deleteUser );





/* =======================Routes related Product management================================*/


//view all the products
router.get('/products', adminController.loadProducts );

//load add product page
router.get('/products/add-product', adminController.loadAddProduct);

//submit add products page
router.post('/products/add-product',upload.array('images'), adminMiddleware.addProduct);

//load edit page
router.get('/products/edit-product', adminController.loadEditProduct);

//Edit products
router.put('/products/edit_product/:id');

//Delete products
router.delete('/products/delete-product', adminMiddleware.deleteProduct);

//List product
router.put('/products/list_product/:id');

//Unlist product
router.put('/products/unlist_product/:id');







/* ================Routes Related to Category Management=============================== */


//View cagetories
router.get('/category', adminController.loadCategories);

//add category 
router.post('/category/add-category', adminMiddleware.addCategory)

router.get('/category/add-category', adminController.loadAddCategory);

//List/unlist categories..
router.post('/category/listUnlist-category', adminMiddleware.listUnlistCategory)

//Edit categories
router.get('/category/edit-category',adminController.editCategory);


//Submit edit category
router.post('/category/edit-category', adminMiddleware.submitEditCategory)

//Delete categories
router.delete('/category/delete_category/:id');







/* =============================Routes related to Order Management ===============================*/

//view all orders
router.get('/orders', adminController.loadOrders );

//change order status
router.put('/orders/change_status/:id', );
 
//view a specific order
router.delete('/orders/delete_order/:id', );






/*================================Routes related to Return Management ================================*/

//view all return requests
router.get('/returns', );

//view a purticular request
router.get('/returns', adminController.loadReturns);

//view a purticular request
router.put('/retuns/confirm_return/:id');

//reject return request
router.put('/retuns/reject_return/:id');



/*===============================Routes related to Offer Management ========================================*/

//view offers
router.get('/offers');

//Edit offer
router.put('/offers/edit_offer/:id');

//delete offer
router.delete('/offers/delete_offer/:id');

//List offer
router.put('/offers/list_offer/:id');

//Unlist offer
router.put('/offers/unlist_offer/:id');



/* =============================Routes related to Coupons Management ========================================*/

//view coupons
router.get('/coupons', adminController.loadCoupons);

//edit coupon
router.put('/coupons/edit_coupon/:id');

//delete coupon
router.delete('/coupons/delete_coupon/:id');

//List coupon
router.put('/coupons/list_coupon/:id');

//Unlist coupon
router.put('/coupons/unlist_coupon/:id');









module.exports = router;
