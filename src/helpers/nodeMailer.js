const nodemailer = require('nodemailer');
const OTP = require('../models/otpModel');

const sendMail = async (email, Otp, Token) => {
    const Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: 'shafeeqsha06@gmail.com',
            pass: process.env.GMAIL_PASSWORD
        }
    });
    let html;
    let subject

    if (Otp) {
        html = `Your OTP is ${Otp}`
        subject = 'CartFy OTP Verification'

    } else if (Token) {
        html = `Greating Customer. Press <a href=http://localhost:${process.env.PORT}/api/v1/reset-password?token=${Token}> here </a> to Reset your password`
        subject = 'CartFy Reset password'
    }




    const mailOptions = {
        from: 'CartFy',
        to: email,
        subject,
        html,

    }



    try {

        const mailSent = await Transport.sendMail(mailOptions);
        console.log(`${Otp || Token} send`);

        try {

            if (Otp) {

                const otp = await OTP.updateOne({
                     email 
                    },
                    {
                         $set: { 
                            email, 
                            otp: Otp 
                        } 
                    }, 
                    {
                         upsert: true 
                        }
                );


            }

        } catch (error) {

            console.log(error);

        }



    } catch (error) {

        console.log(error);

    }


}

module.exports = sendMail;