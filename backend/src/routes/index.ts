import { Router } from 'express';
import reportRoutes from './reportRoutes';
import spotRoutes from './spotRoutes';
import zoneRoutes from './zoneRoutes';

const router = Router();

router.use('/reports', reportRoutes);
router.use('/spots', spotRoutes);
router.use('/zones', zoneRoutes);

export default router;