import axios from "axios";
import { IAIProvider, AIProviderConfig, ReportRequest } from "./IAIProvider";

export class GeminiProvider implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || "gemini-2.5-flash-lite";
  }

  async generateReport(request: ReportRequest): Promise<string> {
    const { weatherData, localidadNombre, preferencias, spot } = request;

    let conditionsText = "";
    if (spot) {
      let bestConditionsText = "";
      if (spot.best_conditions) {
        const conditions = spot.best_conditions;
        const parts = [];
        if (
          conditions.swell_direction &&
          conditions.swell_direction.length > 0
        ) {
          parts.push(
            `- Dirección del swell: ${conditions.swell_direction.join(", ")}`
          );
        }
        if (conditions.wind_direction && conditions.wind_direction.length > 0) {
          parts.push(
            `- Dirección del viento: ${conditions.wind_direction.join(", ")}`
          );
        }
        if (conditions.wave_type && conditions.wave_type.length > 0) {
          parts.push(`- Tipo de ola: ${conditions.wave_type.join(", ")}`);
        }
        if (conditions.wave_direction && conditions.wave_direction.length > 0) {
          parts.push(
            `- Dirección de la ola: ${conditions.wave_direction.join(", ")}`
          );
        }
        if (conditions.tide && conditions.tide.length > 0) {
          parts.push(`- Marea: ${conditions.tide.join(", ")}`);
        }
        if (conditions.notes) {
          parts.push(`- Notas: ${conditions.notes}`);
        }
        if (parts.length > 0) {
          bestConditionsText = `\nCondiciones ideales para ${
            spot.display_name
          }:\n${parts.join("\n")}`;
        }
      }

      let badConditionsText = "";
      if (spot.bad_conditions) {
        const conditions = spot.bad_conditions;
        const parts = [];
        if (
          conditions.swell_direction &&
          conditions.swell_direction.length > 0
        ) {
          parts.push(
            `- Dirección del swell desfavorable: ${conditions.swell_direction.join(
              ", "
            )}`
          );
        }
        if (conditions.wind_direction && conditions.wind_direction.length > 0) {
          parts.push(
            `- Dirección del viento desfavorable: ${conditions.wind_direction.join(
              ", "
            )}`
          );
        }
        if (conditions.notes) {
          parts.push(`- Notas: ${conditions.notes}`);
        }
        if (parts.length > 0) {
          badConditionsText = `\nCondiciones desfavorables para ${
            spot.display_name
          }:\n${parts.join("\n")}`;
        }
      }

      conditionsText = bestConditionsText + badConditionsText;
    }

    const prompt = `You are a professional surf forecaster. You MUST respond with ONLY a valid JSON object in Spanish. DO NOT include any text before or after the JSON.

Analiza las condiciones de surf para ${localidadNombre || "la costa"}.

${conditionsText}

Preferencias del usuario: ${preferencias || "No especificadas"}

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
      console.log("Enviando prompt optimizado a Gemini...");
      console.log(`Usando modelo: ${this.model}`);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.candidates || response.data.candidates.length === 0) {
        console.error("No candidates returned from Gemini API");
        throw new Error("No response generated from Gemini");
      }

      let reportText = response.data.candidates[0].content.parts[0].text.trim();

      // Intentar extraer JSON si viene envuelto en markdown o texto
      const jsonMatch = reportText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reportText = jsonMatch[0];
      }

      // Validar que sea JSON válido
      try {
        JSON.parse(reportText);
        console.log("✅ Reporte JSON generado con Gemini");
      } catch (e) {
        console.warn(
          "⚠️ La respuesta no es JSON válido, devolviendo como texto"
        );
      }

      return reportText;
    } catch (error: any) {
      if (error.response) {
        console.error("Gemini API Error Response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
        throw new Error(
          `Gemini API error (${error.response.status}): ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error.request) {
        console.error("No response from Gemini API:", error.message);
        throw new Error("No response from Gemini API");
      } else {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate report with Gemini");
      }
    }
  }
}
