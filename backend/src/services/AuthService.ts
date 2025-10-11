import { UserRepository } from "../repositories/UserRepository";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


//PODRIAN ESTAR DENTRO DE UN ARCHIVO SEPARADO
export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(AppDataSource.getRepository(User));
  }

  async register(data: RegisterDTO): Promise<User> {
    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error("El email ya existe");
    }

    // Check if username already exists
    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error("El username ya existe");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userData: Partial<User> = {
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
    };

    const newUser = await this.userRepository.create(userData);

    return newUser;
  }


  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error("Credenciales inválidas");
    }

    const token = this.generateToken(user);

    return { user, token };
  }


  generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
    };

    const secret = process.env.JWT_SECRET || "secretkey";
    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    return jwt.sign(payload, secret, { expiresIn });
  }


  verifyToken(token: string): { id: number; email: string } {
    const secret = process.env.JWT_SECRET || "secretkey";

    try {
      const decoded = jwt.verify(token, secret) as { id: number; email: string };
      return decoded;
    } catch (error) {
      throw new Error("Token inválido o expirado");
    }
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }
}
