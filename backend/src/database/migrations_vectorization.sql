-- Migración para sistema de vectorización y feedback
-- Paso 1: Instalar la extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Paso 2: Crear tabla de feedback de reportes
CREATE TABLE IF NOT EXISTS report_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    weather_accuracy_rating INTEGER CHECK (weather_accuracy_rating >= 1 AND weather_accuracy_rating <= 5),
    recommendation_helpfulness INTEGER CHECK (recommendation_helpfulness >= 1 AND recommendation_helpfulness <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paso 3: Crear tabla de embeddings de reportes
CREATE TABLE IF NOT EXISTS report_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,

    -- Vector de condiciones meteorológicas (384 dimensiones para all-MiniLM-L6-v2)
    weather_embedding vector(384),

    -- Metadatos de las condiciones para búsqueda
    wave_height_avg DECIMAL(5,2),
    wave_period_avg DECIMAL(5,2),
    wind_speed_avg DECIMAL(5,2),
    wind_direction VARCHAR(50),
    swell_direction VARCHAR(50),
    tide_state VARCHAR(50),

    -- Feedback agregado
    avg_rating DECIMAL(3,2),
    total_feedback_count INTEGER DEFAULT 0,

    -- Timestamps
    conditions_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Índice único por reporte
    UNIQUE(report_id)
);

-- Paso 4: Crear índice para búsqueda de similitud coseno
CREATE INDEX IF NOT EXISTS idx_report_embeddings_vector
ON report_embeddings
USING ivfflat (weather_embedding vector_cosine_ops)
WITH (lists = 100);

-- Paso 5: Crear índice para búsquedas por spot
CREATE INDEX IF NOT EXISTS idx_report_embeddings_spot_id
ON report_embeddings(spot_id);

-- Paso 6: Crear índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_report_embeddings_date
ON report_embeddings(conditions_date);

-- Paso 7: Crear índice para feedback por reporte
CREATE INDEX IF NOT EXISTS idx_report_feedback_report_id
ON report_feedback(report_id);

-- Paso 8: Crear índice para feedback por usuario
CREATE INDEX IF NOT EXISTS idx_report_feedback_user_id
ON report_feedback(user_id);

-- Paso 9: Función para actualizar el promedio de rating en embeddings
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
$$ LANGUAGE plpgsql;

-- Paso 10: Trigger para actualizar rating automáticamente
CREATE TRIGGER trigger_update_embedding_rating
AFTER INSERT OR UPDATE ON report_feedback
FOR EACH ROW
EXECUTE FUNCTION update_embedding_rating();

-- Paso 11: Vista para obtener reportes con feedback
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
LEFT JOIN report_embeddings re ON r.id = re.report_id;

-- Paso 12: Función para buscar reportes similares
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
        AND (1 - (re.weather_embedding <=> target_embedding)) >= similarity_threshold
        AND re.total_feedback_count > 0  -- Solo reportes con feedback
    ORDER BY similarity DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Comentarios sobre el uso
COMMENT ON TABLE report_feedback IS 'Almacena el feedback de usuarios sobre los reportes generados';
COMMENT ON TABLE report_embeddings IS 'Almacena vectores de embeddings de condiciones meteorológicas para búsqueda de similitud';
COMMENT ON FUNCTION find_similar_reports IS 'Busca reportes con condiciones meteorológicas similares usando búsqueda vectorial';
