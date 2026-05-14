const express = require('express');
const router = express.Router();
const { getAnalytics, getAllOrders, getAllUsers, getAllMaintenance } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly); // all admin routes require auth + admin role

router.get('/analytics', getAnalytics);
router.get('/orders',    getAllOrders);
router.get('/users',     getAllUsers);
router.get('/maintenance', getAllMaintenance);

module.exports = router;
