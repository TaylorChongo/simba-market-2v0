const express = require('express');
const { register, login, googleLogin, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected route to verify auth is working
router.get('/me', authenticateUser, (req, res) => {
  res.status(200).json({
    message: 'Authentication is working!',
    user: req.user
  });
});

module.exports = router;
