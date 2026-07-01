import express from 'express';
import { 
  getMothers, 
  getMotherById, 
  createMother, 
  updateMother, 
  deleteMother 
} from '../controllers/mother.controller';
import { protect } from '../middleware/auth.middleware';

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