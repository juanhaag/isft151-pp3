/**
 * Validators for User API endpoints
 * Only validate structure/format, NOT business logic
 */

export class UserValidator {
  // ============================================================================
  // Create User
  // ============================================================================
  static validateCreateUserInput(data: any): { valid: boolean; errors?: string[] } {
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

  static validateCreateUserOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.id !== "number") {
      errors.push("id is required and must be a number");
    }

    if (!data.username || typeof data.username !== "string") {
      errors.push("username is required and must be a string");
    }

    if (!data.email || typeof data.email !== "string") {
      errors.push("email is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get All Users
  // ============================================================================
  static validateGetAllUsersOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data.users)) {
      errors.push("users is required and must be an array");
    } else {
      data.users.forEach((user: any, index: number) => {
        if (typeof user.id !== "number") {
          errors.push(`users[${index}].id must be a number`);
        }
        if (typeof user.username !== "string") {
          errors.push(`users[${index}].username must be a string`);
        }
        if (typeof user.email !== "string") {
          errors.push(`users[${index}].email must be a string`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get User By Id
  // ============================================================================
  static validateGetUserByIdInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.id || typeof data.id !== "string") {
      errors.push("id is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateGetUserByIdOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.id !== "number") {
      errors.push("id is required and must be a number");
    }

    if (!data.username || typeof data.username !== "string") {
      errors.push("username is required and must be a string");
    }

    if (!data.email || typeof data.email !== "string") {
      errors.push("email is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
