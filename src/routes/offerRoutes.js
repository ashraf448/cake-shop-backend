import { Router } from 'express';
import { getOfferSettings, updateOfferSettings } from '../controllers/offerController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/',   getOfferSettings);
router.patch('/', protect, adminOnly, updateOfferSettings);

export default router;