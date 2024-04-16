const swtAlert = require('sweetalert2');





const loadHome = async (req, res) => {
    res.status(200)
    res.render('homePage');
    swtAlert.fire('hello Man');

}

const loadRegister = async (req, res) => {
    res.render('userRegister');
}

const loadLogin = async (req, res) => {

    res.render('userLogin');
}


const loadOtp = async (req, res) => {
    let email = req.session.user?.email || res.locals.user
    res.render('otp',{email});
}


const loadForget = async (req, res) => {
 
    res.render('forgotPassword');

}

const loadResetPassword = async (req, res) => {
    let token = req.query.token;
    req.session.token = token;
    console.log(token)
    res.render('resetPassword');
}

const loadShop = async (req, res) => {
    res.render('shopPage');
}

const loadWishlist = async (req, res) => {
    res.render('wishlistPage');
}

const loadCart = async (req, res) => {
    res.render('cartPage');
}

const loadCheckout = async (req, res) => {
    res.render('checkoutPage');
}

const userAuth = async (req, res) => {
    res.status(200).redirect('/')

}














module.exports = {
    loadHome,
    loadLogin,
    loadRegister,
    loadOtp,
    loadForget,
    loadResetPassword,
    loadShop,
    loadWishlist,
    loadCart,
    loadCheckout,
    userAuth,


}
