import axios from 'axios';

export interface WeatherConditions {
  waveHeightAvg: number;
  wavePeriodAvg?: number;
  windSpeedAvg: number;
  windDirection: string;
  swellDirection?: string;
  tideState?: string;
  temperature?: number;
  cloudCover?: number;
}

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
}

/**
 * Servicio para generar embeddings de condiciones meteorológicas
 * Usa modelos de embeddings gratuitos para vectorizar las condiciones
 */
export class EmbeddingService {
  private readonly embeddingModel: string;
  private readonly embeddingDimensions: number;
  private readonly useLocalModel: boolean;
  private readonly huggingFaceApiKey?: string;

  constructor() {
    // Configuración del modelo de embeddings
    this.embeddingModel = process.env.EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
    this.embeddingDimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || '384');
    this.useLocalModel = process.env.USE_LOCAL_EMBEDDINGS === 'true';
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;

    console.log(`🔢 Embedding Service initialized with model: ${this.embeddingModel}`);
  }

  /**
   * Genera un texto descriptivo de las condiciones meteorológicas
   * Este texto será convertido a embedding
   */
  private generateConditionsText(conditions: WeatherConditions): string {
    const parts: string[] = [];

    // Información de olas
    parts.push(`wave height ${conditions.waveHeightAvg.toFixed(1)} meters`);
    if (conditions.wavePeriodAvg) {
      parts.push(`wave period ${conditions.wavePeriodAvg.toFixed(0)} seconds`);
    }

    // Información de viento
    parts.push(`wind speed ${conditions.windSpeedAvg.toFixed(1)} km/h`);
    parts.push(`wind direction ${conditions.windDirection}`);

    // Información de swell
    if (conditions.swellDirection) {
      parts.push(`swell direction ${conditions.swellDirection}`);
    }

    // Estado de marea
    if (conditions.tideState) {
      parts.push(`tide ${conditions.tideState}`);
    }

    // Temperatura
    if (conditions.temperature) {
      parts.push(`temperature ${conditions.temperature.toFixed(0)} celsius`);
    }

    // Nubosidad
    if (conditions.cloudCover !== undefined) {
      parts.push(`cloud cover ${conditions.cloudCover.toFixed(0)} percent`);
    }

    return parts.join(', ');
  }

  /**
   * Genera embedding usando Hugging Face Inference API (gratuito con límites)
   */
  private async generateEmbeddingHuggingFace(text: string): Promise<number[]> {
    if (!this.huggingFaceApiKey) {
      throw new Error('HUGGINGFACE_API_KEY not configured');
    }

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/pipeline/feature-extraction/${this.embeddingModel}`,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // La respuesta es un array de embeddings
      const embedding = Array.isArray(response.data[0]) ? response.data[0] : response.data;

      return embedding;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Hugging Face API error:', error.response?.data || error.message);
        throw new Error(`Hugging Face embedding failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Genera embedding usando un modelo local (Ollama u otro)
   */
  private async generateEmbeddingLocal(text: string): Promise<number[]> {
    try {
      const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const response = await axios.post(
        `${ollamaUrl}/api/embeddings`,
        {
          model: 'nomic-embed-text',
          prompt: text
        },
        {
          timeout: 30000
        }
      );

      return response.data.embedding;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Local embedding error:', error.response?.data || error.message);
        throw new Error(`Local embedding failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Genera embedding simple basado en características numéricas (fallback)
   * Menos preciso pero siempre disponible
   */
  private generateSimpleEmbedding(conditions: WeatherConditions): number[] {
    // Crear un embedding simple de 384 dimensiones basado en las características
    const embedding = new Array(this.embeddingDimensions).fill(0);

    // Normalizar valores a rangos 0-1
    const normalizedWaveHeight = Math.min(conditions.waveHeightAvg / 5.0, 1.0);
    const normalizedWavePeriod = conditions.wavePeriodAvg ? Math.min(conditions.wavePeriodAvg / 20.0, 1.0) : 0.5;
    const normalizedWindSpeed = Math.min(conditions.windSpeedAvg / 50.0, 1.0);
    const normalizedTemp = conditions.temperature ? (conditions.temperature + 10) / 50 : 0.5;
    const normalizedCloud = conditions.cloudCover ? conditions.cloudCover / 100 : 0.5;

    // Distribuir características en el vector
    const segmentSize = Math.floor(this.embeddingDimensions / 6);

    // Segmento 1: Altura de olas
    for (let i = 0; i < segmentSize; i++) {
      embedding[i] = normalizedWaveHeight * Math.cos(i / segmentSize * Math.PI);
    }

    // Segmento 2: Período de olas
    for (let i = segmentSize; i < segmentSize * 2; i++) {
      embedding[i] = normalizedWavePeriod * Math.sin((i - segmentSize) / segmentSize * Math.PI);
    }

    // Segmento 3: Velocidad del viento
    for (let i = segmentSize * 2; i < segmentSize * 3; i++) {
      embedding[i] = normalizedWindSpeed * Math.cos((i - segmentSize * 2) / segmentSize * Math.PI);
    }

    // Segmento 4: Temperatura
    for (let i = segmentSize * 3; i < segmentSize * 4; i++) {
      embedding[i] = normalizedTemp * Math.sin((i - segmentSize * 3) / segmentSize * Math.PI);
    }

    // Segmento 5: Nubosidad
    for (let i = segmentSize * 4; i < segmentSize * 5; i++) {
      embedding[i] = normalizedCloud * Math.cos((i - segmentSize * 4) / segmentSize * Math.PI);
    }

    // Segmento 6: Combinaciones
    for (let i = segmentSize * 5; i < this.embeddingDimensions; i++) {
      const factor = (i - segmentSize * 5) / (this.embeddingDimensions - segmentSize * 5);
      embedding[i] = (normalizedWaveHeight + normalizedWindSpeed) / 2 * Math.sin(factor * Math.PI * 2);
    }

    // Normalizar el vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  /**
   * Genera un embedding para las condiciones meteorológicas dadas
   */
  async generateEmbedding(conditions: WeatherConditions): Promise<EmbeddingResult> {
    try {
      const conditionsText = this.generateConditionsText(conditions);
      console.log(`📝 Generating embedding for conditions: "${conditionsText}"`);

      let embedding: number[];

      // Intentar diferentes métodos según configuración
      if (this.useLocalModel) {
        try {
          console.log('🔧 Using local model for embeddings...');
          embedding = await this.generateEmbeddingLocal(conditionsText);
        } catch (error) {
          console.warn('⚠️ Local model failed, falling back to simple embedding');
          embedding = this.generateSimpleEmbedding(conditions);
        }
      } else if (this.huggingFaceApiKey) {
        try {
          console.log('🤗 Using Hugging Face for embeddings...');
          embedding = await this.generateEmbeddingHuggingFace(conditionsText);
        } catch (error) {
          console.warn('⚠️ Hugging Face failed, falling back to simple embedding');
          embedding = this.generateSimpleEmbedding(conditions);
        }
      } else {
        console.log('📊 Using simple embedding method...');
        embedding = this.generateSimpleEmbedding(conditions);
      }

      // Asegurar que el embedding tenga las dimensiones correctas
      if (embedding.length !== this.embeddingDimensions) {
        console.warn(`⚠️ Embedding dimensions mismatch: got ${embedding.length}, expected ${this.embeddingDimensions}`);
        if (embedding.length > this.embeddingDimensions) {
          embedding = embedding.slice(0, this.embeddingDimensions);
        } else {
          // Rellenar con zeros
          embedding = [...embedding, ...new Array(this.embeddingDimensions - embedding.length).fill(0)];
        }
      }

      console.log(`✅ Embedding generated successfully (${embedding.length} dimensions)`);

      return {
        embedding,
        dimensions: embedding.length
      };
    } catch (error) {
      console.error('❌ Error generating embedding:', error);
      // En caso de error completo, usar embedding simple como fallback final
      const embedding = this.generateSimpleEmbedding(conditions);
      return {
        embedding,
        dimensions: embedding.length
      };
    }
  }

  /**
   * Calcula la similitud coseno entre dos embeddings
   */
  calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Extrae condiciones meteorológicas de los datos del reporte
   */
  extractConditionsFromWeatherData(weatherData: any): WeatherConditions {
    // Los datos pueden venir en weatherData.hourly o directamente en weatherData
    const data = weatherData.hourly || weatherData;

    // Calcular promedios
    const waveHeights = data.wave_height || [];
    const wavePeriods = data.wave_period || [];
    const windSpeeds = data.wind_speed_10m || [];
    const temps = data.temperature_2m || [];
    const clouds = data.cloud_cover || [];

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      waveHeightAvg: avg(waveHeights),
      wavePeriodAvg: wavePeriods.length > 0 ? avg(wavePeriods) : undefined,
      windSpeedAvg: avg(windSpeeds),
      windDirection: this.getMostCommonWindDirection(data.wind_direction_10m || []),
      swellDirection: this.getMostCommonWindDirection(data.wave_direction || []),
      temperature: temps.length > 0 ? avg(temps) : undefined,
      cloudCover: clouds.length > 0 ? avg(clouds) : undefined,
      tideState: 'unknown' // Esto podría mejorase con datos reales de mareas
    };
  }

  /**
   * Obtiene la dirección de viento/swell más común
   */
  private getMostCommonWindDirection(directions: number[]): string {
    if (directions.length === 0) return 'Unknown';

    // Convertir grados a direcciones cardinales
    const cardinalDirections = directions.map(deg => {
      if (deg >= 337.5 || deg < 22.5) return 'N';
      if (deg >= 22.5 && deg < 67.5) return 'NE';
      if (deg >= 67.5 && deg < 112.5) return 'E';
      if (deg >= 112.5 && deg < 157.5) return 'SE';
      if (deg >= 157.5 && deg < 202.5) return 'S';
      if (deg >= 202.5 && deg < 247.5) return 'SW';
      if (deg >= 247.5 && deg < 292.5) return 'W';
      return 'NW';
    });

    // Contar ocurrencias
    const counts: { [key: string]: number } = {};
    cardinalDirections.forEach(dir => {
      counts[dir] = (counts[dir] || 0) + 1;
    });

    // Retornar la más común
    return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }
}
