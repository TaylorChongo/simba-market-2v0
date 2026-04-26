const express = require('express');
const router = express.Router();
const { updateStock, markOutOfStock } = require('../controllers/branchController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// Branch Staff routes for stock management
router.put('/stock/:productId', authenticateUser, authorizeRoles('BRANCH_STAFF'), updateStock);
router.put('/stock/:productId/out', authenticateUser, authorizeRoles('BRANCH_STAFF'), markOutOfStock);

module.exports = router;
