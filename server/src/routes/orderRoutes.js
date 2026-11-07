const express = require('express');
const { getMyOrders, getOrderById } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
