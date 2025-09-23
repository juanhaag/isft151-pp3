"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class GeminiProvider {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.model = config.model || 'gemini-1.5-flash-latest';
    }
    async generateReport(request) {
        const { weatherData, localidadNombre, preferencias, zone } = request;
        let bestConditionsText = '';
        if (zone && zone.best_conditions) {
            const conditions = zone.best_conditions;
            bestConditionsText = `
        Condiciones ideales para ${zone.name}:
        - Dirección del swell: ${conditions.swell_direction.join(', ')}
        - Dirección del viento: ${conditions.wind_direction.join(', ')}
        - Marea: ${conditions.tide.join(', ')}
        - Tamaño del swell: ${conditions.swell_size}
      `;
        }
        const prompt = `
      Tu rol es ser un analista de surf extremadamente conciso para ${localidadNombre || 'la costa'}.
      Tu única tarea es analizar los datos y las preferencias del usuario para dar una recomendación clara y directa.

      INSTRUCCIONES ESTRICTAS:
      1. **Identifica la mejor zona para surfear** (ej: "zona norte", "playas del sur", "los spots reparados").
      2. **Justifícalo en una sola frase** explicando cómo la dirección del viento y del swell favorecen esa zona.
      3. **DESCRIBI los dias que creas nesesarios que van a haber olas**.
      4. **Si el usuario agrego prefrencias agregalas a la respuesta caso contrario no agregues nada**.
      5. **Tu respuesta debe tener entre 30 y 80 palabras MÁXIMO.**
      6. **Detalla las condiciones de las olas y el swell, no el clima general.**

      ${bestConditionsText}

      Ejemplo de respuesta ideal:
      "La mejor opción son las playas del sur. Quedan bien reparadas del viento del norte y el swell del sudeste entra perfecto."

      Preferencias del usuario: "${preferencias || 'condiciones generales'}"

      Datos a analizar:
      ${JSON.stringify(weatherData, null, 2)}
    `;
        try {
            console.log('Enviando prompt optimizado a Gemini...');
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
                contents: [{ parts: [{ text: prompt }] }],
            });
            const reportText = response.data.candidates[0].content.parts[0].text;
            return reportText;
        }
        catch (error) {
            console.error('Error calling Gemini API:', error);
            throw new Error('Failed to generate report with Gemini');
        }
    }
}
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=GeminiProvider.js.map