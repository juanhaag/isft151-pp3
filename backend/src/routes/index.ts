import { Router } from 'express';
import reportRoutes from './reportRoutes';
import spotRoutes from './spotRoutes';
import zoneRoutes from './zoneRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/reports', reportRoutes);
router.use('/spots', spotRoutes);
router.use('/zones', zoneRoutes);
router.use('/users', userRoutes);

export default router;