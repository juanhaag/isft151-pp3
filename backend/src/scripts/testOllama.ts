import 'reflect-metadata';
import { OllamaProvider } from '../strategy/OllamaProvider';

/**
 * Script de prueba para Ollama
 *
 * Uso:
 * 1. Asegúrate de que Ollama esté corriendo: ollama serve
 * 2. Descarga el modelo si no lo tienes: ollama pull qwen2.5:7b
 * 3. Ejecuta este script: npm run test:ollama
 */

async function testOllama() {
  console.log('🤖 Test de Ollama Provider');
  console.log('='.repeat(60));

  // Crear instancia del provider
  const ollamaProvider = new OllamaProvider({
    apiKey: '', // No se necesita API key para Ollama
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen2.5:7b'
  });

  // Test 1: Verificar conexión
  console.log('\n📡 Test 1: Verificando conexión con Ollama...\n');
  const isConnected = await ollamaProvider.testConnection();

  if (!isConnected) {
    console.error('\n❌ No se pudo conectar con Ollama');
    console.log('\n💡 Soluciones:');
    console.log('   1. Verifica que Ollama esté corriendo: ollama serve');
    console.log('   2. Verifica la URL en .env: OLLAMA_BASE_URL=http://localhost:11434');
    console.log('   3. Descarga el modelo: ollama pull qwen2.5:7b');
    process.exit(1);
  }

  // Test 2: Listar modelos disponibles
  console.log('\n📋 Test 2: Listando modelos disponibles...\n');
  const models = await ollamaProvider.listModels();
  if (models.length > 0) {
    console.log('Modelos disponibles:');
    models.forEach(model => console.log(`   • ${model}`));
  } else {
    console.log('No se encontraron modelos');
  }

  // Test 3: Generar reporte de prueba
  console.log('\n🏄 Test 3: Generando reporte de surf de prueba...\n');

  const mockWeatherData = {
    wave_height: [1.2, 1.5, 1.8, 2.0, 1.7],
    wave_direction: [180, 185, 190, 185, 180],
    wave_period: [8, 9, 10, 9, 8],
    swell_wave_height: [1.0, 1.3, 1.6, 1.8, 1.5],
    swell_wave_direction: [175, 180, 185, 180, 175],
    swell_wave_period: [10, 11, 12, 11, 10],
    wind_speed_10m: [15, 12, 10, 8, 10],
    wind_direction_10m: [270, 265, 260, 270, 275],
    time: [
      '2025-01-15T09:00:00Z',
      '2025-01-15T12:00:00Z',
      '2025-01-15T15:00:00Z',
      '2025-01-15T18:00:00Z',
      '2025-01-15T21:00:00Z'
    ]
  };

  const mockSpot = {
    place_id: 'mdp_playa_grande',
    location: 'POINT(-57.531672485373996 -38.0289283553591)',
    display_name: 'Playa Grande, Mar del Plata',
    zona: 'Mar del Plata Centro',
    best_conditions: {
      swell_direction: ['E', 'SE', 'S'],
      wind_direction: ['O', 'NO'],
      wave_type: ['Beach break'],
      wave_direction: ['Izquierda', 'Derecha'],
      tide: ['Baja', 'Media', 'Alta'],
      notes: 'Playa muy grande y consistente con picos para todos los niveles.'
    },
    bad_conditions: {
      swell_direction: ['N', 'O'],
      wind_direction: ['E', 'S', 'SE'],
      notes: 'Los vientos del este generan condiciones desordenadas.'
    }
  };

  try {
    const startTime = Date.now();

    const report = await ollamaProvider.generateReport({
      weatherData: mockWeatherData as any,
      localidadNombre: 'Playa Grande, Mar del Plata',
      preferencias: 'Prefiero olas de 1-2 metros',
      spot: mockSpot as any
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('='.repeat(60));
    console.log('📝 REPORTE GENERADO:');
    console.log('='.repeat(60));
    console.log(report);
    console.log('='.repeat(60));
    console.log(`⏱️  Tiempo de generación: ${duration}s`);
    console.log('='.repeat(60));

    console.log('\n✅ Test completado exitosamente!');
    console.log('\n💡 Para usar Ollama en producción:');
    console.log('   1. Agrega a tu .env:');
    console.log('      AI_PROVIDER=ollama');
    console.log('      OLLAMA_BASE_URL=http://localhost:11434');
    console.log('      OLLAMA_MODEL=qwen2.5:7b');
    console.log('   2. O envía en el request: { "aiProvider": "ollama" }');

  } catch (error: any) {
    console.error('\n❌ Error generando reporte:', error.message);
    console.error('\nDetalles:', error);
  }
}

// Ejecutar test
testOllama()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
