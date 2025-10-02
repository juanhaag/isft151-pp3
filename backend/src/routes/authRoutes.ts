import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();

// Registro de usuario
router.post("/register", AuthController.register);

// Login
router.post("/login", AuthController.login);

export default router;
