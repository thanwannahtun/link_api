

import { Router } from 'express';
import { signInAgency, signOutAgency, signUpAgency } from '../controllers/authController.js';
import { checkEmailAndPassword } from '../middlewares/auth/checkEmailAndPassword.js';

const router = Router();

// ? : Sign In to Agency
router.post('/sign_in', checkEmailAndPassword, signInAgency);

// ? : Create New Agency
router.post('/sign_up', checkEmailAndPassword, signUpAgency);
router.post('/sign_out', checkEmailAndPassword, signOutAgency);

export default router;
