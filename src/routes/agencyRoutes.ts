

import { Router } from 'express';
import { getAllAgencies , getAgencyWithUser } from '../controllers/agencyController.js';

const router = Router();

router.get('/', getAllAgencies );
router.get('/:user_id',getAgencyWithUser );

export default router;
