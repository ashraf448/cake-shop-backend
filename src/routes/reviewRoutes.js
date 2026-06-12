import { Router } from 'express';
import {
  createReview,
  getApprovedReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload }             from '../middleware/upload.js';

const router = Router();

// Public
router.get('/',          getApprovedReviews);
router.post('/',         upload.single('image'), createReview);

// Admin
router.get('/admin/all',       protect, adminOnly, getAllReviews);
router.patch('/:id/approve',   protect, adminOnly, approveReview);
router.patch('/:id/reject',    protect, adminOnly, rejectReview);
router.delete('/:id',          protect, adminOnly, deleteReview);

export default router;
