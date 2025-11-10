/**
 * API Wrapper Types for Report Endpoints
 */

// ============================================================================
// POST /generate - Generate report
// ============================================================================
export interface GenerateReportInput {
  spotId: number;
}

export interface GenerateReportOutput {
  id: number;
  spotId: number;
  waveHeight: number;
  waveDirection: string;
  wavePeriod: number;
  windSpeed: number;
  windDirection: string;
  temperature: number;
  conditions: string;
  aiAnalysis: string;
  createdAt: string;
}

export interface GenerateReportError {
  error: string;
  description: string;
}

// ============================================================================
// GET /recent - Get recent reports
// ============================================================================
export interface GetRecentReportsInput {
  limit?: number;
}

export interface GetRecentReportsOutput {
  reports: Array<{
    id: number;
    spotId: number;
    waveHeight: number;
    conditions: string;
    createdAt: string;
  }>;
}

export interface GetRecentReportsError {
  error: string;
  description: string;
}

// ============================================================================
// GET /stats - Get report stats
// ============================================================================
export interface GetReportStatsInput {
  // No input required
}

export interface GetReportStatsOutput {
  total: number;
  averageWaveHeight: number;
  averageWindSpeed: number;
  mostCommonCondition: string;
}

export interface GetReportStatsError {
  error: string;
  description: string;
}

// ============================================================================
// GET /good-conditions - Get reports with good conditions
// ============================================================================
export interface GetReportsWithGoodConditionsInput {
  // No input required
}

export interface GetReportsWithGoodConditionsOutput {
  reports: Array<{
    id: number;
    spotId: number;
    waveHeight: number;
    conditions: string;
    createdAt: string;
  }>;
}

export interface GetReportsWithGoodConditionsError {
  error: string;
  description: string;
}

// ============================================================================
// GET /search - Search reports
// ============================================================================
export interface SearchReportsInput {
  query?: string;
  minWaveHeight?: number;
  maxWaveHeight?: number;
  conditions?: string;
}

export interface SearchReportsOutput {
  reports: Array<{
    id: number;
    spotId: number;
    waveHeight: number;
    conditions: string;
    createdAt: string;
  }>;
}

export interface SearchReportsError {
  error: string;
  description: string;
}

// ============================================================================
// GET /zone/:zoneId - Get reports by zone
// ============================================================================
export interface GetReportsByZoneInput {
  zoneId: string;
}

export interface GetReportsByZoneOutput {
  reports: Array<{
    id: number;
    spotId: number;
    waveHeight: number;
    conditions: string;
    createdAt: string;
  }>;
}

export interface GetReportsByZoneError {
  error: string;
  description: string;
}

// ============================================================================
// GET /spot/:spotId - Get reports by spot
// ============================================================================
export interface GetReportsBySpotInput {
  spotId: string;
}

export interface GetReportsBySpotOutput {
  reports: Array<{
    id: number;
    spotId: number;
    waveHeight: number;
    conditions: string;
    createdAt: string;
  }>;
}

export interface GetReportsBySpotError {
  error: string;
  description: string;
}

// ============================================================================
// GET /:id - Get report by id
// ============================================================================
export interface GetReportByIdInput {
  id: string;
}

export interface GetReportByIdOutput {
  id: number;
  spotId: number;
  waveHeight: number;
  waveDirection: string;
  wavePeriod: number;
  windSpeed: number;
  windDirection: string;
  temperature: number;
  conditions: string;
  aiAnalysis: string;
  createdAt: string;
}

export interface GetReportByIdError {
  error: string;
  description: string;
}

// ============================================================================
// GET /weather/forecast/:spotId - Get weather forecast
// ============================================================================
export interface GetWeatherForecastInput {
  spotId: string;
}

export interface GetWeatherForecastOutput {
  spotId: number;
  forecast: Array<{
    date: string;
    waveHeight: number;
    windSpeed: number;
    temperature: number;
  }>;
}

export interface GetWeatherForecastError {
  error: string;
  description: string;
}

// ============================================================================
// GET /test/services - Test services
// ============================================================================
export interface TestServicesInput {
  // No input required
}

export interface TestServicesOutput {
  services: {
    [key: string]: string;
  };
  status: string;
}

export interface TestServicesError {
  error: string;
  description: string;
}
