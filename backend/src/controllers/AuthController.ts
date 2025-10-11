import { Response } from "express";
import {
  AuthRequest,
  RegisterRequest,
  LoginRequest,
} from "../requests/AuthRequest";
import { AuthService } from "../services/AuthService";
import { AuthValidator } from "../api-wrapper/validators/AuthValidator";
import { LoginOutput, RegisterOutput, LogoutOutput } from "../api-wrapper/types/AuthTypes";
import { ResponseValidator } from "../api-wrapper/helpers/ResponseValidator";

export class AuthController {
  private static authService = new AuthService();

  static async register(req: RegisterRequest, res: Response) {
    // Validate input with API wrapper
    const inputValidation = AuthValidator.validateRegisterInput(req.body);
    if (!inputValidation.valid) {
      return res.status(400).json({
        error: "Validation Error",
        description: inputValidation.errors?.join(", ") || "Invalid input"
      });
    }

    // Also validate with existing business logic validator
    const validation = AuthRequest.validateRegister(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    try {
      const { username, email, password, phone } = req.body;

      const newUser = await AuthController.authService.register({
        username,
        email,
        password,
        phone,
      });

      const token = AuthController.authService.generateToken(newUser);

      // Set httpOnly cookie (HTTP/Transport layer)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
      });

      // Prepare output according to API spec
      const output: RegisterOutput = {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          phone: newUser.phone,
        }
      };

      // Validate output with API wrapper
      const outputValidation = AuthValidator.validateRegisterOutput(output);
      if (!outputValidation.valid) {
        console.error("API Output validation failed:", outputValidation.errors);
      }

      return ResponseValidator.validateAndSend(
        res,
        201,
        output,
        AuthValidator.validateRegisterResponse
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al registrar usuario";

      if (errorMessage === "El email ya existe") {
        return ResponseValidator.validateAndSend(
          res,
          409,
          { error: "Conflict", description: errorMessage },
          AuthValidator.validateRegisterResponse
        );
      }

      if (errorMessage === "El username ya existe") {
        return ResponseValidator.validateAndSend(
          res,
          409,
          { error: "Conflict", description: errorMessage },
          AuthValidator.validateRegisterResponse
        );
      }

      console.error(err);
      return ResponseValidator.validateAndSend(
        res,
        500,
        { error: "Internal Server Error", description: "Error al registrar usuario" },
        AuthValidator.validateRegisterResponse
      );
    }
  }

  static async login(req: LoginRequest, res: Response) {
    // Validate input with API wrapper
    const inputValidation = AuthValidator.validateLoginInput({
      email: req.body.email || "",
      password: req.body.password || "",
    });
    if (!inputValidation.valid) {
      return res.status(400).json({
        error: "Validation Error",
        description: inputValidation.errors?.join(", ") || "Invalid input"
      });
    }

    const validation = AuthRequest.validateLogin(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    try {
      const { email, password } = req.body;

      const { user, token } = await AuthController.authService.login({
        email,
        password,
      });

      // HTTP/Transport layer: Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
      });

      // Prepare output according to API spec
      const output: LoginOutput = { token };

      // Validate output with API wrapper
      const outputValidation = AuthValidator.validateLoginOutput(output);
      if (!outputValidation.valid) {
        console.error("API Output validation failed:", outputValidation.errors);
      }

      return ResponseValidator.validateAndSend(
        res,
        200,
        output,
        AuthValidator.validateLoginResponse
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error en login";

      if (errorMessage === "Usuario no encontrado") {
        return ResponseValidator.validateAndSend(
          res,
          404,
          { error: "Not Found", description: errorMessage },
          AuthValidator.validateLoginResponse
        );
      }

      if (errorMessage === "Credenciales inválidas") {
        return ResponseValidator.validateAndSend(
          res,
          401,
          { error: "Unauthorized", description: errorMessage },
          AuthValidator.validateLoginResponse
        );
      }

      console.error(err);
      return ResponseValidator.validateAndSend(
        res,
        500,
        { error: "Internal Server Error", description: "Error en login" },
        AuthValidator.validateLoginResponse
      );
    }
  }

  static async logout(req: LoginRequest, res: Response) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      const output: LogoutOutput = {
        success: true,
        message: "Logout exitoso"
      };

      const outputValidation = AuthValidator.validateLogoutOutput(output);
      if (!outputValidation.valid) {
        console.error("API Output validation failed:", outputValidation.errors);
      }

      return ResponseValidator.validateAndSend(
        res,
        200,
        output,
        AuthValidator.validateLogoutResponse
      );
    } catch (err) {
      console.error(err);
      return ResponseValidator.validateAndSend(
        res,
        500,
        { error: "Internal Server Error", description: "Error en logout" },
        AuthValidator.validateLogoutResponse
      );
    }
  }
}
