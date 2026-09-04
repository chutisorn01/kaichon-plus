import { Router } from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { register, login, getMe, updateProfile, googleAuth, changePassword, getPublicSettings, getUserProfileImage, getUserCoverImage, getUserSignatureImage } from '../controllers/auth.controller.js';

const router = Router();

const registrationSchema = [
  { field: 'username', required: true, type: 'string' as const, regex: /^[a-zA-Z0-9_.-]+$/, message: 'Username must contain only English letters, numbers, underscores, dots, or hyphens' },
  { field: 'password', required: true, type: 'string' as const, message: 'Password is required and must be a string' },
  { field: 'name', required: true, type: 'string' as const, message: 'Display name is required and must be a string' },
  { field: 'email', required: true, type: 'string' as const, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please provide a valid email address' },
];

const loginSchema = [
  { field: 'username', required: true, type: 'string' as const, message: 'Username is required and must be a string' },
  { field: 'password', required: true, type: 'string' as const, message: 'Password is required and must be a string' },
];

const changePasswordSchema = [
  { field: 'currentPassword', required: true, type: 'string' as const, message: 'Current password is required' },
  { field: 'newPassword', required: true, type: 'string' as const, message: 'New password is required' },
];

router.get('/settings', getPublicSettings);
router.get('/:id/profile-image', getUserProfileImage);
router.get('/:id/cover-image', getUserCoverImage);
router.get('/:id/signature-image', getUserSignatureImage);

router.post('/register', validate(registrationSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, validate(changePasswordSchema), changePassword);

export default router;
