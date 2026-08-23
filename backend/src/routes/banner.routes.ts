import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from '../controllers/banner.controller.js';

const router = Router();

// Public route
router.get('/active', getActiveBanners);

// Admin routes
router.use(protect);
router.use(restrictTo('admin'));

router.route('/')
  .get(getAllBanners)
  .post(createBanner);

router.route('/:id')
  .put(updateBanner)
  .delete(deleteBanner);

export default router;
