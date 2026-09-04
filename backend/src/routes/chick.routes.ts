import { getChickImage } from '../controllers/chicken.controller.js';
import express from 'express';
import { 
  getChicks, 
  getChickById, 
  createChick, 
  updateChick, 
  deleteChick,
  getSiblings,
  bulkSaleChicks
} from '../controllers/chick.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:id/image', getChickImage);
router.get('/:id', getChickById);
router.get('/:id/siblings', getSiblings);

router.use(protect);

router.route('/')
  .get(getChicks)
  .post(createChick);

router.post('/bulk-sale', bulkSaleChicks);

router.route('/:id')
  .put(updateChick)
  .delete(deleteChick);

export default router;