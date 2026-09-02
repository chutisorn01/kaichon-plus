import express from 'express';
import { getDashboardCounts } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/counts', getDashboardCounts);

export default router;
