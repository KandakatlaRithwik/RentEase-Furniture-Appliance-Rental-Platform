const express = require('express');
const router  = express.Router();
const {
  checkAvailabilityHandler, createOrder, getMyOrders,
  getOrder, cancelOrder, extendOrder, updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly }                      = require('../middleware/authMiddleware');
const { orderLimiter }                            = require('../middleware/rateLimiter');
const { orderRules, availabilityRules, validate } = require('../middleware/validators');

// ── Public (no auth) ────────────────────────────────────────────
// ✅ FIX: removed `protect` — unauthenticated users can check
//         availability on ProductDetail before logging in
router.post('/check-availability', availabilityRules, validate, checkAvailabilityHandler);

// ── Authenticated ────────────────────────────────────────────────
router.post('/',    protect, orderLimiter, orderRules, validate, createOrder);
router.get ('/my',  protect, getMyOrders);   // /my MUST be before /:id
router.get ('/:id', protect, getOrder);

// ✅ FIX: changed PUT → PATCH (frontend sends PATCH for all three)
router.patch('/:id/cancel', protect,            cancelOrder);
router.patch('/:id/extend', protect,            extendOrder);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
