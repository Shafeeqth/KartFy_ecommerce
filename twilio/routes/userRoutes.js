


const express = require('express');
const router = express();

router.use(express.json());

const userController = require('../controllers/userController');

router.post('/api/sent-otp', userController.sentOpt)

module.exports = router;

