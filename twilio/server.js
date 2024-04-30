require('dotenv').config();

const mongoose = require('mongoose').connect('mongodb://localhost:27017/opt');

const app = require('express')();

const port = process.env.SERVER_PORT || 8000;

const userRoute = require('./routes/userRoutes');

app.use('/', userRoute);


app.listen(port, function() {
    console.log(`http://localhost:${port}`);

})