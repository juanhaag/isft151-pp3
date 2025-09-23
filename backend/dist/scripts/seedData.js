"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExampleData = createExampleData;
exports.seedDatabase = seedDatabase;
require("reflect-metadata");
const database_1 = require("../config/database");
const ZoneRepository_1 = require("../repositories/ZoneRepository");
const SpotRepository_1 = require("../repositories/SpotRepository");
const zoneRepository = new ZoneRepository_1.ZoneRepository();
const spotRepository = new SpotRepository_1.SpotRepository();
const sampleZones = [
    {
        name: 'Zona Sur/Mar del Plata',
        best_conditions: {
            swell_direction: ['S', 'SW', 'W'],
            wind_direction: ['NE', 'E', 'SE'],
            tide: ['Mid to High'],
            swell_size: '1m+'
        },
        bad_conditions: {
            swell_direction: ['N', 'NE'],
            wind_direction: ['S', 'SW', 'W'],
            tide: ['Low'],
            swell_size: '0.5m-'
        }
    },
    {
        name: 'Costa Norte',
        best_conditions: {
            swell_direction: ['N', 'NE', 'E'],
            wind_direction: ['S', 'SW', 'W'],
            tide: ['Mid to High'],
            swell_size: '1.5m+'
        },
        bad_conditions: {
            swell_direction: ['S', 'SW'],
            wind_direction: ['N', 'NE', 'E'],
            tide: ['Low'],
            swell_size: '0.8m-'
        }
    }
];
const sampleSpots = [
    {
        place_id: '1',
        longitude: -58.690133968868736,
        latitude: -38.574136800000005,
        display_name: 'Monte Pasubio, Quequén, Partido de Necochea, Buenos Aires, Argentina',
        zona: 'Zona Sur / Mar del Plata',
        zona_id: 1
    },
    {
        place_id: '2',
        longitude: -57.5411,
        latitude: -38.0055,
        display_name: 'Playa Grande, Mar del Plata, Buenos Aires, Argentina',
        zona: 'Zona Sur / Mar del Plata',
        zona_id: 1
    },
    {
        place_id: '3',
        longitude: -56.6704,
        latitude: -38.0177,
        display_name: 'Miramar, Buenos Aires, Argentina',
        zona: 'Costa Norte',
        zona_id: 2
    }
];
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        // Inicializar conexión a base de datos
        await (0, database_1.initializeDatabase)();
        console.log('📊 Creating zones...');
        for (const zoneData of sampleZones) {
            try {
                const existingZone = await zoneRepository.findByName(zoneData.name);
                if (existingZone) {
                    console.log(`⚠️  Zone already exists: ${zoneData.name}`);
                    continue;
                }
                const zone = await zoneRepository.create(zoneData);
                console.log(`✅ Created zone: ${zone.name} (ID: ${zone.id})`);
            }
            catch (error) {
                console.error(`❌ Error creating zone ${zoneData.name}:`, error);
            }
        }
        console.log('📍 Creating spots...');
        for (const spotData of sampleSpots) {
            try {
                const existingSpot = await spotRepository.findById(spotData.place_id);
                if (existingSpot) {
                    console.log(`⚠️  Spot already exists: ${spotData.display_name}`);
                    continue;
                }
                // Create spot with proper location format
                const spotToCreate = {
                    place_id: spotData.place_id,
                    location: `POINT(${spotData.longitude} ${spotData.latitude})`,
                    display_name: spotData.display_name,
                    zona: spotData.zona,
                    zona_id: spotData.zona_id
                };
                const spot = await spotRepository.create(spotToCreate);
                console.log(`✅ Created spot: ${spot.display_name} (ID: ${spot.place_id})`);
            }
            catch (error) {
                console.error(`❌ Error creating spot ${spotData.display_name}:`, error);
            }
        }
        // Verificar datos creados
        console.log('🔍 Verifying seeded data...');
        const zones = await zoneRepository.findAll();
        const spots = await spotRepository.findAll();
        console.log(`📊 Total zones: ${zones.length}`);
        console.log(`📍 Total spots: ${spots.length}`);
        zones.forEach(zone => {
            console.log(`   • Zone: ${zone.name} (${zone.spots?.length || 0} spots)`);
        });
        spots.forEach(spot => {
            console.log(`   • Spot: ${spot.display_name} (Zone: ${spot.zona})`);
        });
        console.log('🎉 Database seeding completed successfully!');
        console.log('');
        console.log('🚀 You can now start the API with: npm run dev');
        console.log('');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        console.error('');
        console.error('🔧 Common solutions:');
        console.error('   • Ensure PostgreSQL is running');
        console.error('   • Check database connection in .env');
        console.error('   • Verify database exists and has PostGIS extension');
        console.error('   • Run: npm run db:setup first');
        console.error('');
        process.exit(1);
    }
}
// Función de utilidad para crear datos de ejemplo adicionales
async function createExampleData() {
    try {
        await (0, database_1.initializeDatabase)();
        // Crear zona de ejemplo adicional
        const newZone = await zoneRepository.create({
            name: 'Costa Atlántica',
            best_conditions: {
                swell_direction: ['E', 'SE', 'S'],
                wind_direction: ['W', 'NW', 'N'],
                tide: ['High'],
                swell_size: '2m+'
            }
        });
        console.log(`✅ Created example zone: ${newZone.name}`);
        // Crear spot de ejemplo
        const newSpot = await spotRepository.create({
            place_id: 'example_spot',
            location: 'POINT(-56.7 -37.8)',
            display_name: 'Playa Ejemplo, Costa Atlántica',
            zona: 'Costa Atlántica',
            zona_id: newZone.id
        });
        console.log(`✅ Created example spot: ${newSpot.display_name}`);
        return { zone: newZone, spot: newSpot };
    }
    catch (error) {
        console.error('Error creating example data:', error);
        throw error;
    }
}
if (require.main === module) {
    seedDatabase();
}
//# sourceMappingURL=seedData.js.map