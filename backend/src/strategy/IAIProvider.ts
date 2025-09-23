import { WeatherData, Zone } from '../types';

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
}

export interface ReportRequest {
  weatherData: WeatherData;
  localidadNombre: string;
  preferencias?: string;
  zone?: Zone;
}

export interface IAIProvider {
  generateReport(request: ReportRequest): Promise<string>;
}