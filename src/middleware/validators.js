import { body, validationResult } from 'express-validator';

// ─── Run results and short-circuit on first error ────────────────────────────
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors:  errors.array(),
    });
  }
  next();
};

// ─── Register rules ──────────────────────────────────────────────────────────
export const registerRules = [
  body('userName').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage('Invalid Egyptian phone number'),
];

// ─── Login rules ─────────────────────────────────────────────────────────────
export const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Product rules ───────────────────────────────────────────────────────────
export const productRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be >= 0'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be 0-100'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

// ─── Checkout / order rules ───────────────────────────────────────────────────
export const orderRules = [
  body('shippingAddress.name').trim().notEmpty().withMessage('Name is required'),
  body('shippingAddress.phone')
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage('Invalid phone number'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
  body('paymentMethod')
    .isIn(['instapay', 'vodafone'])
    .withMessage('Payment method must be instapay or vodafone'),
  body('items').isArray({ min: 1 }).withMessage('Cart is empty'),
];

// ─── Review rules ────────────────────────────────────────────────────────────
export const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('comment').optional().trim(),
];
