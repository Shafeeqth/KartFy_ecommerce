const multer = require('multer');
const fs = require('fs');
const path = require('path');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname+'/../../public/Data/uploads'),(err,success) => {
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
});

const fileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        req.fileValidationError = "Only Image files are allowed..!"
        return cb(new Error('Only Image files are allowed'), false)
    } 
    cb(null, true);
}


module.exports = multer({storage, fileFilter ,
    limits: {
        fileSize: 1024 * 1024 * 5,
      },
});