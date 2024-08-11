import { Router } from 'express';
import userRoutes from './userRoutes.js';
import agencyRoutes from './agencyRoutes.js';
import postRoutes from './postRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

router.use('/v1/users', userRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/agencies', agencyRoutes);
router.use('/v1/routes', postRoutes);

export default router;
