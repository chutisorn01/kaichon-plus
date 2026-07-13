import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getFarmStatistics } from '../controllers/statistics.controller.js';

const router = express.Router();

router.get('/', protect, getFarmStatistics);

export default router;
