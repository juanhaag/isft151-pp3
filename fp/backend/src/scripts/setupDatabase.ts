import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../config/database';

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up database...');

    const migrationPath = join(__dirname, '../database/migrations.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    await pool.query(migrationSQL);

    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };