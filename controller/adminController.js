
const model = require('../models/Model');

const loadDashboard = async (req, res) => {

    res.status(201).render('adminDashboard');
}


const  loadLogin = async (req, res) => {
    if(req.session.admin){
        res.redirect('/admin')
    }
    if(req.query.LogoutMessage){
        console.log(req.query.LogoutMessage)
        res.render('adminLogin',{LogoutMessage: req.params.LogoutMessage});
    }else{
        res.render('adminLogin');
    }
}

const checkAuthentic = async (req, res) => {
    email = process.env.ADMIN_EMAIL;
    password = process.env.ADMIN_PASSWORD;
    if(email == req.body.email) {

        if (password == req.body.password) {
            req.session.admin = req.body.email;
            res.redirect('/admin')
            
        } else {
            req.flash('passwordError', 'Invalid password!. try again.');
            res.redirect('/admin/login')
            
        }


    }else {
        req.flash('emailError', 'Invalid email!. try again.');
        res.redirect('/admin/login');
    }
}


const adminLogout = async (req, res) => {
    req.session.admin = null;
    res.redirect('/admin/login?LogoutMessage='+encodeURIComponent('Admin Logged out successfully'));
}

const loadCustomers = async (req, res) => {
    try {
        const customers = await model.userModel.find({});
        console.log('fetched the customers');
        res.render('userManagement',{customers})
    } catch (error) {
        console.log(error);
        
    }
    

}

const loadOrders = async (req, res) => {

    res.render('order-details');
}

const loadProducts = async (req, res) => {

    try {
        let products = await model.productModel.find();

        res.render('adminProducts',{products});
    } catch (error) {
        console.log(error);
        
    }
    
}

const loadCategories = async (req, res) => {

    try {
        const categories = await model.categoryModel.find();
        res.render('Catagery',{categories});

        
    } catch (error) {
        
    }
    
    
}

const loadCoupons = async (req, res) => {

    res.render('couponManagement');
}

const loadReturns = async (req, res) => {

    res.render('returnRequest');
}

const loadAddProduct = async (req, res) => {
    try {
        let category = await model.categoryModel.find(); 
        res.render('addProduct',{category});

        
    } catch (error) {
        console.log(error)
        
    }
}

const loadAddCategory = async (req, res) => {
    res.render('addCategory')
}
const editCategory = async (req, res, next) => {
    let id = req.query.id;
    
    try {
        let category = await model.categoryModel.findById({_id:id})
        res.render('editCategory', {category})
        
    } catch (error) {
        
    }

}

const loadEditProduct = async(req, res) => {
    let id = req.query.id;
    try {
        let category = await model.categoryModel.find();
        let product = await model.productModel.findOne({_id:id});
        console.log()
        res.render("editProduct",{product,category});

    } catch (error) {
        console.log(error)
        
    }
    
}


module.exports = {
    loadDashboard,
    loadLogin,
    checkAuthentic,
    adminLogout,
    loadCustomers,
    loadOrders,
    loadProducts,
    loadCategories,
    loadCoupons,
    loadReturns,
    loadAddProduct,
    loadAddCategory,
    editCategory,
    loadEditProduct,
    
}