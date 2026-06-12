import { Router }              from 'express';
import { getHeroSettings, updateHeroSettings } from '../controllers/heroController.js';
import { protect, adminOnly }  from '../middleware/auth.js';
import { upload }              from '../middleware/upload.js';

const router = Router();

router.get('/',  getHeroSettings);
router.patch('/', protect, adminOnly, upload.array('images', 5), updateHeroSettings);

export default router;
