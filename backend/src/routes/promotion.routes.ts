import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { createPromotion, getMyPromotions } from '../controllers/promotion.controller.js';

const router = Router();

router.use(protect);

router.post('/', createPromotion);
router.get('/my', getMyPromotions);

export default router;
