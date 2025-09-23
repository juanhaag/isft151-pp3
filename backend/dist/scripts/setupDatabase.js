"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDatabase = setupDatabase;
const fs_1 = require("fs");
const path_1 = require("path");
const database_1 = __importDefault(require("../config/database"));
async function setupDatabase() {
    try {
        console.log('🗄️  Setting up database...');
        const migrationPath = (0, path_1.join)(__dirname, '../database/migrations.sql');
        const migrationSQL = (0, fs_1.readFileSync)(migrationPath, 'utf8');
        await database_1.default.query(migrationSQL);
        console.log('✅ Database setup completed successfully!');
    }
    catch (error) {
        console.error('❌ Error setting up database:', error);
    }
    finally {
        await database_1.default.end();
    }
}
if (require.main === module) {
    setupDatabase();
}
//# sourceMappingURL=setupDatabase.js.map