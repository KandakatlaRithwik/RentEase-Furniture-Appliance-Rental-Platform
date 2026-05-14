const express = require('express');
const router = express.Router();
const { getMyNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/my', getMyNotifications);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);

module.exports = router;
