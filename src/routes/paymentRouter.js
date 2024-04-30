const router = require('express').Router();

const paymentControllers = require('../controller/paymentControllers');

router.post('/pay', paymentControllers.payPalPayment );

router.get('/success', paymentControllers.payPalSuccess);
router.get('/cancel', paymentControllers.payPalCancel);

module.exports = router;