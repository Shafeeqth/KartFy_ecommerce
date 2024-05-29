const nodemailer = require('nodemailer');
const OTP = require('../models/otpModel');

const sendMail = async (email, subject, html) => {
    try {
        const Transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: 'shafeeqsha06@gmail.com',
                pass: process.env.GMAIL_PASSWORD
            }
        });


        const mailOptions = {
            from: 'CartFy',
            to: email,
            subject,
            html,

        }

        const mailSent = await Transport.sendMail(mailOptions);


    } catch (error) {

        console.log(error);

    }


}

module.exports = sendMail;