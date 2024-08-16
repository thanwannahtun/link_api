

import { Router } from 'express';
import { getAllAgencies, getAgencyWithUserId, getPostByAgencyId } from '../controllers/agencyController.js';

const router = Router();

// ? : Get All Agencies ( optional limit query )
router.get('/', getAllAgencies);

// ? : Find Agency With User Id
router.get('/:user_id', getAgencyWithUserId);

// ? : Find Posts of a Agency
router.post('/:agency_id/posts', getPostByAgencyId);


export default router;
