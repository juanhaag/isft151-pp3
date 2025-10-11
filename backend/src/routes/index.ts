import { Router } from 'express';
import reportRoutes from './reportRoutes';
import spotRoutes from './spotRoutes';
import userRoutes from './userRoutes';
import authRoutes from "./authRoutes";

const router = Router();

router.use('/reports', reportRoutes);
router.use('/spots', spotRoutes);
router.use('/users', userRoutes);
router.use("/auth", authRoutes);

export default router;