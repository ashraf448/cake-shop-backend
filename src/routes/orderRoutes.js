import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  uploadPaymentProof,
  cancelOrder,
  trackOrder,
  getAllOrders,
  updateOrderStatus,
  confirmReceipt,
  updateExpectedDelivery,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { orderRules, validate } from '../middleware/validators.js';
import { upload }               from '../middleware/upload.js';
// import {  confirmReceipt } from '../controllers/orderController.js';

const router = Router();

router.use(protect); // all order routes require auth

// User routes
router.post('/',                      orderRules, validate, createOrder);
router.get('/my-orders',              getMyOrders);
router.get('/:id/track',              trackOrder);
router.get('/:id',                    getOrder);
router.patch('/:id/cancel',           cancelOrder);
router.patch('/:id/payment-proof',    upload.single('paymentProof'), uploadPaymentProof);
router.patch('/:id/confirm-receipt', confirmReceipt);
router.patch('/admin/:id/delivery-date', adminOnly, updateExpectedDelivery);
// Admin routes
router.get('/admin/all',              adminOnly, getAllOrders);
router.patch('/admin/:id/status',     adminOnly, updateOrderStatus);

export default router;
