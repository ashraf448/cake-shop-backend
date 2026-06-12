import { Router } from 'express';
import {
  getWishlist,
  toggleWishlist,
  checkWishlist,
  clearWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect); // all wishlist routes require auth

router.get('/',                              getWishlist);
router.delete('/clear',                      clearWishlist);
router.get('/:productId/check',              checkWishlist);
router.post('/:productId/toggle',            toggleWishlist);

export default router;
