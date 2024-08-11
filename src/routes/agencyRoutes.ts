

import { Router } from 'express';
import { getAllAgencies, getAgencyWithUserId, getPostByAgencyId } from '../controllers/agencyController.js';

const router = Router();

router.get('/', getAllAgencies);


router.get('/:user_id', getAgencyWithUserId); // ! uncomplete codes ( user_id is string but expect ObjectId )

// ? : Find Posts of a Agency
router.post('/:agency_id/posts', getPostByAgencyId);


export default router;
