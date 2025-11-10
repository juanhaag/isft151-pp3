import { User } from '../entities/User';

export interface AuthUserData {
  id: number;
  username: string;
  email: string;
  phone: string | null;
}

export interface RegisterResponseData {
  message: string;
  user: AuthUserData;
}

export interface LoginResponseData {
  message: string;
  user: AuthUserData;
}

export class AuthResource {
  static user(user: User): AuthUserData {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone || null,
    };
  }

  static register(user: User): RegisterResponseData {
    return {
      message: 'Usuario creado',
      user: this.user(user),
    };
  }

  static login(user: User): LoginResponseData {
    return {
      message: 'Login exitoso',
      user: this.user(user),
    };
  }
}
