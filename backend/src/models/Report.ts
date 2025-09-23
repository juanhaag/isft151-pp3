import pool from '../config/database';
import { Report, WeatherData } from '../types';

export class ReportModel {
  static async create(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report> {
    const query = `
      INSERT INTO reports (spot_id, report_text, weather_data, user_preferences)
      VALUES ($1, $2, $3, $4)
      RETURNING id, spot_id, report_text, weather_data, user_preferences, created_at, updated_at
    `;

    const values = [
      report.spot_id,
      report.report_text,
      JSON.stringify(report.weather_data),
      report.user_preferences || null
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return {
      id: row.id,
      spot_id: row.spot_id,
      report_text: row.report_text,
      weather_data: row.weather_data,
      user_preferences: row.user_preferences,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  static async findById(id: string): Promise<Report | null> {
    const query = 'SELECT * FROM reports WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      spot_id: row.spot_id,
      report_text: row.report_text,
      weather_data: row.weather_data,
      user_preferences: row.user_preferences,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  static async findBySpotId(spotId: string, limit: number = 10): Promise<Report[]> {
    const query = `
      SELECT * FROM reports
      WHERE spot_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [spotId, limit]);

    return result.rows.map(row => ({
      id: row.id,
      spot_id: row.spot_id,
      report_text: row.report_text,
      weather_data: row.weather_data,
      user_preferences: row.user_preferences,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  static async findRecent(limit: number = 20): Promise<Report[]> {
    const query = `
      SELECT r.*, s.display_name as spot_name
      FROM reports r
      JOIN spots s ON r.spot_id = s.place_id
      ORDER BY r.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);

    return result.rows.map(row => ({
      id: row.id,
      spot_id: row.spot_id,
      report_text: row.report_text,
      weather_data: row.weather_data,
      user_preferences: row.user_preferences,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM reports WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}