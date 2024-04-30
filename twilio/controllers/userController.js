
const otpModel = require('../models/otpModel');

const otpGenerator = require('otp-generator');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = new twilio(accountSid, authToken);


const sentOpt = async (req, res) => {
    try {

        let { phoneNumber } = req.body;

        if(! phoneNumber) {
            return res
            .status(400)
            .json({
                success: false,
                message: 'Phone Number required'

            })
        }

        const otp = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false});

        cDate = new Date();

        await otpModel.findOneAndUpdate(
            { phoneNumber },
            { otp, otpExpiration: new Date(cDate.getTime()) },
            { upsert: true, new: true, setDefaultsOnInsert: true}
        );

        await twilioClient.messages.create({
            body: `Your OTP is: ${otp} `,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        })

        return res
        .status(200)
        .json({
            success: true,
            message: 'Otp sent Successfully'
        })
        
    } catch (error) {
        console.log(error)
        return res
        .status(400)
        .json({
            succes: false,
            message: error

        })

        
    }
}
module.exports = {
    sentOpt
}