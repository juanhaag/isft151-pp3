import { Request } from 'express';

export interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  };
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export class AuthRequest {
  static validateRegister(data: any): { valid: boolean; errors?: string[] } {
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

  static validateLogin(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required');
    }

    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  }
}
