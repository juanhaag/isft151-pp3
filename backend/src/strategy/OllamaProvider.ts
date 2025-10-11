import axios from 'axios';
import { IAIProvider, AIProviderConfig, ReportRequest } from './IAIProvider';

export interface OllamaProviderConfig extends AIProviderConfig {
  baseUrl?: string;
  model?: string;
}

export class OllamaProvider implements IAIProvider {
  private baseUrl: string;
  private model: string;

  constructor(config: OllamaProviderConfig) {
    // Ollama por defecto corre en localhost:11434
    this.baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = config.model || process.env.OLLAMA_MODEL || 'qwen2.5:7b';
  }

  async generateReport(request: ReportRequest): Promise<string> {
    const { weatherData, localidadNombre, preferencias, spot } = request;

    let conditionsText = '';
    if (spot) {
      let bestConditionsText = '';
      if (spot.best_conditions) {
        const conditions = spot.best_conditions;
        const parts = [];
        if (conditions.swell_direction && conditions.swell_direction.length > 0) {
          parts.push(`- Dirección del swell: ${conditions.swell_direction.join(', ')}`);
        }
        if (conditions.wind_direction && conditions.wind_direction.length > 0) {
          parts.push(`- Dirección del viento: ${conditions.wind_direction.join(', ')}`);
        }
        if (conditions.wave_type && conditions.wave_type.length > 0) {
          parts.push(`- Tipo de ola: ${conditions.wave_type.join(', ')}`);
        }
        if (conditions.wave_direction && conditions.wave_direction.length > 0) {
          parts.push(`- Dirección de la ola: ${conditions.wave_direction.join(', ')}`);
        }
        if (conditions.tide && conditions.tide.length > 0) {
          parts.push(`- Marea: ${conditions.tide.join(', ')}`);
        }
        if (conditions.notes) {
          parts.push(`- Notas: ${conditions.notes}`);
        }
        if (parts.length > 0) {
          bestConditionsText = `\nCondiciones ideales para ${spot.display_name}:\n${parts.join('\n')}`;
        }
      }

      let badConditionsText = '';
      if (spot.bad_conditions) {
        const conditions = spot.bad_conditions;
        const parts = [];
        if (conditions.swell_direction && conditions.swell_direction.length > 0) {
          parts.push(`- Dirección del swell desfavorable: ${conditions.swell_direction.join(', ')}`);
        }
        if (conditions.wind_direction && conditions.wind_direction.length > 0) {
          parts.push(`- Dirección del viento desfavorable: ${conditions.wind_direction.join(', ')}`);
        }
        if (conditions.notes) {
          parts.push(`- Notas: ${conditions.notes}`);
        }
        if (parts.length > 0) {
          badConditionsText = `\nCondiciones desfavorables para ${spot.display_name}:\n${parts.join('\n')}`;
        }
      }

      conditionsText = bestConditionsText + badConditionsText;
    }

    const prompt = `You are a surf analyst. You MUST respond in Spanish language only. DO NOT use Chinese, English or any other language.

Analiza las condiciones de surf para ${localidadNombre || 'la costa'} y genera un reporte en ESPAÑOL.

FORMATO OBLIGATORIO (copia esta estructura exactamente):

**🏄 Mejor día para surfear:** [Escribe el día de la semana y fecha en español]

**📊 Análisis del día:**

🌅 **Mañana (6:00 - 12:00):**
- Altura de olas: [X metros]
- Dirección del swell: [Norte/Sur/Este/Oeste/etc]
- Viento: [Velocidad] km/h desde el [Dirección en español]
- Condiciones: [Buenas/Regulares/Malas] - [Explicación en español de por qué]

🌆 **Tarde (12:00 - 18:00):**
- Altura de olas: [X metros]
- Dirección del swell: [Norte/Sur/Este/Oeste/etc]
- Viento: [Velocidad] km/h desde el [Dirección en español]
- Condiciones: [Buenas/Regulares/Malas] - [Explicación en español de por qué]

⏰ **Mejor horario:** [Mañana o Tarde] - [Razón específica en español]

**💡 Resumen:**
[Escribe 2-3 frases EN ESPAÑOL explicando por qué ese día es el mejor para surfear]

${conditionsText}

**Preferencias del usuario:** ${preferencias || 'No especificadas'}

IMPORTANTE - REGLAS ESTRICTAS:
1. TODO el reporte debe estar en ESPAÑOL (Spanish language)
2. NO uses chino, inglés ni ningún otro idioma
3. Usa palabras como: olas, swell, viento, marea, condiciones, mañana, tarde
4. Identifica el mejor día analizando los datos meteorológicos
5. Explica por qué es mejor la mañana o la tarde
6. Sé específico con direcciones del viento y swell

Ejemplo de respuesta correcta en español:
"**🏄 Mejor día para surfear:** Martes 15 de Octubre

**📊 Análisis del día:**

🌅 **Mañana (6:00 - 12:00):**
- Altura de olas: 1.2 metros
- Dirección del swell: Sudeste
- Viento: 15 km/h desde el Noroeste
- Condiciones: Buenas - El viento offshore mantiene las olas limpias

🌆 **Tarde (12:00 - 18:00):**
- Altura de olas: 1.5 metros
- Dirección del swell: Sudeste
- Viento: 25 km/h desde el Norte
- Condiciones: Regulares - El viento aumenta y las olas se pican

⏰ **Mejor horario:** Mañana - Viento más suave y offshore

**💡 Resumen:**
El mejor día para surfear es el martes porque el swell del sudeste entra directo con buena altura. La mañana será mejor ya que el viento noroeste mantiene las olas ordenadas. Por la tarde el viento aumenta y las condiciones empeoran."

Datos meteorológicos (analiza estos datos):
${JSON.stringify(weatherData, null, 2)}

RECUERDA: Responde TODO en español, no en chino ni inglés.`;

    try {
      console.log('🤖 Conectando con Ollama...');
      console.log(`📍 URL: ${this.baseUrl}`);
      console.log(`🧠 Modelo: ${this.model}`);

      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000 // 2 minutos timeout para modelos locales
        }
      );

      if (!response.data || !response.data.response) {
        console.error('❌ No response from Ollama');
        throw new Error('No response generated from Ollama');
      }

      const reportText = response.data.response.trim();
      console.log('✅ Reporte generado con Ollama');
      return reportText;

    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ No se pudo conectar con Ollama. ¿Está corriendo en el puerto correcto?');
        throw new Error(`Ollama no está disponible en ${this.baseUrl}. Asegúrate de que Ollama esté corriendo (ollama serve)`);
      } else if (error.response) {
        console.error('❌ Ollama Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        throw new Error(`Ollama API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('❌ No response from Ollama:', error.message);
        throw new Error(`No response from Ollama: ${error.message}`);
      } else {
        console.error('❌ Error calling Ollama:', error);
        throw new Error(`Failed to generate report with Ollama: ${error.message}`);
      }
    }
  }

  /**
   * Verifica que Ollama esté disponible y el modelo esté descargado
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Verificando conexión con Ollama...');

      // Test 1: Verificar que Ollama esté corriendo
      const healthResponse = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });

      if (healthResponse.status === 200) {
        console.log('✅ Ollama está corriendo');

        // Test 2: Verificar que el modelo esté disponible
        const models = healthResponse.data.models || [];
        const modelExists = models.some((m: any) => m.name === this.model);

        if (modelExists) {
          console.log(`✅ Modelo ${this.model} está disponible`);
          return true;
        } else {
          console.warn(`⚠️  Modelo ${this.model} no encontrado. Modelos disponibles:`,
            models.map((m: any) => m.name));
          console.log(`💡 Para descargar el modelo, ejecuta: ollama pull ${this.model}`);
          return false;
        }
      }

      return false;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.error(`❌ No se pudo conectar con Ollama en ${this.baseUrl}`);
        console.log('💡 Para iniciar Ollama, ejecuta: ollama serve');
      } else {
        console.error('❌ Error al verificar Ollama:', error.message);
      }
      return false;
    }
  }

  /**
   * Lista todos los modelos disponibles en Ollama
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });

      const models = response.data.models || [];
      return models.map((m: any) => m.name);
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      return [];
    }
  }
}
