const router = require('express').Router();
const upload = require('../helpers/multer');




const adminController = require('../controller/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');
const productController = require('../controller/adminProductController')
const categoryController = require('../controller/adminCategoryController');



/*============================= Routes related to admin authentications  ================================*/

//Get admin dashboard 
router.get('/', adminMiddleware.isLoged, adminController.loadDashboard ); 

//submit admin login
router
.route('/login')
.get( adminController.loadLogin )
.post(adminController.checkAuthentic);

//admin logout
router.post('/logout', adminMiddleware.adminLogout)







/* =======================Routes related UserManagement ====================================*/

//view all users 
router.get('/users', adminMiddleware.isLoged, adminController.loadCustomers );

//Block a specific user
router.post('/users/block-user', adminMiddleware.isLoged ,adminController.blockOrUnblockUser );




/* =======================Routes related Product management================================*/


//view all the products
router.get('/products', adminMiddleware.isLoged, productController.loadProducts );

//load add product page
router
.route('/products/add-product')
.get( productController.loadAddProduct)
.post( upload.array('images'), productController.addProduct);

//load edit page
router.route('/products/edit-product')
.get( adminMiddleware.isLoged,  productController.loadEditProduct)
.post( adminMiddleware.isLoged, upload.array('images'), productController.editProduct);

//view products in detail
router.get('/products/product-detail', adminMiddleware.isLoged, productController.loadProductDetails);

//add stock l
router.post('/products/add-stock', adminMiddleware.isLoged, productController.addProductStock);

//List product
router.put('/products/list-product', adminMiddleware.isLoged,  productController.listUnlistProduct);







/* ================Routes Related to Category Management=============================== */


//View cagetories
router.get('/category', adminMiddleware.isLoged, categoryController.loadCategories);
router.get('/categories/sub-categories', categoryController.loadSubCategories)

//add category 
router
.route('/sub-categories/add-subCategory')
.get( adminMiddleware.isLoged, categoryController.loadAddSubCategory)
.post( adminMiddleware.isLoged,  categoryController.addSubCategory)

//edit subcategory 
router
.route('/sub-categories/edit-subCategory')
.get( adminMiddleware.isLoged, categoryController.loadEditSubCategory)
.post( adminMiddleware.isLoged,  categoryController.editSubCategory)

//add category 
router.route('/category/add-category')
.post(adminMiddleware.isLoged,  categoryController.addCategory)
.get( adminMiddleware.isLoged, categoryController.loadAddCategory);

//List/unlist categories..
router.post('/category/listUnlist-category', adminMiddleware.isLoged, categoryController.listUnlistCategory)

//Edit categories
router.route('/category/edit-category')
.get( adminMiddleware.isLoged, categoryController.loadEditCategory)
.post(adminMiddleware.isLoged,  categoryController.submitEditCategory)








/* =============================Routes related to Order Management ===============================*/

//view all orders
router.get('/orders', adminMiddleware.isLoged,  adminController.loadOrders );

// view order details
router.get('/orders/single-order-details', adminMiddleware.isLoged,  adminController.loadSingleOrderDetails)

//change order status
router.put('/orders/single-order-details/change-orderStatus', adminController.changeOrderStatus );
 
//view a specific order
router.delete('/orders/delete_order/:id', );






/*================================Routes related to Return Management ================================*/

//view all return requests
router.get('/returns', );

//view a purticular request
router.get('/returns', adminMiddleware.isLoged, adminController.loadReturns);

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
