const express = require('express');
const router = express.Router();
const {
  createRequest, getMyRequests, getAllRequests, updateRequest,
} = require('../controllers/maintenanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/',        protect, createRequest);
router.get('/my',       protect, getMyRequests);
router.get('/',         protect, adminOnly, getAllRequests);
router.put('/:id',      protect, adminOnly, updateRequest);

module.exports = router;
