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

  static async register(
    data: { username: string; email: string; password: string; phone?: string }
  ): Promise<RegisterOutput> {
    const { username, email, password, phone } = data;

    const newUser = await AuthController.authService.register({
      username,
      email,
      password,
      phone,
    });

    const token = AuthController.authService.generateToken(newUser);

    const output: RegisterOutput = {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
      }
    };

    return output;
  }

  static async login(
    data: { email: string; password: string }
  ): Promise<LoginOutput> {

    const { email, password } = data;

    const { user, token } = await AuthController.authService.login({
      email,
      password,
    });

    const output: LoginOutput = { token, user };

    return output;
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
