import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import AppDataSource from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    // Obtenemos el repositorio de TypeORM desde AppDataSource
    this.userRepository = new UserRepository(AppDataSource.getRepository(User));
  }

  async create(req: Request, res: Response) {
    const { username, email, password, phone } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    try {
      // Verifica si el usuario o email ya existen
      const existingUser = await this.userRepository.findByUsername(username);
      if (existingUser) return res.status(409).json({ error: 'Username already exists.' });

      const existingEmail = await this.userRepository.findByEmail(email);
      if (existingEmail) return res.status(409).json({ error: 'Email already exists.' });

      // Crear usuario usando TypeORM
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await this.userRepository.create({ username, email, password: hashedPassword, phone });

      // No devuelvas la contraseña
      const { password: _, ...userSafe } = newUser;
      res.status(201).json(userSafe);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error creating user', details: error instanceof Error ? error.message : error });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.userRepository.findAll();
      const safeUsers = users.map(({ password, ...rest }) => rest);
      res.json(safeUsers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching users', details: error instanceof Error ? error.message : error });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findById(Number(req.params.id));
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { password, ...userSafe } = user;
      res.json(userSafe);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching user', details: error instanceof Error ? error.message : error });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updates = req.body;

      if (updates.password && updates.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
      }

      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const updatedUser = await this.userRepository.update(id, updates);
      if (!updatedUser) return res.status(404).json({ error: 'User not found or no changes provided.' });

      const { password, ...userSafe } = updatedUser;
      res.json(userSafe);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating user', details: error instanceof Error ? error.message : error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await this.userRepository.delete(id);
      if (!success) return res.status(404).json({ error: 'User not found.' });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error deleting user', details: error instanceof Error ? error.message : error });
    }
  }
}
