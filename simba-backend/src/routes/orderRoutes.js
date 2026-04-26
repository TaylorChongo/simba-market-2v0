const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getBranchOrders, 
  assignOrder, 
  getStaffOrders, 
  updateOrderStatus,
  getBranchStaff
} = require('../controllers/orderController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// Client routes
router.post('/', authenticateUser, authorizeRoles('CLIENT'), createOrder);
router.get('/my', authenticateUser, authorizeRoles('CLIENT'), getMyOrders);

// Branch Manager routes
router.get('/branch', authenticateUser, authorizeRoles('BRANCH_MANAGER'), getBranchOrders);
router.get('/branch/staff', authenticateUser, authorizeRoles('BRANCH_MANAGER'), getBranchStaff);
router.put('/branch/:id/assign', authenticateUser, authorizeRoles('BRANCH_MANAGER'), assignOrder);

// Branch Staff routes
router.get('/staff', authenticateUser, authorizeRoles('BRANCH_STAFF'), getStaffOrders);
router.put('/staff/:id/status', authenticateUser, authorizeRoles('BRANCH_STAFF'), updateOrderStatus);

module.exports = router;
