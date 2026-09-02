import { getMotherImage } from '../controllers/chicken.controller.js';
import express from 'express';
import { 
  getMothers, 
  getMotherById, 
  createMother, 
  updateMother, 
  deleteMother 
} from '../controllers/mother.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMothers)
  .post(createMother);

router.route('/:id')
  .get(getMotherById)
  .put(updateMother)
  .delete(deleteMother);

export default router;