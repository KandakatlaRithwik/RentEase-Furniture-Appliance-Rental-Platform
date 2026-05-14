const { body, param, query, validationResult } = require('express-validator');

// ── Run validators and return 400 if any fail ───────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth validators ─────────────────────────────────────────
const registerRules = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email')
    .trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Product validators ──────────────────────────────────────
const productRules = [
  body('name')
    .trim().notEmpty().withMessage('Product name is required')
    .isLength({ max: 120 }).withMessage('Name too long'),
  body('category')
    .isIn(['furniture', 'appliance']).withMessage('Category must be furniture or appliance'),
  body('monthlyRent')
    .isFloat({ min: 1 }).withMessage('Monthly rent must be a positive number'),
  body('securityDeposit')
    .isFloat({ min: 0 }).withMessage('Security deposit must be non-negative'),
  body('totalQuantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

// ── Order validators ────────────────────────────────────────
const orderRules = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format')
    .custom((val) => {
      if (new Date(val) < new Date(new Date().setHours(0,0,0,0))) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format')
    .custom((val, { req }) => {
      if (new Date(val) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('tenureMonths')
    .isInt({ min: 1, max: 24 }).withMessage('Tenure must be between 1 and 24 months'),
  body('deliveryAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').trim().notEmpty().withMessage('State is required'),
  body('deliveryAddress.pincode')
    .matches(/^\d{6}$/).withMessage('PIN code must be 6 digits'),
];

const availabilityRules = [
  body('productId').notEmpty().isMongoId().withMessage('Valid product ID required'),
  body('startDate').notEmpty().isISO8601().withMessage('Valid start date required'),
  body('endDate').notEmpty().isISO8601().withMessage('Valid end date required'),
];

// ── Maintenance validators ──────────────────────────────────
const maintenanceRules = [
  body('orderId').notEmpty().isMongoId().withMessage('Valid order ID required'),
  body('issue').trim().notEmpty().withMessage('Please describe the issue')
    .isLength({ min: 10, max: 500 }).withMessage('Issue must be 10–500 characters'),
  body('priority').optional().isIn(['low','medium','high']).withMessage('Invalid priority'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  productRules,
  orderRules,
  availabilityRules,
  maintenanceRules,
};
