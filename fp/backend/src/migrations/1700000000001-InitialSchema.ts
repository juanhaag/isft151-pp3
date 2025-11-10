import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000001 implements MigrationInterface {
    name = 'InitialSchema1700000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable PostGIS extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

        // Create zones table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS zones (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                location GEOMETRY(POINT, 4326),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                best_conditions JSONB NOT NULL,
                bad_conditions JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create spots table with PostGIS geometry
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS spots (
                place_id VARCHAR(50) PRIMARY KEY,
                location GEOMETRY(POINT, 4326) NOT NULL,
                display_name TEXT NOT NULL,
                zona VARCHAR(255) NOT NULL,
                zona_id INTEGER REFERENCES zones(id),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create reports table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                spot_id VARCHAR(50) REFERENCES spots(place_id),
                report_text TEXT NOT NULL,
                weather_data JSONB NOT NULL,
                user_preferences TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create User table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_spots_location ON spots USING GIST (location);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_zones_location ON zones USING GIST (location);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_spots_zona_id ON spots (zona_id);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_reports_spot_id ON reports (spot_id);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_zones_best_conditions ON zones USING GIN (best_conditions);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_users_username;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_zones_best_conditions;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_reports_created_at;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_reports_spot_id;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_spots_zona_id;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_zones_location;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_spots_location;`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS users;`);
        await queryRunner.query(`DROP TABLE IF EXISTS reports;`);
        await queryRunner.query(`DROP TABLE IF EXISTS spots;`);
        await queryRunner.query(`DROP TABLE IF EXISTS zones;`);

        // Drop PostGIS extension
        await queryRunner.query(`DROP EXTENSION IF EXISTS postgis;`);
    }
}
