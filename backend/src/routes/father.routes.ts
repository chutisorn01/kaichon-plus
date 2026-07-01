import express from 'express';
import { 
  getFathers, 
  getFatherById, 
  createFather, 
  updateFather, 
  deleteFather 
} from '../controllers/father.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFathers)
  .post(createFather);

router.route('/:id')
  .get(getFatherById)
  .put(updateFather)
  .delete(deleteFather);

export default router;