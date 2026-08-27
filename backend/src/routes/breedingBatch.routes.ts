import { Router } from 'express';
import { 
  createBreedingBatch, 
  getBreedingBatches, 
  getBreedingBatchById, 
  deleteBreedingBatch,
  updateBreedingBatch
} from '../controllers/breedingBatch.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', createBreedingBatch);
router.get('/', getBreedingBatches);
router.get('/:id', getBreedingBatchById);
router.put('/:id', updateBreedingBatch);
router.delete('/:id', deleteBreedingBatch);

export default router;
