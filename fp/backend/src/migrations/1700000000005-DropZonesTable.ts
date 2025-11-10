import { MigrationInterface, QueryRunner } from "typeorm";

export class DropZonesTable1700000000005 implements MigrationInterface {
    name = 'DropZonesTable1700000000005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop zones table and all related indexes
        await queryRunner.query(`DROP INDEX IF EXISTS idx_zones_best_conditions;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_zones_location;`);
        await queryRunner.query(`DROP TABLE IF EXISTS zones CASCADE;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate zones table (for rollback purposes)
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

        // Recreate indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_zones_location ON zones USING GIST (location);`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_zones_best_conditions ON zones USING GIN (best_conditions);`);
    }
}
