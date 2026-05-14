const rateLimit = require('express-rate-limit');

// ── Strict limiter for auth endpoints ───────────────────────
// Prevents brute-force attacks on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test', // skip in test env
});

// ── General API limiter ─────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                  // 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

// ── Order creation limiter ──────────────────────────────────
// Prevents order spam
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    message: 'Too many orders placed. Please wait before placing more.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = { authLimiter, apiLimiter, orderLimiter };
