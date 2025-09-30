import pool from '../config/database';
import { IUser } from '../types';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async create(user: Omit<IUser, 'id' | 'created_at' | 'updated_at'>): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const query = `
      INSERT INTO users (username, email, password, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, phone, created_at, updated_at
    `;
    const values = [user.username, user.email, hashedPassword, user.phone || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: number): Promise<IUser | null> {
    const query = 'SELECT id, username, email, phone, created_at, updated_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<IUser | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<IUser[]> {
    const query = 'SELECT id, username, email, phone, created_at, updated_at FROM users ORDER BY username';
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id: number, updates: Partial<Omit<IUser, 'id' | 'created_at' | 'updated_at'>>): Promise<IUser | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.username) {
      fields.push(`username = $${paramCount++}`);
      values.push(updates.username);
    }
    if (updates.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      fields.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updates.phone);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, username, email, phone, created_at, updated_at
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}