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

router.get('/:id', getChickById);
router.get('/:id/siblings', getSiblings);

router.use(protect);

router.route('/')
  .get(getChicks)
  .post(createChick);

router.route('/:id')
  .put(updateChick)
  .delete(deleteChick);

export default router;