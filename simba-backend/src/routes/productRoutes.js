const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (Vendor only)
router.post('/', authenticateUser, authorizeRoles('VENDOR'), createProduct);
router.put('/:id', authenticateUser, authorizeRoles('VENDOR'), updateProduct);
router.delete('/:id', authenticateUser, authorizeRoles('VENDOR'), deleteProduct);

module.exports = router;
