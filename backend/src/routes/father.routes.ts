import { getFatherImage } from '../controllers/chicken.controller.js';
import express from 'express';
import { 
  getFathers, 
  getFatherById, 
  createFather, 
  updateFather, 
  deleteFather,
  getPromotedFathers
} from '../controllers/father.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/promoted', getPromotedFathers);

router.use(protect);

router.route('/')
  .get(getFathers)
  .post(createFather);

router.route('/:id')
  .get(getFatherById)
  .put(updateFather)
  .delete(deleteFather);

export default router;