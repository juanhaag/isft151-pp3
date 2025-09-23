"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class ZoneModel {
    static async create(zone) {
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
        const result = await database_1.default.query(query, values);
        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            best_conditions: row.best_conditions,
            bad_conditions: row.bad_conditions
        };
    }
    static async findById(id) {
        const query = 'SELECT * FROM zones WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            best_conditions: row.best_conditions,
            bad_conditions: row.bad_conditions
        };
    }
    static async findAll() {
        const query = 'SELECT * FROM zones ORDER BY name';
        const result = await database_1.default.query(query);
        return result.rows.map(row => ({
            id: row.id,
            name: row.name,
            best_conditions: row.best_conditions,
            bad_conditions: row.bad_conditions
        }));
    }
    static async update(id, updates) {
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
        if (fields.length === 0)
            return null;
        values.push(id);
        const query = `
      UPDATE zones
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;
        const result = await database_1.default.query(query, values);
        if (result.rows.length === 0)
            return null;
        const row = result.rows[0];
        return {
            id: row.id,
            name: row.name,
            best_conditions: row.best_conditions,
            bad_conditions: row.bad_conditions
        };
    }
    static async delete(id) {
        const query = 'DELETE FROM zones WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rowCount > 0;
    }
}
exports.ZoneModel = ZoneModel;
//# sourceMappingURL=Zone.js.map