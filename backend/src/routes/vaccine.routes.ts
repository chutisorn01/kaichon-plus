import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getVaccineSchedule, markVaccineCompleted } from '../controllers/vaccine.controller.js';

const router = Router();

router.get('/schedule', protect, getVaccineSchedule);
router.post('/mark-completed', protect, markVaccineCompleted);

export default router;
