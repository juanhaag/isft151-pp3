import { User } from '../entities/User';

export interface UserResourceData {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserResource {
  static single(user: User): UserResourceData {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static collection(users: User[]): UserResourceData[] {
    return users.map(user => this.single(user));
  }
}
