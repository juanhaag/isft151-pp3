import { WeatherData, Spot } from '../types';

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
}

export interface ReportRequest {
  weatherData: WeatherData;
  localidadNombre: string;
  preferencias?: string;
  spot?: Spot;
}

export interface IAIProvider {
  generateReport(request: ReportRequest): Promise<string>;
}