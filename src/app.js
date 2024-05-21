const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('express-flash');
require('dotenv').config();
const nocache = require('nocache');
// const passport = require('passport');
// const facebookStrategy = require('passport-facebook').Strategy;

const app = express();

const adminRouter = require('./routes/adminRouter');
const usersRouter = require('./routes/userRouter');
const googleRouter = require('./routes/googleAuthRouter');
const paymentRouter = require('./routes/paymentRouter.js');

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views/'));
app.use(express.static(path.join(__dirname, '../public')));






// app.use(passport.initialize());
// app.use(passport.session());
app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(nocache());
app.use(flash());


//google auth configurations
const passport = require('passport');
require('./helpers/passport-setup.js');
app.use(passport.initialize());
app.use(passport.session());



app.use('/api/v1/admin', adminRouter);
app.use('/api/v1', usersRouter);
app.use('/google', googleRouter);
// app.use('/paypal', paymentRouter)



//facebook strategy ..

// passport.use( new facebookStrategy({

//     //pull in our app id and secret from our auth.js file
//     clientID  : '713572820983746',
//     clientSecret: '7e7872fea9df42b4038616502a7cc02e',
//     callbackURL: 'http:localhost:3000/facebook/callback',
//     profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']


// },
// //facebook will set back the token and profile
// function(token, refreshToken, profile, done) {

// }));

// app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

// app.get('/facebook/callback', passport.authenticate('facebook', {
//     successRedirect: '/profile',
//     failureRedirect: '/failer',
// }));

// app.get('/profile', (req, res) => {
//     res.send('you are a valid user');
// })

// app.get('/failed', (req, res) => {
//     res.send('you are not valid')
// });

// passport.serializeUser( (user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((id, done) => {

//     return done(null, id)
// })







// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   let user = req.session.user?? null
//   res.render('404',{user});
// });



module.exports = app;
