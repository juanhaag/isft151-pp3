import { Repository } from 'typeorm';
import { User } from '../entities/User';
import AppDataSource from '../config/database';

export class UserRepository {
  private repository: Repository<User>;

  constructor(repository: Repository<User>) {
    this.repository = AppDataSource.getRepository(User);
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

    async update(id: number, updates: Partial<User>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    Object.assign(user, updates);
    return await this.repository.save(user);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

