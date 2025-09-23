import AppDataSource from '../config/database';

async function addZoneLocationColumns() {
  try {
    await AppDataSource.initialize();
    
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('Adding location columns to zones table...');

    // Add the new columns if they don't exist
    const addLocationColumn = `
      ALTER TABLE zones 
      ADD COLUMN IF NOT EXISTS location GEOMETRY(POINT, 4326);
    `;

    const addLatitudeColumn = `
      ALTER TABLE zones 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
    `;

    const addLongitudeColumn = `
      ALTER TABLE zones 
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    `;

    // Create spatial index
    const createSpatialIndex = `
      CREATE INDEX IF NOT EXISTS idx_zones_location 
      ON zones USING GIST (location);
    `;

    await queryRunner.query(addLocationColumn);
    await queryRunner.query(addLatitudeColumn);
    await queryRunner.query(addLongitudeColumn);
    await queryRunner.query(createSpatialIndex);

    // Update existing zone with Mar del Plata coordinates
    const updateExistingZone = `
      UPDATE zones 
      SET latitude = -38.0055, 
          longitude = -57.5426, 
          location = ST_GeomFromText('POINT(-57.5426 -38.0055)', 4326)
      WHERE id = 1 AND latitude IS NULL;
    `;

    await queryRunner.query(updateExistingZone);

    console.log('✅ Zone location columns added successfully');
    console.log('✅ Spatial index created');
    console.log('✅ Existing zone updated with coordinates');

    await queryRunner.release();
    await AppDataSource.destroy();

  } catch (error) {
    console.error('❌ Error adding zone location columns:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  addZoneLocationColumns();
}

export default addZoneLocationColumns;
