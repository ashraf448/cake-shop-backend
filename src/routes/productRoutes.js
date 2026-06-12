
import { Router } from 'express';
import {
  getProducts, getProduct, getCategories,
  getFeaturedProducts, toggleFeatured,
  createProduct, updateProduct, deleteProduct, addReview,
} from '../controllers/productController.js';
import { protect, adminOnly }                  from '../middleware/auth.js';
import { productRules, reviewRules, validate } from '../middleware/validators.js';
import { upload }                               from '../middleware/upload.js';

const router = Router();

// Public
router.get('/',           getProducts);
router.get('/categories', getCategories);
router.get('/featured',   getFeaturedProducts);
router.get('/:id',        getProduct);

// Protected
router.post('/:id/reviews', protect, ...reviewRules, validate, addReview);

// Admin
router.post(  '/',             protect, adminOnly, upload.array('images', 10), ...productRules, validate, createProduct);
router.put(   '/:id',          protect, adminOnly, upload.array('images', 10), ...productRules, validate, updateProduct);
router.delete('/:id',          protect, adminOnly, deleteProduct);
router.patch( '/:id/featured', protect, adminOnly, toggleFeatured);

export default router;
