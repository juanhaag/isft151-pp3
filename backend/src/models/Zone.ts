import pool from '../config/database';
import { Zone, BestConditions } from '../types';

export class ZoneModel {
  static async create(zone: Omit<Zone, 'id'>): Promise<Zone> {
    const query = `
      INSERT INTO zones (name, best_conditions, bad_conditions)
      VALUES ($1, $2, $3)
      RETURNING id, name, best_conditions, bad_conditions
    `;

    const values = [
      zone.name,
      JSON.stringify(zone.best_conditions),
      zone.bad_conditions ? JSON.stringify(zone.bad_conditions) : null
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return {
      id: row.id,
      name: row.name,
      best_conditions: row.best_conditions,
      bad_conditions: row.bad_conditions
    };
  }

  static async findById(id: string): Promise<Zone | null> {
    const query = 'SELECT * FROM zones WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      best_conditions: row.best_conditions,
      bad_conditions: row.bad_conditions
    };
  }

  static async findAll(): Promise<Zone[]> {
    const query = 'SELECT * FROM zones ORDER BY name';
    const result = await pool.query(query);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      best_conditions: row.best_conditions,
      bad_conditions: row.bad_conditions
    }));
  }

  static async update(id: string, updates: Partial<Omit<Zone, 'id'>>): Promise<Zone | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.best_conditions) {
      fields.push(`best_conditions = $${paramCount++}`);
      values.push(JSON.stringify(updates.best_conditions));
    }
    if (updates.bad_conditions) {
      fields.push(`bad_conditions = $${paramCount++}`);
      values.push(JSON.stringify(updates.bad_conditions));
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE zones
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      best_conditions: row.best_conditions,
      bad_conditions: row.bad_conditions
    };
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM zones WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}