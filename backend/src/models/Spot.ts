import pool from '../config/database';
import { Spot, Zone } from '../types';

export class SpotModel {
  static async create(spot: Omit<Spot, 'zone'>): Promise<Spot> {
    const query = `
      INSERT INTO spots (place_id, location, display_name, zona, zona_id)
      VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6)
      RETURNING place_id, ST_X(location) as lon, ST_Y(location) as lat, display_name, zona, zona_id
    `;

    const values = [
      spot.place_id,
      parseFloat(spot.lon),
      parseFloat(spot.lat),
      spot.display_name,
      spot.zona,
      spot.zona_id
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return {
      place_id: row.place_id,
      lat: row.lat.toString(),
      lon: row.lon.toString(),
      display_name: row.display_name,
      zona: row.zona,
      zona_id: row.zona_id
    };
  }

  static async findByPlaceId(placeId: string): Promise<Spot | null> {
    const query = `
      SELECT s.place_id, ST_X(s.location) as lon, ST_Y(s.location) as lat,
             s.display_name, s.zona, s.zona_id,
             z.id as zone_id, z.name as zone_name, z.best_conditions, z.bad_conditions
      FROM spots s
      LEFT JOIN zones z ON s.zona_id = z.id
      WHERE s.place_id = $1
    `;

    const result = await pool.query(query, [placeId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      place_id: row.place_id,
      lat: row.lat.toString(),
      lon: row.lon.toString(),
      display_name: row.display_name,
      zona: row.zona,
      zona_id: row.zona_id,
      zone: row.zone_id ? {
        id: row.zone_id,
        name: row.zone_name,
        best_conditions: row.best_conditions,
        bad_conditions: row.bad_conditions
      } : undefined
    };
  }

  static async findAll(): Promise<Spot[]> {
    const query = `
      SELECT s.place_id, ST_X(s.location) as lon, ST_Y(s.location) as lat,
             s.display_name, s.zona, s.zona_id,
             z.id as zone_id, z.name as zone_name, z.best_conditions, z.bad_conditions
      FROM spots s
      LEFT JOIN zones z ON s.zona_id = z.id
      ORDER BY s.display_name
    `;

    const result = await pool.query(query);

    return result.rows.map(row => ({
      place_id: row.place_id,
      lat: row.lat.toString(),
      lon: row.lon.toString(),
      display_name: row.display_name,
      zona: row.zona,
      zona_id: row.zona_id,
      zone: row.zone_id ? {
        id: row.zone_id,
        name: row.zone_name,
        best_conditions: row.best_conditions,
        bad_conditions: row.bad_conditions
      } : undefined
    }));
  }

  static async findByZone(zonaId: number): Promise<Spot[]> {
    const query = `
      SELECT s.place_id, ST_X(s.location) as lon, ST_Y(s.location) as lat,
             s.display_name, s.zona, s.zona_id,
             z.id as zone_id, z.name as zone_name, z.best_conditions, z.bad_conditions
      FROM spots s
      LEFT JOIN zones z ON s.zona_id = z.id
      WHERE s.zona_id = $1
      ORDER BY s.display_name
    `;

    const result = await pool.query(query, [zonaId]);

    return result.rows.map(row => ({
      place_id: row.place_id,
      lat: row.lat.toString(),
      lon: row.lon.toString(),
      display_name: row.display_name,
      zona: row.zona,
      zona_id: row.zona_id,
      zone: row.zone_id ? {
        id: row.zone_id,
        name: row.zone_name,
        best_conditions: row.best_conditions,
        bad_conditions: row.bad_conditions
      } : undefined
    }));
  }

  static async delete(placeId: string): Promise<boolean> {
    const query = 'DELETE FROM spots WHERE place_id = $1';
    const result = await pool.query(query, [placeId]);
    return result.rowCount > 0;
  }
}