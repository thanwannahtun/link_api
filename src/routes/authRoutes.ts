

import { Router } from 'express';
import { signInAgency , signOutAgency, signUpAgency } from '../controllers/authController.js';

const router = Router();

router.post('/sign_in', signInAgency );
router.post('/sign_up', signUpAgency );
router.post('/sign_out', signOutAgency );

export default router;
