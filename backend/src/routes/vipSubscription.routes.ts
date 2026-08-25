import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createSubscription,
  getMySubscriptions,
} from '../controllers/vipSubscription.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMySubscriptions)
  .post(createSubscription);

export default router;
