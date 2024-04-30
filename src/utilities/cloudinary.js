const cloudinary = require('cloudinary').v2;
const fs = require('fs');


//cloudinary configurations 
cloudinary.config({
    cloud_name: process.env,
    api_key: process.env,
    api_secret: process.env,
})

async function uplaodToCloudinary(localFilePath) {
    try {

        let mainFolderName = 'main'
        let filePathOnCloudinary = mainFolderName + '/' + localFilePath;
    
        const result = await cloudinary.uploader
                            .upload(localFilePath, {
                                'public_id': filePathOnCloudinary
                            });
        fs.unlinkSync(localFilePath);
        return {
            success: true,
            result: result,
            message: 'Image uploaded to Cloud successfully'
        }

    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath);
        return {
            success: false,
            result: null,
            message: 'Something went wrong!'
        }
        
    }
}

module.exports = uplaodToCloudinary;