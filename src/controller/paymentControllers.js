const paypal = require('paypal-rest-sdk');
const asyncHandler = require('../utilities/asyncHandler');
const { PAYPAL_MODE, PAYPAL_CLIENT_KEY, PAYPAL_SECRET_KEY, PORT,
    RAZORPAY_KEY_ID} = process.env;





paypal.configure({
    mode: PAYPAL_MODE,
    client_id: PAYPAL_CLIENT_KEY,
    client_secret: PAYPAL_SECRET_KEY,
});

const payPalPayment = asyncHandler((req, res, next) => {
console.log('comes here');
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": `http://localhost:${PORT}/paypal/success`,
            "cancel_url": `http://localhost:${PORT}/paypal/cancel`,
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Red Sox Hat",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]

            },
            "amount": {
                "currency": "USD",
                "total": "25.00",

            },
            "description": "Hat for the best team ever"
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        console.log('comes here here also');
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url'){ 
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
    
})

const payPalSuccess = asyncHandler(async (req, res, next) => {
    const payerId = req.query.PayerId;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };
    const payment = await paypal.payment.execute(paymentId, execute_payment_json);

    console.log(JSON.stringify(payment));

})


const payPalCancel = asyncHandler(async (req, res, next) => {
    res.send('Cancel')
})

module.exports = {
    payPalCancel,
    payPalPayment,
    payPalSuccess,
}





