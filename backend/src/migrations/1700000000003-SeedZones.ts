import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedZones1700000000003 implements MigrationInterface {
    name = 'SeedZones1700000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert sample zone data
        await queryRunner.query(`
            INSERT INTO zones (id, name, latitude, longitude, location, best_conditions) VALUES
            (1, 'Zona Sur/Mar del Plata', -38.0055, -57.5426, ST_GeomFromText('POINT(-57.5426 -38.0055)', 4326), '{
              "swell_direction": ["S", "SW", "W"],
              "wind_direction": ["NE", "E", "SE"],
              "tide": ["Mid to High"],
              "swell_size": ["1m+"]
            }')
            ON CONFLICT (id) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM zones WHERE id = 1;`);
    }
}
