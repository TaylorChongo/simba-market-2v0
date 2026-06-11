const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  addUser,
  updateUserRole, 
  deleteUser, 
  getRoles,
  getPermissions, 
  createPermission,
  assignPermissionToRole, 
  getSettings, 
  updateSetting, 
  getLogs, 
  getAnalytics,
  generateReport 
} = require('../controllers/adminController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// All admin routes are protected and restricted to ADMIN role
router.use(authenticateUser);
router.use(authorizeRoles('ADMIN'));

// User Management
router.get('/users', getUsers);
router.post('/users', addUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Roles and Permissions
router.get('/roles', getRoles);
router.get('/permissions', getPermissions);
router.post('/permissions', createPermission);
router.post('/permissions/assign', assignPermissionToRole);

// System Settings
router.get('/settings', getSettings);
router.post('/settings', updateSetting);

// Security Logs
router.get('/logs', getLogs);

// System Analytics
router.get('/analytics', getAnalytics);
router.get('/report', generateReport);

module.exports = router;
