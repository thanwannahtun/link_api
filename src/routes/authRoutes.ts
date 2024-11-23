

import { Router } from 'express';
import { signInAgency, signOutAgency, signUpAgency, sendCode, verifyCode, resendCode } from '../controllers/authController.js';
import { checkEmailAndPassword } from '../middlewares/auth/checkEmailAndPassword.js';

const router = Router();

// ? : Sign In to Agency
router.post('/sign_in', checkEmailAndPassword, signInAgency);

// ? : Create New Agency
router.post('/sign_up', checkEmailAndPassword, signUpAgency);
router.post('/sign_out', checkEmailAndPassword, signOutAgency);

router.post('/sign_up/send_code', sendCode);
router.post('/sign_up/verify_code', verifyCode);
router.post('/sign_up/resend_code', resendCode);

export default router;
