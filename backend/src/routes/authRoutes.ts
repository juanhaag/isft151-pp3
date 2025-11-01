import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthValidator } from "../api-wrapper/validators/AuthValidator";
import { log } from "console";

const router = Router();

async function register(req: Request, res: Response) {
  try {
    const { username, email, password, phone } = req.body;

    const result = await AuthController.register({
      username,
      email,
      password,
      phone,
    });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    return res.status(201).json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al registrar usuario";
    return res.status(400).json({ error: errorMessage });
  }
}

async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const result = await AuthController.login({ email, password });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    return res.status(200).json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error en login";
    return res.status(401).json({ error: errorMessage });
  }
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @param   username - Desired username
 * @param   email - User's email address
 * @param   password - User's password
 * @param   phone - User's phone number
 * @return  Registered user details and auth token
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 * @param   email - User's email address
 * @param   password - User's password
 * @return  Auth token and user details
 */
router.post("/login", login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout a user
 * @access  Public
 * @param   N/A
 * @return  Logout confirmation
 */
router.post("/logout", AuthController.logout);

export default router;
