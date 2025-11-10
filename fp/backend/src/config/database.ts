import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Spot, Report, User, ReportFeedback, ReportEmbedding } from '../entities';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'surfdb',
  synchronize: false, // Deshabilitado - usar migraciones en su lugar
  logging: process.env.NODE_ENV === 'development',
  entities: [Spot, Report, User, ReportFeedback, ReportEmbedding],
  migrations: [__dirname + '/../migrations/*.ts'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established successfully');

      // Crear extensiones necesarias si no existen
      await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS postgis;');
      await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('📦 Extensions (PostGIS, pgvector) verified');
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};

export default AppDataSource;