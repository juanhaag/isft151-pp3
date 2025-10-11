/**
 * Validators for Auth API endpoints
 * Validates structure/format for ALL responses (success and errors)
 */

import {
  LoginInput,
  LoginOutput,
  LoginResponse,
  RegisterInput,
  RegisterOutput,
  RegisterResponse,
  LogoutOutput,
  LogoutResponse,
  ErrorResponse,
  ValidationErrorResponse,
} from "../types/AuthTypes";

export class AuthValidator {
  // ============================================================================
  // Generic validators
  // ============================================================================
  static validateErrorResponse(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.error !== "string") {
      errors.push("error is required and must be a string");
    }

    if (typeof data.description !== "string") {
      errors.push("description is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateValidationErrorResponse(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.errors || typeof data.errors !== "object") {
      errors.push("errors is required and must be an object");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Login validators
  // ============================================================================
  static validateLoginInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.username || typeof data.username !== "string") {
      errors.push("username is required and must be a string");
    }

    if (!data.password || typeof data.password !== "string") {
      errors.push("password is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateLoginOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.token || typeof data.token !== "string") {
      errors.push("token is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validates ANY login response (success or error)
   */
  static validateLoginResponse(data: any, statusCode: number): { valid: boolean; errors?: string[] } {
    if (statusCode === 200 && "token" in data) {
      return this.validateLoginOutput(data);
    }

    if (statusCode === 400 && "errors" in data) {
      return this.validateValidationErrorResponse(data);
    }

    if ("error" in data && "description" in data) {
      return this.validateErrorResponse(data);
    }

    return {
      valid: false,
      errors: ["Response does not match any expected format"],
    };
  }

  // ============================================================================
  // Register validators
  // ============================================================================
  static validateRegisterInput(
    data: any
  ): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.username || typeof data.username !== "string") {
      errors.push("username is required and must be a string");
    }

    if (!data.email || typeof data.email !== "string") {
      errors.push("email is required and must be a string");
    }

    if (!data.password || typeof data.password !== "string") {
      errors.push("password is required and must be a string");
    }

    if (data.phone !== undefined && typeof data.phone !== "string") {
      errors.push("phone must be a string if provided");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateRegisterOutput(
    data: any
  ): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.token || typeof data.token !== "string") {
      errors.push("token is required and must be a string");
    }

    if (!data.user || typeof data.user !== "object") {
      errors.push("user is required and must be an object");
    } else {
      if (!data.user.id || typeof data.user.id !== "number") {
        errors.push("user.id is required and must be a number");
      }
      if (!data.user.username || typeof data.user.username !== "string") {
        errors.push("user.username is required and must be a string");
      }
      if (!data.user.email || typeof data.user.email !== "string") {
        errors.push("user.email is required and must be a string");
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validates ANY register response (success or error)
   */
  static validateRegisterResponse(data: any, statusCode: number): { valid: boolean; errors?: string[] } {
    // Check if it's a success response (201)
    if (statusCode === 201 && "token" in data && "user" in data) {
      return this.validateRegisterOutput(data);
    }

    if (statusCode === 400 && "errors" in data) {
      return this.validateValidationErrorResponse(data);
    }

    if ("error" in data && "description" in data) {
      return this.validateErrorResponse(data);
    }

    return {
      valid: false,
      errors: ["Response does not match any expected format"],
    };
  }

  // ============================================================================
  // Logout validators
  // ============================================================================
  static validateLogoutOutput(
    data: any
  ): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.success !== "boolean") {
      errors.push("success is required and must be a boolean");
    }

    if (!data.message || typeof data.message !== "string") {
      errors.push("message is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validates ANY logout response (success or error)
   */
  static validateLogoutResponse(data: any, statusCode: number): { valid: boolean; errors?: string[] } {
    if (statusCode === 200 && "success" in data && "message" in data) {
      return this.validateLogoutOutput(data);
    }

    if ("error" in data && "description" in data) {
      return this.validateErrorResponse(data);
    }

    return {
      valid: false,
      errors: ["Response does not match any expected format"],
    };
  }
}
