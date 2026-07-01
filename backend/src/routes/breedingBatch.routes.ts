import { Router } from 'express';
import { 
  createBreedingBatch, 
  getBreedingBatches, 
  getBreedingBatchById, 
  deleteBreedingBatch 
} from '../controllers/breedingBatch.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/', createBreedingBatch);
router.get('/', getBreedingBatches);
router.get('/:id', getBreedingBatchById);
router.delete('/:id', deleteBreedingBatch);

export default router;
