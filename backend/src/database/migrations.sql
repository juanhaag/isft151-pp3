-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create zones table
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

-- Create spots table with PostGIS geometry
CREATE TABLE IF NOT EXISTS spots (
    place_id VARCHAR(50) PRIMARY KEY,
    location GEOMETRY(POINT, 4326) NOT NULL,
    display_name TEXT NOT NULL,
    zona VARCHAR(255) NOT NULL,
    zona_id INTEGER REFERENCES zones(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id VARCHAR(50) REFERENCES spots(place_id),
    report_text TEXT NOT NULL,
    weather_data JSONB NOT NULL,
    user_preferences TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create User table with PostGIS geometry
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spots_location ON spots USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_zones_location ON zones USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_spots_zona_id ON spots (zona_id);
CREATE INDEX IF NOT EXISTS idx_reports_spot_id ON reports (spot_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zones_best_conditions ON zones USING GIN (best_conditions);
-- Optional: indexes for faster lookups for User Table  
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- Insert sample zone data
INSERT INTO zones (id, name, latitude, longitude, location, best_conditions) VALUES
(1, 'Zona Sur/Mar del Plata', -38.0055, -57.5426, ST_GeomFromText('POINT(-57.5426 -38.0055)', 4326), '{
  "swell_direction": ["S", "SW", "W"],
  "wind_direction": ["NE", "E", "SE"],
  "tide": ["Mid to High"],
  "swell_size": ["1m+"]
}')
ON CONFLICT (id) DO NOTHING;

-- Function to find spots near a zone within a given radius (in meters)
CREATE OR REPLACE FUNCTION find_spots_near_zone(zone_id_param INTEGER, radius_meters NUMERIC DEFAULT 50000)
RETURNS TABLE (
    place_id VARCHAR(50),
    display_name TEXT,
    distance_meters NUMERIC
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

-- Function to update zone assignment for spots based on proximity
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