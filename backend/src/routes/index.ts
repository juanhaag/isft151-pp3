import { Router } from 'express';
import reportRoutes from './reportRoutes';
import spotRoutes from './spotRoutes';
import userRoutes from './userRoutes';
import authRoutes from "./authRoutes";
import profileRoutes from './profileRoutes';

const router = Router();

router.use('/reports', reportRoutes);
router.use('/spots', spotRoutes);
router.use('/users', userRoutes);
router.use("/auth", authRoutes);
router.use('/profile', profileRoutes);

export default router;