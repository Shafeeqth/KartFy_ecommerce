const mongoose = require('mongoose');
const ApiError = require('../utilities/apiError');
const ApiResponse = require('../utilities/apiResponse');
const asyncHandler = require('../utilities/asyncHandler');





const isLoged = asyncHandler(async (req, res, next) => {
    if (!req.session.admin) {

        return res.status(401)
            .redirect('/api/v1/admin/login')
    }
    next();
})



const adminLogout = asyncHandler(async (req, res, next) => {
    req.session.admin = null;
    return res.redirect('/api/v1/admin/login?LogoutMessage=' + encodeURIComponent('Admin Logged out successfully'));
})




module.exports = {
    isLoged,
    adminLogout,
 

}
