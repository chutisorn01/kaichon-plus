import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { 
  getUsers, 
  verifyUser, 
  getPromotions, 
  approvePromotion, 
  rejectPromotion, 
  promoteFather,
  getVipSubscriptions,
  approveVipSubscription,
  rejectVipSubscription
} from '../controllers/admin.controller.js';

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

router.get('/vip-subscriptions', getVipSubscriptions);
router.put('/vip-subscriptions/:id/approve', approveVipSubscription);
router.put('/vip-subscriptions/:id/reject', rejectVipSubscription);

export default router;
