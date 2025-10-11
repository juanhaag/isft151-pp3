import axios from 'axios';
import { IAIProvider, AIProviderConfig, ReportRequest } from './IAIProvider';

export class GeminiProvider implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-1.5-flash';
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

    const prompt = `
      Eres un analista de surf experto para ${localidadNombre || 'la costa'}.
      Tu tarea es analizar las condiciones meteorológicas y generar un reporte detallado en ESPAÑOL.

      FORMATO REQUERIDO DEL REPORTE:

      **🏄 Mejor día para surfear:** [Día de la semana y fecha]

      **📊 Análisis del día:**

      🌅 **Mañana (6:00 - 12:00):**
      - Altura de olas: [X metros]
      - Dirección del swell: [Dirección]
      - Viento: [Velocidad] km/h desde el [Dirección]
      - Condiciones: [Buenas/Regulares/Malas] - [Explicación breve del por qué]

      🌆 **Tarde (12:00 - 18:00):**
      - Altura de olas: [X metros]
      - Dirección del swell: [Dirección]
      - Viento: [Velocidad] km/h desde el [Dirección]
      - Condiciones: [Buenas/Regulares/Malas] - [Explicación breve del por qué]

      ⏰ **Mejor horario:** [Mañana/Tarde] - [Razón específica considerando viento, swell y marea]

      **💡 Resumen:**
      [2-3 frases explicando por qué ese día es el mejor, cómo afectan el viento y swell al spot, y qué esperar]

      ${conditionsText}

      **Preferencias del usuario:** ${preferencias || 'No especificadas'}

      INSTRUCCIONES IMPORTANTES:
      1. Responde SIEMPRE en español
      2. Usa el formato exacto mostrado arriba con los emojis
      3. Identifica el MEJOR día analizando altura de olas, dirección del swell y viento
      4. Compara condiciones de mañana vs tarde para ese día
      5. Considera las condiciones ideales y desfavorables del spot
      6. Sé específico con las razones (ej: "viento offshore mantiene las olas limpias", "swell del SE entra directo al spot")
      7. Si hay preferencias del usuario, inclúyelas en el análisis

      Datos meteorológicos a analizar:
      ${JSON.stringify(weatherData, null, 2)}
    `;

    try {
      console.log('Enviando prompt optimizado a Gemini...');
      console.log(`Usando modelo: ${this.model}`);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.data.candidates || response.data.candidates.length === 0) {
        console.error('No candidates returned from Gemini API');
        throw new Error('No response generated from Gemini');
      }

      const reportText = response.data.candidates[0].content.parts[0].text;
      return reportText;
    } catch (error: any) {
      if (error.response) {
        console.error('Gemini API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        throw new Error(`Gemini API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('No response from Gemini API:', error.message);
        throw new Error('No response from Gemini API');
      } else {
        console.error('Error calling Gemini API:', error);
        throw new Error('Failed to generate report with Gemini');
      }
    }
  }
}