import express from 'express';
import { 
  getChicks, 
  getChickById, 
  createChick, 
  updateChick, 
  deleteChick,
  getSiblings
} from '../controllers/chick.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getChicks)
  .post(createChick);

router.route('/:id')
  .get(getChickById)
  .put(updateChick)
  .delete(deleteChick);

router.get('/:id/siblings', getSiblings);

export default router;