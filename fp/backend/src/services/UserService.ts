import { UserRepository } from "../repositories/UserRepository";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(AppDataSource.getRepository(User));
  }

  /**
   * Creates a new user with hashed password
   * @throws Error if user already exists
   */
  async createUser(data: CreateUserDTO): Promise<User> {
    // Check if username already exists
    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user with hashed password
    const userData: Partial<User> = {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
    };

    return await this.userRepository.create(userData);
  }

  /**
   * Updates a user, hashing password if provided
   * @throws Error if user not found
   */
  async updateUser(id: number, data: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<User> = { ...data };

    // Hash password if being updated
    if (data.password) {
      updates.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, updates);
    if (!updatedUser) {
      throw new Error("Error updating user");
    }

    return updatedUser;
  }

  /**
   * Finds a user by ID
   */
  async findUserById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  /**
   * Finds a user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Finds a user by username
   */
  async findUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  /**
   * Gets all users
   */
  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  /**
   * Deletes a user by ID
   * @throws Error if user not found
   */
  async deleteUser(id: number): Promise<void> {
    const success = await this.userRepository.delete(id);
    if (!success) {
      throw new Error("User not found");
    }
  }

  /**
   * Hashes a password (utility method)
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Verifies a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
