import express from 'express';
import { 
  getMothers, 
  getMotherById, 
  createMother, 
  updateMother, 
  deleteMother,
  getMotherImage
} from '../controllers/mother.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:id/image', getMotherImage);
router.use(protect);

router.route('/')
  .get(getMothers)
  .post(createMother);

router.route('/:id')
  .get(getMotherById)
  .put(updateMother)
  .delete(deleteMother);

export default router;