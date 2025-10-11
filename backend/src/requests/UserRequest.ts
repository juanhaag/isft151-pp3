import { Request } from 'express';

export interface CreateUserRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  };
}

export interface UpdateUserRequest extends Request {
  body: {
    username?: string;
    email?: string;
    password?: string;
    phone?: string;
  };
}

export class UserRequest {
  static validateCreate(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.username || typeof data.username !== 'string' || !data.username.trim()) {
      errors.push('Username is required');
    }

    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required');
    } else if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (data.phone && typeof data.phone !== 'string') {
      errors.push('Phone must be a string');
    }

    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  }

  static validateUpdate(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (data.username !== undefined && (typeof data.username !== 'string' || !data.username.trim())) {
      errors.push('Username must be a non-empty string');
    }

    if (data.email !== undefined) {
      if (typeof data.email !== 'string') {
        errors.push('Email must be a string');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    if (data.password !== undefined) {
      if (typeof data.password !== 'string') {
        errors.push('Password must be a string');
      } else if (data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }
    }

    if (data.phone !== undefined && typeof data.phone !== 'string') {
      errors.push('Phone must be a string');
    }

    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  }
}
