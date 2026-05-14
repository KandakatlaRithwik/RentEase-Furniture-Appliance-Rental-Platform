const express = require('express');
const router  = express.Router();
const { register, login, getMe, updateMe, changePassword, getAdminProfile, updateAdminProfile } = require('../controllers/authController');
const { protect, adminOnly }                           = require('../middleware/authMiddleware');
const { authLimiter }                       = require('../middleware/rateLimiter');
const { registerRules, loginRules, validate } = require('../middleware/validators');

// Rate-limited auth routes
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login',    authLimiter, loginRules,    validate, login);
router.get ('/me',       protect, getMe);
router.put ('/me',       protect, updateMe);
router.post('/change-password', protect, changePassword);

// Admin profile routes
router.get ('/admin/profile', protect, adminOnly, getAdminProfile);
router.put ('/admin/profile', protect, adminOnly, updateAdminProfile);

module.exports = router;
