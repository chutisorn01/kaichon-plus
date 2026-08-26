import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { 
  getUsers, 
  verifyUser, 
  getPromotions, 
  approvePromotion, 
  rejectPromotion, 
  deletePromotion,
  promoteFather,
  getVipSubscriptions,
  approveVipSubscription,
  rejectVipSubscription,
  getSystemSettings,
  updateSystemSettings,
  backupData,
  createUser,
  blockUser,
  changeUserPassword,
  changeUserRole,
  searchFathers
} from '../controllers/admin.controller.js';

const router = Router();

// Protect all routes below this middleware and restrict to admin only
router.use(protect);
router.use(restrictTo('admin'));

router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.get('/backup', backupData);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/password', changeUserPassword);
router.put('/users/:id/role', changeUserRole);
router.put('/users/:id/verify', verifyUser);
router.get('/promotions', getPromotions);
router.put('/promotions/:id/approve', approvePromotion);
router.put('/promotions/:id/reject', rejectPromotion);
router.delete('/promotions/:id', deletePromotion);
router.put('/fathers/:id/promote', promoteFather);
router.get('/fathers/search', searchFathers);

router.get('/vip-subscriptions', getVipSubscriptions);
router.put('/vip-subscriptions/:id/approve', approveVipSubscription);
router.put('/vip-subscriptions/:id/reject', rejectVipSubscription);

export default router;
