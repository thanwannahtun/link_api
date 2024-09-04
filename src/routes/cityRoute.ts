import { Router } from 'express';
import { getCities } from '../controllers/cityController.js';

const router = Router();

router.get('/', getCities);

export default router;