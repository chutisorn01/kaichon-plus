import express from 'express';
import { createExpense, deleteExpense } from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createExpense);
router.delete('/:id', deleteExpense);

export default router;
