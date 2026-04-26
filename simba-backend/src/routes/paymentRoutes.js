const express = require('express');
const router = express.Router();
const { initiatePayment, getStatus } = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/authMiddleware');

// @route   POST /api/payments/initiate
// @access  Private/Client
router.post('/initiate', authenticateUser, initiatePayment);

// @route   GET /api/payments/status/:orderId
// @access  Private/Client
router.get('/status/:orderId', authenticateUser, getStatus);

module.exports = router;
