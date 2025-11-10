import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateZoneToSpot1700000000004 implements MigrationInterface {
    name = 'MigrateZoneToSpot1700000000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add best_conditions and bad_conditions columns to spots table
        await queryRunner.query(`
            ALTER TABLE spots
            ADD COLUMN IF NOT EXISTS best_conditions JSONB NOT NULL DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS bad_conditions JSONB;
        `);

        // Migrate data from zones to spots (copy best_conditions and bad_conditions based on zona_id)
        await queryRunner.query(`
            UPDATE spots s
            SET
                best_conditions = z.best_conditions,
                bad_conditions = z.bad_conditions
            FROM zones z
            WHERE s.zona_id = z.id;
        `);

        // Create index for best_conditions on spots
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_spots_best_conditions ON spots USING GIN (best_conditions);
        `);

        // Remove zona_id foreign key constraint
        await queryRunner.query(`
            ALTER TABLE spots DROP CONSTRAINT IF EXISTS spots_zona_id_fkey;
        `);

        // Drop zona_id column
        await queryRunner.query(`
            ALTER TABLE spots DROP COLUMN IF EXISTS zona_id;
        `);

        // Drop index on zona_id (if exists)
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_spots_zona_id;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add zona_id column
        await queryRunner.query(`
            ALTER TABLE spots
            ADD COLUMN zona_id INTEGER;
        `);

        // Re-create foreign key constraint
        await queryRunner.query(`
            ALTER TABLE spots
            ADD CONSTRAINT spots_zona_id_fkey
            FOREIGN KEY (zona_id) REFERENCES zones(id);
        `);

        // Re-create index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_spots_zona_id ON spots (zona_id);
        `);

        // Drop best_conditions index
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_spots_best_conditions;
        `);

        // Remove columns from spots
        await queryRunner.query(`
            ALTER TABLE spots
            DROP COLUMN IF EXISTS best_conditions,
            DROP COLUMN IF EXISTS bad_conditions;
        `);
    }
}
