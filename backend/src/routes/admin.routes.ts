import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { getUsers, verifyUser, getPromotions, approvePromotion, rejectPromotion, promoteFather } from '../controllers/admin.controller.js';

const router = Router();

// Protect all routes below this middleware and restrict to admin only
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.get('/promotions', getPromotions);
router.put('/promotions/:id/approve', approvePromotion);
router.put('/promotions/:id/reject', rejectPromotion);
router.put('/fathers/:id/promote', promoteFather);

export default router;
