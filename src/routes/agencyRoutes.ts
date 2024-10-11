

import { Router } from 'express';
import { getAgencyWithUserId, getPostByAgencyId, getAgencyByQuery } from '../controllers/agencyController.js';

const router = Router();


// ? : url?agency_id=123
router.post('/', getAgencyByQuery);

// ? : Find Agency With User Id
router.get('/:user_id', getAgencyWithUserId);

// ? : Find Posts of a Agency
router.post('/:agency_id/posts', getPostByAgencyId);


export default router;
