import 'reflect-metadata';
import { initializeDatabase } from '../config/database';
import { SpotRepository } from '../repositories/SpotRepository';
import { BestConditions, BadConditions } from '../entities';

const spotRepository = new SpotRepository();

const sampleSpots = [
  {
    place_id: '1',
    longitude: -58.690133968868736,
    latitude: -38.574136800000005,
    display_name: 'Monte Pasubio, Quequén, Partido de Necochea, Buenos Aires, Argentina',
    zona: 'Zona Sur / Mar del Plata',
    best_conditions: {
      swell_direction: ['S', 'SW', 'W'],
      wind_direction: ['NE', 'E', 'SE'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Mid to High'],
      notes: 'Beach break con oleaje consistente del sur. Funciona mejor con marea media a alta.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'NE'],
      wind_direction: ['S', 'SW', 'W'],
      notes: 'Vientos del sur son onshore y generan condiciones desordenadas.'
    } as BadConditions
  },
  {
    place_id: '2',
    longitude: -57.5411,
    latitude: -38.0055,
    display_name: 'Playa Grande, Mar del Plata, Buenos Aires, Argentina',
    zona: 'Zona Sur / Mar del Plata',
    best_conditions: {
      swell_direction: ['S', 'SW', 'SE'],
      wind_direction: ['N', 'NE', 'NW'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['All tides'],
      notes: 'Playa urbana popular. Funciona en todas las mareas.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N'],
      wind_direction: ['S', 'SE', 'SW'],
      notes: 'Vientos del sur y sudeste son onshore.'
    } as BadConditions
  },
  {
    place_id: '3',
    longitude: -56.6704,
    latitude: -38.0177,
    display_name: 'Miramar, Buenos Aires, Argentina',
    zona: 'Costa Norte',
    best_conditions: {
      swell_direction: ['E', 'SE', 'S'],
      wind_direction: ['W', 'NW', 'SW'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Mid to High'],
      notes: 'Beach break de la costa norte. Mejor con marea media a alta.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'NE'],
      wind_direction: ['E', 'SE'],
      notes: 'Vientos del este son onshore y crean condiciones difíciles.'
    } as BadConditions
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Inicializar conexión a base de datos
    await initializeDatabase();

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
          best_conditions: spotData.best_conditions,
          bad_conditions: spotData.bad_conditions
        };

        const spot = await spotRepository.create(spotToCreate);
        console.log(`✅ Created spot: ${spot.display_name} (ID: ${spot.place_id})`);
      } catch (error) {
        console.error(`❌ Error creating spot ${spotData.display_name}:`, error);
      }
    }

    // Verificar datos creados
    console.log('🔍 Verifying seeded data...');
    const spots = await spotRepository.findAll();

    console.log(`📍 Total spots: ${spots.length}`);

    spots.forEach(spot => {
      console.log(`   • Spot: ${spot.display_name} (Zone: ${spot.zona})`);
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('🚀 You can now start the API with: npm run dev');
    console.log('');

  } catch (error) {
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
export async function createExampleData() {
  try {
    await initializeDatabase();

    // Crear spot de ejemplo
    const newSpot = await spotRepository.create({
      place_id: 'example_spot',
      location: 'POINT(-56.7 -37.8)',
      display_name: 'Playa Ejemplo, Costa Atlántica',
      zona: 'Costa Atlántica',
      best_conditions: {
        swell_direction: ['E', 'SE', 'S'],
        wind_direction: ['W', 'NW', 'N'],
        wave_type: ['Beach break'],
        wave_direction: ['Izquierda', 'Derecha'],
        tide: ['High'],
        notes: 'Spot de ejemplo con buenas condiciones en marea alta.'
      },
      bad_conditions: {
        swell_direction: ['N'],
        wind_direction: ['E', 'SE'],
        notes: 'Evitar con vientos del este.'
      }
    });

    console.log(`✅ Created example spot: ${newSpot.display_name}`);

    return { spot: newSpot };
  } catch (error) {
    console.error('Error creating example data:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };