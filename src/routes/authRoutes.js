import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole
} from '../controllers/authController.js';
import { protect, adminOnly }         from '../middleware/auth.js';
import { registerRules, loginRules, validate } from '../middleware/validators.js';

const router = Router();

// Public
router.post('/register', ...registerRules, validate, register);
router.post('/login',    ...loginRules,    validate, login);

// Protected
router.use(protect);
router.get('/me',              getMe);
router.patch('/me',            updateProfile);
router.patch('/change-password', changePassword);

// Admin only
router.get('/users', adminOnly, getAllUsers);
router.patch('/users/:id/role', adminOnly, updateUserRole);

export default router;
