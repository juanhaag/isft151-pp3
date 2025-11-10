/**
 * Application configuration
 * Centralizes all environment variables for easy access
 */

export const config = {
  api: {
    baseUrl: import.meta.env.PUBLIC_API_URL || 'http://localhost:3000',
    version: import.meta.env.PUBLIC_API_VERSION || 'v1',
    get url() {
      return `${this.baseUrl}/api/`;
    }
  },
  app: {
    name: import.meta.env.PUBLIC_APP_NAME || 'OlasApp',
    description: import.meta.env.PUBLIC_APP_DESCRIPTION || 'Reportes de Surf Inteligentes'
  },
  features: {
    weather: import.meta.env.PUBLIC_ENABLE_WEATHER === 'true',
    aiReports: import.meta.env.PUBLIC_ENABLE_AI_REPORTS === 'true'
  }
} as const;

// API Endpoints
export const endpoints = {
  auth: {
    login: `${config.api.url}/auth/login`,
    register: `${config.api.url}/auth/register`,
    logout: `${config.api.url}/auth/logout`,
    me: `${config.api.url}/auth/me`
  },
  spots: {
    list: `${config.api.url}/spots`,
    byId: (id: number) => `${config.api.url}/spots/${id}`,
    nearby: `${config.api.url}/spots/nearby`
  },
  reports: {
    create: `${config.api.url}/reports`,
    list: `${config.api.url}/reports`,
    byId: (id: number) => `${config.api.url}/reports/${id}`
  },
  weather: {
    current: `${config.api.url}/weather/current`,
    forecast: `${config.api.url}/weather/forecast`
  }
} as const;

export default config;
