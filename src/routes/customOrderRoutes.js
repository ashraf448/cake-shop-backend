import { Router } from 'express';
import {
  createCustomOrder,
  getMyCustomOrders,
  getCustomOrder,
  uploadCustomPaymentProof,
  acceptQuote,
  getAllCustomOrders,
  setQuotePrice,
  updateCustomOrderStatus,
  confirmDelivery,
} from '../controllers/customOrderController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload }             from '../middleware/upload.js';

const router = Router();

router.use(protect);

// ─── User ──────────────────────────────────────────────────────────────────────
router.post('/',                    upload.single('image'),        createCustomOrder);
router.get('/my-orders',            getMyCustomOrders);
router.get('/:id',                  getCustomOrder);
router.patch('/:id/accept',         acceptQuote);
router.patch('/:id/payment-proof',  upload.single('paymentProof'), uploadCustomPaymentProof);
router.patch(
  '/:id/confirm-delivery',
  confirmDelivery
);
// ─── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/all',            adminOnly, getAllCustomOrders);
router.patch('/admin/:id/quote',    adminOnly, setQuotePrice);
router.patch('/admin/:id/status',   adminOnly, updateCustomOrderStatus);

export default router;
