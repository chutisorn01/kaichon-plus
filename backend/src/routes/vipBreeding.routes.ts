import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createVipBreeding,
  getVipBreedings,
  updateVipBreeding,
  deleteVipBreeding,
  generateChicks
} from '../controllers/vipBreeding.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getVipBreedings)
  .post(createVipBreeding);

router.route('/:id')
  .put(updateVipBreeding)
  .delete(deleteVipBreeding);

router.route('/:id/generate-chicks')
  .post(generateChicks);

export default router;
