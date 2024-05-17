const router = require('express').Router();
const upload = require('../helpers/multer');




const adminController = require('../controller/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');
const productController = require('../controller/adminProductController')
const categoryController = require('../controller/adminCategoryController');



/*============================= Routes related to admin authentications  ================================*/

//Get admin dashboard 
router.get('/', adminMiddleware.isLoged, adminController.loadDashboard ); 

router.post('/get-fiter-data', adminMiddleware.isLoged, adminController.getFilterData)
router.get('/sales-report', adminMiddleware.isLoged, adminController.loadSalesReport)
router.post('/sales-report/download-excel', adminMiddleware.isLoged, adminController.salesReportDownLoadExcel)

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
.get(  adminMiddleware.isLoged,productController.loadAddProduct)
.post( upload.array('images'), adminMiddleware.isLoged, productController.addProduct);

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
router.patch('products/edit-product-stock', adminMiddleware.isLoged,  productController.editProductSizeCount);







/* ================Routes Related to Category Management=============================== */


//View cagetories
router.get('/category', adminMiddleware.isLoged, categoryController.loadCategories);
router.get('/categories/sub-categories', adminMiddleware.isLoged, categoryController.loadSubCategories)

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
router.put('/orders/single-order-details/change-orderStatus', adminMiddleware.isLoged, adminController.changeOrderStatus );


/*================================Routes related to Banner Management ================================*/

//view Banners
router.get('/banners', adminMiddleware.isLoged, adminController.loadBanners);

//view a purticular request
router.post('/banners/create-banner', adminMiddleware.isLoged, upload.single('image'), adminController.createBanner);
//view a purticular request

router.post('/banners/edit-banner', adminMiddleware.isLoged, upload.single('image'), adminController.editBanner);


//reject return request
router.put('/banners/list-unlist-banner', adminMiddleware.isLoged, adminController.listAndUnlistBanner);








/*================================Routes related to Return Management ================================*/

//view all return requests
router.get('/returns', );

//view a purticular request
router.get('/returns', adminMiddleware.isLoged, adminController.loadReturns);

//view a purticular request
router.patch('/returns/change-status', adminMiddleware.isLoged, adminController.returnChangeStatus);


/*===============================Routes related to Offer Management ========================================*/

//view offers
router.get('/offers', adminMiddleware.isLoged,  adminController.loadOffers);

//Edit offer
router.put('/offers/get-offer-data', adminMiddleware.isLoged, adminController.getOfferData);

//delete offer
router.post('/offers/create-offer', adminMiddleware.isLoged, adminController.createOffer);
router.post('/offers/edit-offer', adminMiddleware.isLoged, adminController.editOffer);

//List offer
router.put('/offers/list-unlist-offer', adminMiddleware.isLoged, adminController.listAndUnlistOffer);





/* =============================Routes related to Coupons Management ========================================*/

//view coupons
router.get('/coupons', adminMiddleware.isLoged, adminController.loadCoupons);


router.post('/coupons/create-coupon', adminMiddleware.isLoged, adminController.createCoupon)

//edit coupon
router.post('/coupons/edit-coupon', adminMiddleware.isLoged, adminController.editCoupon);

//List coupon
router.put('/coupons/list-unlist-coupon', adminMiddleware.isLoged, adminController.listAndUnlistCoupon);




module.exports = router;
