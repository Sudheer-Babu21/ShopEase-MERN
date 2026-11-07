const express = require('express');
const { processCheckout } = require('../controllers/checkoutController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, processCheckout);

module.exports = router;
