const multer = require('multer');
const fs = require('fs');
const path = require('path');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname+'/../public/Data/uploads'),(err,success) => {
            if(err) {
                console.log(err)
            }
        })
        
    },
    filename: (req, file, cb)=> {
        cb(null, Date.now()+ '-' + file.originalname, (error, success) => {
            if(error)console.log(error)
        });

    }
})

module.exports = multer({storage});