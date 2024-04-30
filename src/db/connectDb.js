const mongoose = require('mongoose');


const connectDb = async (req, res) => {
    try {
        const mongoInstance = await mongoose.connect(process.env.DB_URL);
        console.log('Connected to Database');
        
    } catch (error) {
        console.log('Database connection got failed');
        process.exit(1);
        
    }
}

module.exports = connectDb