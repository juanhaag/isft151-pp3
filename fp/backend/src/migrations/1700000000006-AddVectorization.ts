import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVectorization1700000000006 implements MigrationInterface {
    name = 'AddVectorization1700000000006'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS report_feedback (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                report_id UUID NOT NULL,
                user_id INTEGER,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                weather_accuracy_rating INTEGER CHECK (weather_accuracy_rating >= 1 AND weather_accuracy_rating <= 5),
                recommendation_helpfulness INTEGER CHECK (recommendation_helpfulness >= 1 AND recommendation_helpfulness <= 5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_report_feedback_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
                CONSTRAINT fk_report_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS report_embeddings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                report_id UUID NOT NULL UNIQUE,
                spot_id VARCHAR(50) NOT NULL,
                weather_embedding vector(384),
                wave_height_avg DECIMAL(5,2),
                wave_period_avg DECIMAL(5,2),
                wind_speed_avg DECIMAL(5,2),
                wind_direction VARCHAR(50),
                swell_direction VARCHAR(50),
                tide_state VARCHAR(50),
                avg_rating DECIMAL(3,2),
                total_feedback_count INTEGER DEFAULT 0,
                conditions_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_report_embeddings_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
                CONSTRAINT fk_report_embeddings_spot FOREIGN KEY (spot_id) REFERENCES spots(place_id) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_report_embeddings_vector
            ON report_embeddings
            USING ivfflat (weather_embedding vector_cosine_ops)
            WITH (lists = 100)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_report_embeddings_spot_id
            ON report_embeddings(spot_id)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_report_embeddings_date
            ON report_embeddings(conditions_date)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_report_feedback_report_id
            ON report_feedback(report_id)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_report_feedback_user_id
            ON report_feedback(user_id)
        `);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_embedding_rating()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE report_embeddings
                SET
                    avg_rating = (
                        SELECT AVG(rating)::DECIMAL(3,2)
                        FROM report_feedback
                        WHERE report_id = NEW.report_id
                    ),
                    total_feedback_count = (
                        SELECT COUNT(*)
                        FROM report_feedback
                        WHERE report_id = NEW.report_id
                    )
                WHERE report_id = NEW.report_id;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trigger_update_embedding_rating ON report_feedback
        `);

        await queryRunner.query(`
            CREATE TRIGGER trigger_update_embedding_rating
            AFTER INSERT OR UPDATE ON report_feedback
            FOR EACH ROW
            EXECUTE FUNCTION update_embedding_rating()
        `);

        await queryRunner.query(`
            CREATE OR REPLACE VIEW reports_with_feedback AS
            SELECT
                r.id,
                r.spot_id,
                r.report_text,
                r.weather_data,
                r.created_at,
                re.avg_rating,
                re.total_feedback_count,
                re.wave_height_avg,
                re.wave_period_avg,
                re.wind_speed_avg,
                re.wind_direction,
                re.swell_direction,
                re.tide_state
            FROM reports r
            LEFT JOIN report_embeddings re ON r.id = re.report_id
        `);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION find_similar_reports(
                target_embedding vector(384),
                target_spot_id UUID,
                similarity_threshold DECIMAL DEFAULT 0.7,
                limit_results INTEGER DEFAULT 5
            )
            RETURNS TABLE (
                report_id UUID,
                spot_id UUID,
                similarity DECIMAL,
                avg_rating DECIMAL,
                total_feedback_count INTEGER,
                wave_height_avg DECIMAL,
                wind_speed_avg DECIMAL,
                conditions_date DATE
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT
                    re.report_id,
                    re.spot_id,
                    (1 - (re.weather_embedding <=> target_embedding))::DECIMAL(5,4) AS similarity,
                    re.avg_rating,
                    re.total_feedback_count,
                    re.wave_height_avg,
                    re.wind_speed_avg,
                    re.conditions_date
                FROM report_embeddings re
                WHERE
                    re.spot_id = target_spot_id
                    AND re.total_feedback_count > 0
                    AND re.avg_rating >= 4.0
                    AND (1 - (re.weather_embedding <=> target_embedding)) >= similarity_threshold
                ORDER BY similarity DESC
                LIMIT limit_results;
            END;
            $$ LANGUAGE plpgsql
        `);

        await queryRunner.query(`
            COMMENT ON TABLE report_feedback IS 'Almacena el feedback de usuarios sobre los reportes generados'
        `);

        await queryRunner.query(`
            COMMENT ON TABLE report_embeddings IS 'Almacena vectores de embeddings de condiciones meteorológicas para búsqueda de similitud'
        `);

        await queryRunner.query(`
            COMMENT ON FUNCTION find_similar_reports IS 'Busca reportes con condiciones meteorológicas similares usando búsqueda vectorial'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP VIEW IF EXISTS reports_with_feedback`);

        await queryRunner.query(`DROP FUNCTION IF EXISTS find_similar_reports`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_embedding_rating ON report_feedback`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_embedding_rating`);

        await queryRunner.query(`DROP INDEX IF EXISTS idx_report_feedback_user_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_report_feedback_report_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_report_embeddings_date`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_report_embeddings_spot_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_report_embeddings_vector`);

        await queryRunner.query(`DROP TABLE IF EXISTS report_embeddings`);
        await queryRunner.query(`DROP TABLE IF EXISTS report_feedback`);


    }
}
