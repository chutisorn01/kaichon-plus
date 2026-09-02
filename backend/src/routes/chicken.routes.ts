import { Router } from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  getAllChickens,
  getChickenById,
  getChickenPedigree,
  getParentsOptions,
  registerChicken,
  updateChicken,
  deleteChicken,
  getChickenImage,
} from '../controllers/chicken.controller.js';

const router = Router();

// Validation schemas
const registrationSchema = [
  { field: 'code', required: true, type: 'string' as const, message: 'Chicken code is required and must be a string' },
  { field: 'name', required: true, type: 'string' as const, message: 'Chicken name is required and must be a string' },
  { field: 'gender', required: true, type: 'string' as const, options: ['male', 'female'], message: 'Gender must be either "male" or "female"' },
  { field: 'bloodline', required: false, type: 'string' as const, message: 'Bloodline details must be a string' },
];

const updateSchema = [
  { field: 'code', required: false, type: 'string' as const, message: 'Chicken code must be a string' },
  { field: 'name', required: false, type: 'string' as const, message: 'Chicken name must be a string' },
  { field: 'gender', required: false, type: 'string' as const, options: ['male', 'female'], message: 'Gender must be either "male" or "female"' },
  { field: 'bloodline', required: false, type: 'string' as const, message: 'Bloodline details must be a string' },
];

// Endpoints mapping
router.get('/', getAllChickens);
router.get('/parents-options', getParentsOptions);
router.get('/:id/image', getChickenImage);
router.get('/:id', getChickenById);
router.get('/:id/pedigree', getChickenPedigree);

router.post('/', protect, validate(registrationSchema), registerChicken);
router.put('/:id', protect, validate(updateSchema), updateChicken);
router.delete('/:id', protect, deleteChicken);

export default router;
