const nodemailer = require('nodemailer');
const {Otp} = require('../models/otpModel');

const sendMail = async (email, OTP, Token) => {
    const Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: 'shafeeqsha06@gmail.com',
            pass: process.env.GMAIL_PASSWORD
        }
    });
    let html;
    let subject

    if (OTP) {
        html = `Your OTP is ${OTP}`
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
        console.log(`${OTP || Token} send`);

        try {

            if (OTP) {

                const otp = await Otp.updateOne({ email },
                    { $set: { email, otp: OTP } }, { upsert: true }
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