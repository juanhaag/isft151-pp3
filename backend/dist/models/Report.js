"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class ReportModel {
    static async create(report) {
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
        const result = await database_1.default.query(query, values);
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
    static async findById(id) {
        const query = 'SELECT * FROM reports WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        if (result.rows.length === 0)
            return null;
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
    static async findBySpotId(spotId, limit = 10) {
        const query = `
      SELECT * FROM reports
      WHERE spot_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
        const result = await database_1.default.query(query, [spotId, limit]);
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
    static async findRecent(limit = 20) {
        const query = `
      SELECT r.*, s.display_name as spot_name
      FROM reports r
      JOIN spots s ON r.spot_id = s.place_id
      ORDER BY r.created_at DESC
      LIMIT $1
    `;
        const result = await database_1.default.query(query, [limit]);
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
    static async delete(id) {
        const query = 'DELETE FROM reports WHERE id = $1';
        const result = await database_1.default.query(query, [id]);
        return result.rowCount > 0;
    }
}
exports.ReportModel = ReportModel;
//# sourceMappingURL=Report.js.map