import express from 'express';
import { 
  getFathers, 
  getFatherById, 
  createFather, 
  updateFather, 
  deleteFather,
  getPromotedFathers,
  getFatherImage
} from '../controllers/father.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/promoted', getPromotedFathers);

router.get('/:id/image', getFatherImage);
router.use(protect);

router.route('/')
  .get(getFathers)
  .post(createFather);

router.route('/:id')
  .get(getFatherById)
  .put(updateFather)
  .delete(deleteFather);

export default router;