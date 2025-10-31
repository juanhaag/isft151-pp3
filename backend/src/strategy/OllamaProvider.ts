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

    const prompt = `You are a professional surf forecaster. You MUST respond with ONLY a valid JSON object in Spanish. DO NOT include any text before or after the JSON.

Analiza las condiciones de surf para ${localidadNombre || 'la costa'}.

${conditionsText}

Preferencias del usuario: ${preferencias || 'No especificadas'}

Datos meteorológicos (incluyen 2 días previos para análisis del swell):
${JSON.stringify(weatherData, null, 2)}

METODOLOGÍA DE ANÁLISIS DE SURF:
1. **Análisis Histórico del Swell (2 días previos):**
   - Verifica si entró el swell adecuado según las direcciones ideales del spot
   - Evalúa el tamaño del swell (wave_height), período (wave_period) y dirección (wave_direction)
   - Un swell de calidad tiene: altura 1.5-3m, período >10 segundos, dirección según best_conditions

2. **Persistencia del Swell:**
   - Si entró buen swell en días previos, evalúa si se mantiene en el día objetivo
   - El swell puede tardar 1-2 días en llegar completamente dependiendo de la ubicación

3. **Condiciones de Viento:**
   - Viento favorable: dirección según best_conditions y velocidad <15 km/h (offshore es mejor)
   - Viento desfavorable: misma dirección que el swell y >20 km/h (onshore fuerte)
   - Si viento y swell vienen de la misma dirección con alta intensidad: condiciones malas

4. **Rating del Spot:**
   - 5 (Excelente): Swell ideal entró 1-2 días antes, se mantiene, viento favorable <10 km/h
   - 4 (Bueno): Swell correcto presente, viento favorable <15 km/h
   - 3 (Regular): Swell o viento no ideal pero surfeable
   - 2 (Malo): Swell inadecuado o viento muy fuerte en dirección incorrecta
   - 1 (Muy malo): Condiciones flat o viento onshore muy fuerte

5. **Ubicación Geográfica:**
   - Considera que spots diferentes se favorecen por swells y vientos distintos
   - Un spot orientado al SE se beneficia de swell SE pero otro al norte puede necesitar swell S

RESPONDE ÚNICAMENTE CON ESTE JSON (sin texto adicional, sin markdown, solo el JSON):

{
  "best_day": "Nombre del día y fecha en español",
  "rating": 1-5 (número basado en análisis completo: swell histórico + persistencia + viento actual),
  "swell_history": {
    "entered_correctly": true/false,
    "days_ago": 0-2,
    "quality": "Excelente/Bueno/Regular/Malo",
    "explanation": "Breve análisis de si entró el swell adecuado en días previos"
  },
  "morning": {
    "wave_height": "X.X metros",
    "swell_direction": "Dirección en español (Norte/Sur/Este/Oeste/Sureste/etc)",
    "swell_period": "XX segundos",
    "wind_speed": "XX km/h",
    "wind_direction": "Dirección en español",
    "conditions": "Excelente/Buenas/Regulares/Malas/Muy Malas",
    "explanation": "Explicación considerando historia del swell y condiciones actuales"
  },
  "afternoon": {
    "wave_height": "X.X metros",
    "swell_direction": "Dirección en español",
    "swell_period": "XX segundos",
    "wind_speed": "XX km/h",
    "wind_direction": "Dirección en español",
    "conditions": "Excelente/Buenas/Regulares/Malas/Muy Malas",
    "explanation": "Explicación considerando historia del swell y condiciones actuales"
  },
  "best_time": "Mañana o Tarde",
  "best_time_reason": "Razón explicando por qué ese momento es mejor",
  "summary": "2-4 frases explicando: 1) si entró buen swell en días previos, 2) si se mantiene, 3) condiciones de viento, 4) recomendación final",
  "tide_high": "HH:MM (estima o usa 'N/A')",
  "tide_low": "HH:MM (estima o usa 'N/A')",
  "recommended_time": "HH:MM - HH:MM"
}

IMPORTANTE:
- Responde SOLO con el JSON, sin texto adicional
- TODO en español
- ANALIZA los 2 días previos para verificar entrada del swell
- Compara direcciones del swell con las best_conditions del spot
- Si swell y viento vienen de misma dirección con alta intensidad = malas condiciones
- Sé realista: no todos los días son buenos para surfear`;

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
            num_ctx: 16384, // Contexto: tamaño de la ventana de tokens de entrada (16k)
            num_predict: 4096, // Tokens máximos de salida (4k)
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 240000 // 2 minutos timeout para modelos locales
        }
      );

      if (!response.data || !response.data.response) {
        console.error('❌ No response from Ollama');
        throw new Error('No response generated from Ollama');
      }

      let reportText = response.data.response.trim();

      // Intentar extraer JSON si viene envuelto en markdown o texto
      const jsonMatch = reportText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reportText = jsonMatch[0];
      }

      // Validar que sea JSON válido
      try {
        JSON.parse(reportText);
        console.log('✅ Reporte JSON generado con Ollama');
      } catch (e) {
        console.warn('⚠️ La respuesta no es JSON válido, devolviendo como texto');
      }

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
