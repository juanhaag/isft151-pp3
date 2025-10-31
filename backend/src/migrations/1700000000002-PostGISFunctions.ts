import { MigrationInterface, QueryRunner } from "typeorm";

export class PostGISFunctions1700000000002 implements MigrationInterface {
    name = 'PostGISFunctions1700000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Function to find spots near a zone within a given radius (in meters)
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION find_spots_near_zone(zone_id_param INTEGER, radius_meters NUMERIC DEFAULT 50000)
            RETURNS TABLE (
                place_id VARCHAR(50),
                display_name TEXT,
                distance_meters DOUBLE PRECISION
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    s.place_id,
                    s.display_name,
                    ST_Distance(z.location::geography, s.location::geography) as distance_meters
                FROM spots s
                CROSS JOIN zones z
                WHERE z.id = zone_id_param
                  AND z.location IS NOT NULL
                  AND ST_DWithin(z.location::geography, s.location::geography, radius_meters)
                ORDER BY ST_Distance(z.location::geography, s.location::geography);
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Function to update zone assignment for spots based on proximity
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_spot_zones_by_proximity(radius_meters NUMERIC DEFAULT 50000)
            RETURNS INTEGER AS $$
            DECLARE
                updated_count INTEGER := 0;
                zone_record RECORD;
                spot_record RECORD;
            BEGIN
                -- For each zone with location data
                FOR zone_record IN
                    SELECT id, location FROM zones WHERE location IS NOT NULL
                LOOP
                    -- Find spots within radius and update their zona_id
                    FOR spot_record IN
                        SELECT place_id
                        FROM spots
                        WHERE ST_DWithin(zone_record.location::geography, location::geography, radius_meters)
                          AND (zona_id IS NULL OR zona_id != zone_record.id)
                    LOOP
                        UPDATE spots
                        SET zona_id = zone_record.id,
                            zona = (SELECT name FROM zones WHERE id = zone_record.id)
                        WHERE place_id = spot_record.place_id;

                        updated_count := updated_count + 1;
                    END LOOP;
                END LOOP;

                RETURN updated_count;
            END;
            $$ LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_spot_zones_by_proximity(NUMERIC);`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS find_spots_near_zone(INTEGER, NUMERIC);`);
    }
}
