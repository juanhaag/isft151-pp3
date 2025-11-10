import 'reflect-metadata';
import { initializeDatabase } from '../config/database';
import { SpotRepository } from '../repositories/SpotRepository';
import { BestConditions, BadConditions } from '../entities';

const spotRepository = new SpotRepository();

// Spots de surf de Mar del Plata con condiciones detalladas
const surfSpots = [
  // Zona Norte
  {
    place_id: 'mdp_sunrider',
    longitude: -57.53842974113251,
    latitude: -37.954876392505504,
    display_name: 'Sunrider, Mar del Plata',
    zona: 'Mar del Plata Norte',
    best_conditions: {
      swell_direction: ['S', 'SE'],
      wind_direction: ['O', 'ONO'],
      wave_type: ['Point break'],
      wave_direction: ['Izquierda'],
      tide: ['Baja', 'Media', 'Alta'],
      notes: 'Point break de izquierdas en el norte. Tamaño ideal 2-6 pies. Nivel intermedio. Tener cuidado con rocas y corrientes.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O', 'NE'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Los vientos del este y sur son onshore o cross-onshore, generando condiciones desordenadas. No recibe oleaje del norte u oeste.'
    } as BadConditions
  },
  {
    place_id: 'mdp_estrada',
    longitude: -57.53972196992519,
    latitude: -37.9590353371911,
    display_name: 'Estrada, Mar del Plata',
    zona: 'Mar del Plata Norte',
    best_conditions: {
      swell_direction: ['S', 'SE'],
      wind_direction: ['O', 'NO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Media', 'Baja'],
      notes: 'Las mejores olas se forman cerca de las escolleras. Funciona bien con viento de tierra. Tamaño ideal 2-6 pies. Todos los niveles. Cuidado con espigones.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O', 'NE'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Los vientos onshore arruinan la formación de la ola. La marea alta puede hacer que la ola rompa contra la orilla (orillera).'
    } as BadConditions
  },
  {
    place_id: 'mdp_puerto_cardiel',
    longitude: -57.5434687530712,
    latitude: -37.9777066463614,
    display_name: 'Puerto Cardiel, Mar del Plata',
    zona: 'Mar del Plata Norte',
    best_conditions: {
      swell_direction: ['S', 'SE'],
      wind_direction: ['O', 'NO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Media', 'Baja'],
      notes: 'Olas de buena calidad, derechas e izquierdas. Muy popular entre los surfistas de la zona norte. Tamaño ideal 2-6 pies. Todos los niveles.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O', 'NE'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Los vientos del sur y sudeste son onshore y generan condiciones desordenadas.'
    } as BadConditions
  },
  {
    place_id: 'mdp_la_perla',
    longitude: -57.54452557294651,
    latitude: -37.99212382991072,
    display_name: 'La Perla, Mar del Plata',
    zona: 'Mar del Plata Norte',
    best_conditions: {
      swell_direction: ['S', 'SE', 'E'],
      wind_direction: ['O', 'NO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Media', 'Baja'],
      notes: 'Spot clásico con múltiples picos. Muy consistente con la combinación correcta de swell del sur y viento del oeste. Tamaño ideal 2-6 pies. Todos los niveles.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Muy expuesto a los vientos del este, que son onshore y generan choppy. Puede haber mucha gente (multitudes).'
    } as BadConditions
  },
  {
    place_id: 'mdp_la_pepita',
    longitude: -57.540819831718196,
    latitude: -37.998756081219135,
    display_name: 'La Pepita, Mar del Plata',
    zona: 'Mar del Plata Norte',
    best_conditions: {
      swell_direction: ['S', 'SE', 'E'],
      wind_direction: ['O', 'NO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Media', 'Baja'],
      notes: 'Condiciones similares a La Perla. Los bancos de arena pueden ser cambiantes debido al refulado. Tamaño ideal 1-5 pies. Todos los niveles.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Condiciones desfavorables idénticas a las de La Perla debido a su proximidad. Bancos cambiantes.'
    } as BadConditions
  },

  // Zona Centro
  {
    place_id: 'mdp_la_popular',
    longitude: -57.540525250667514,
    latitude: -38.001072452613876,
    display_name: 'La Popular, Mar del Plata',
    zona: 'Mar del Plata Centro',
    best_conditions: {
      swell_direction: ['E', 'SE', 'S'],
      wind_direction: ['O', 'NO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Media', 'Baja'],
      notes: 'Spot céntrico y muy accesible. Puede estar muy concurrido. Tamaño ideal 2-5 pies. Todos los niveles.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'La calidad de la ola se degrada rápidamente con vientos onshore. La alta afluencia de gente (multitudes) puede ser un problema.'
    } as BadConditions
  },
  {
    place_id: 'mdp_varese',
    longitude: -57.530600418453446,
    latitude: -38.014150177536436,
    display_name: 'Varese, Mar del Plata',
    zona: 'Mar del Plata Centro',
    best_conditions: {
      swell_direction: ['E', 'NE'],
      wind_direction: ['O', 'NO', 'SO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Baja', 'Media', 'Alta'],
      notes: 'Ideal para principiantes. Necesita un swell grande para funcionar debido a la protección de las escolleras. Tamaño ideal 1-3 pies. Cuidado con espigones.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['S', 'SO', 'O'],
      wind_direction: ['E', 'NE'],
      notes: 'Estará plano con la mayoría de los swells (pequeño/mediano). Los vientos del este pueden generar un pequeño choppy incómodo.'
    } as BadConditions
  },
  {
    place_id: 'mdp_biologia',
    longitude: -57.5301418875182,
    latitude: -38.02671185873845,
    display_name: 'Biología, Mar del Plata',
    zona: 'Mar del Plata Centro',
    best_conditions: {
      swell_direction: ['S', 'SE', 'E'],
      wind_direction: ['O', 'NO'],
      wave_type: ['Point break'],
      wave_direction: ['Izquierda'],
      tide: ['Media', 'Baja'],
      notes: 'Conocido por su larga izquierda que rompe a lo largo del espigón. Para surfistas de nivel intermedio a avanzado. Tamaño ideal 3-7 pies. Fondo arena/roca.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O', 'NE'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Las corrientes pueden ser fuertes. El viento onshore destruye la línea de la ola. Cuidado con el espigón.'
    } as BadConditions
  },
  {
    place_id: 'mdp_el_yacht',
    longitude: -57.53152823940271,
    latitude: -38.03053787500099,
    display_name: 'El Yacht, Mar del Plata',
    zona: 'Mar del Plata Centro',
    best_conditions: {
      swell_direction: ['NE', 'E'],
      wind_direction: ['ONO', 'O'],
      wave_type: ['Point break'],
      wave_direction: ['Izquierda'],
      tide: ['Baja', 'Media', 'Alta'],
      notes: 'Spot único que funciona con swell del NE. Cuidado con las fuertes corrientes de resaca (rips). Tamaño ideal 2-6 pies. Nivel intermedio. Fondo arena/roca.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['S', 'SO', 'O'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Totalmente bloqueado de los swells del sur por la Escollera Sur. Los vientos del este son directamente onshore. Corrientes fuertes.'
    } as BadConditions
  },
  {
    place_id: 'mdp_playa_grande',
    longitude: -57.531672485373996,
    latitude: -38.0289283553591,
    display_name: 'Playa Grande, Mar del Plata',
    zona: 'Mar del Plata Centro',
    best_conditions: {
      swell_direction: ['E', 'SE', 'S'],
      wind_direction: ['O', 'NO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Baja', 'Media', 'Alta'],
      notes: 'Playa muy grande y consistente con picos para todos los niveles. Un clásico de Mar del Plata. Tamaño ideal 2-7 pies. Fondo de arena.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Puede estar muy concurrido, especialmente en verano (multitudes). Los vientos del este generan condiciones desordenadas.'
    } as BadConditions
  },

  // Zona Sur
  {
    place_id: 'mdp_waikiki',
    longitude: -57.539109774025064,
    latitude: -38.080013395552186,
    display_name: 'Waikiki, Mar del Plata',
    zona: 'Mar del Plata Sur',
    best_conditions: {
      swell_direction: ['S', 'SE', 'E', 'NE'],
      wind_direction: ['SO', 'O'],
      wave_type: ['Point break'],
      wave_direction: ['Derecha'],
      tide: ['Baja', 'Media', 'Alta'],
      notes: 'Excelente para principiantes y longboarders. Olas suaves y largas. Muy consistente. Tamaño ideal 2-5 pies. Fondo arena/roca. Cuidado con rocas.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O'],
      wind_direction: ['E', 'S', 'SE', 'NE'],
      notes: 'Aunque maneja muchas condiciones, los vientos fuertes del este o sur lo desordenan. Puede haber mucha gente (multitudes).'
    } as BadConditions
  },
  {
    place_id: 'mdp_mariano',
    longitude: -57.53801429527699,
    latitude: -38.08285758034673,
    display_name: 'Mariano, Mar del Plata',
    zona: 'Mar del Plata Sur',
    best_conditions: {
      swell_direction: ['SE', 'S'],
      wind_direction: ['NO', 'O'],
      wave_type: ['Reef break'],
      wave_direction: ['Izquierda'],
      tide: ['Media', 'Baja'],
      notes: 'Izquierda de alta calidad, veloz y tubular sobre fondo de rocas. Para surfistas experimentados (intermedio/avanzado). Tamaño ideal 3-8 pies.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O', 'NE', 'E'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Peligroso con marea baja y swell grande. Los vientos onshore lo hacen impracticable. Rocas sumergidas son un peligro constante.'
    } as BadConditions
  },
  {
    place_id: 'mdp_la_serena',
    longitude: -57.575693967525424,
    latitude: -38.108593034632605,
    display_name: 'La Serena, Mar del Plata',
    zona: 'Mar del Plata Sur',
    best_conditions: {
      swell_direction: ['S', 'SE', 'E'],
      wind_direction: ['O', 'NO', 'SO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Baja', 'Media', 'Alta'],
      notes: 'Playa extensa con múltiples picos, buena para iniciarse y surfistas de nivel intermedio/principiante. Tamaño ideal 2-6 pies. Fondo de arena.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O'],
      wind_direction: ['E', 'S', 'SE', 'NE'],
      notes: 'Como todo beach break expuesto, sufre mucho con los vientos onshore. Puede haber multitudes.'
    } as BadConditions
  },
  {
    place_id: 'mdp_chapadmalal',
    longitude: -57.69062083136213,
    latitude: -38.20687539673014,
    display_name: 'Chapadmalal, Mar del Plata',
    zona: 'Mar del Plata Sur',
    best_conditions: {
      swell_direction: ['S', 'SE'],
      wind_direction: ['O', 'NO', 'SO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Media', 'Baja'],
      notes: 'Zona con olas potentes y de calidad para surfistas experimentados (intermedio/avanzado). Máxima exposición a los swells del Atlántico Sur. Tamaño ideal 4-10 pies. Fondo arena/roca.'
    } as BestConditions,
    bad_conditions: {
      swell_direction: ['N', 'O', 'NE', 'E'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Las fuertes corrientes y los fondos de roca/arena pueden ser peligrosos. No es un lugar para principiantes. Rocas y corrientes son peligros constantes.'
    } as BadConditions
  }
];

async function seedSpots() {
  try {
    console.log('🏄 Starting Mar del Plata surf spots seeding...');
    console.log('='.repeat(60));

    // Inicializar conexión a base de datos
    await initializeDatabase();
    console.log('✅ Database connected\n');

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const spotData of surfSpots) {
      try {
        const existingSpot = await spotRepository.findById(spotData.place_id);
        if (existingSpot) {
          console.log(`⚠️  Skipped (exists): ${spotData.display_name}`);
          skipped++;
          continue;
        }

        // Create spot with proper WKT location format
        const spotToCreate = {
          place_id: spotData.place_id,
          location: `POINT(${spotData.longitude} ${spotData.latitude})`,
          display_name: spotData.display_name,
          zona: spotData.zona,
          best_conditions: spotData.best_conditions,
          bad_conditions: spotData.bad_conditions
        };

        await spotRepository.create(spotToCreate);
        console.log(`✅ Created: ${spotData.display_name}`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating spot ${spotData.display_name}:`, error);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Seeding Summary:');
    console.log(`   ✅ Created: ${created} spots`);
    console.log(`   ⚠️  Skipped: ${skipped} spots (already exist)`);
    console.log(`   ❌ Errors: ${errors} spots`);
    console.log('='.repeat(60));

    // Verificar datos creados
    console.log('\n🔍 Verifying seeded data...');
    const spots = await spotRepository.findAll();
    console.log(`📍 Total spots in database: ${spots.length}\n`);

    // Agrupar por zona
    const spotsByZona = spots.reduce((acc, spot) => {
      if (!acc[spot.zona]) {
        acc[spot.zona] = [];
      }
      acc[spot.zona].push(spot);
      return acc;
    }, {} as Record<string, typeof spots>);

    console.log('📍 Spots by zone:');
    Object.keys(spotsByZona).sort().forEach(zona => {
      console.log(`\n  🌊 ${zona} (${spotsByZona[zona].length} spots):`);
      spotsByZona[zona].forEach(spot => {
        const waveTypes = spot.best_conditions?.wave_type?.join(', ') || 'N/A';
        const waveDir = spot.best_conditions?.wave_direction?.join('/') || 'N/A';
        console.log(`     • ${spot.display_name.split(',')[0]} - ${waveTypes} (${waveDir})`);
      });
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Mar del Plata surf spots seeding completed successfully!');
    console.log('');
    console.log('📋 Spots loaded:');
    console.log('   🏄 Zona Norte: 5 spots (Sunrider → La Pepita)');
    console.log('   🏄 Zona Centro: 5 spots (La Popular → Playa Grande)');
    console.log('   🏄 Zona Sur: 4 spots (Waikiki → Chapadmalal)');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   • Start API: npm run dev');
    console.log('   • Generate report: POST /api/reports/generate');
    console.log('   • List spots: GET /api/spots');
    console.log('   • Get spot by ID: GET /api/spots/mdp_playa_grande');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding surf spots:', error);
    console.error('');
    console.error('🔧 Common solutions:');
    console.error('   • Ensure PostgreSQL is running');
    console.error('   • Check database connection in .env');
    console.error('   • Verify database exists and has PostGIS extension');
    console.error('   • Run migrations first: npm run migration:run');
    console.error('');
    process.exit(1);
  }
}

// Run seeder if executed directly
if (require.main === module) {
  seedSpots();
}

export { seedSpots, surfSpots };
