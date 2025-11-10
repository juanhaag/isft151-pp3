/**
 * API Wrapper Types for Spot Endpoints
 */

// ============================================================================
// GET / - Get all spots
// ============================================================================
export interface GetAllSpotsInput {
  // No input required
}

export interface GetAllSpotsOutput {
  spots: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    zoneId?: number;
  }>;
}

export interface GetAllSpotsError {
  error: string;
  description: string;
}

// ============================================================================
// GET /:id - Get spot by id
// ============================================================================
export interface GetSpotByIdInput {
  id: string;
}

export interface GetSpotByIdOutput {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  zoneId?: number;
}

export interface GetSpotByIdError {
  error: string;
  description: string;
}

// ============================================================================
// GET /zone/:zoneId - Get spots by zone
// ============================================================================
export interface GetSpotsByZoneInput {
  zoneId: string;
}

export interface GetSpotsByZoneOutput {
  spots: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    zoneId?: number;
  }>;
}

export interface GetSpotsByZoneError {
  error: string;
  description: string;
}

// ============================================================================
// POST / - Create spot
// ============================================================================
export interface CreateSpotInput {
  name: string;
  latitude: number;
  longitude: number;
  zoneId?: number;
}

export interface CreateSpotOutput {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  zoneId?: number;
}

export interface CreateSpotError {
  error: string;
  description: string;
}
