import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect, adminOnly);

router.get('/',              getNotifications);
router.patch('/mark-all',    markAllAsRead);
router.delete('/clear-read', clearReadNotifications);
router.patch('/:id/read',    markAsRead);
router.delete('/:id',        deleteNotification);

export default router;
