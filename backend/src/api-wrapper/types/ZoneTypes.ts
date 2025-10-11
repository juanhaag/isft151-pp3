/**
 * API Wrapper Types for Zone Endpoints
 */

// ============================================================================
// GET / - Get all zones
// ============================================================================
export interface GetAllZonesInput {
  // No input required
}

export interface GetAllZonesOutput {
  zones: Array<{
    id: number;
    name: string;
    description?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  }>;
}

export interface GetAllZonesError {
  error: string;
  description: string;
}

// ============================================================================
// GET /:id - Get zone by id
// ============================================================================
export interface GetZoneByIdInput {
  id: string;
}

export interface GetZoneByIdOutput {
  id: number;
  name: string;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface GetZoneByIdError {
  error: string;
  description: string;
}

// ============================================================================
// POST / - Create zone
// ============================================================================
export interface CreateZoneInput {
  name: string;
  description?: string;
}

export interface CreateZoneOutput {
  id: number;
  name: string;
  description?: string;
}

export interface CreateZoneError {
  error: string;
  description: string;
}

// ============================================================================
// PUT /:id - Update zone
// ============================================================================
export interface UpdateZoneInput {
  id: string;
  name?: string;
  description?: string;
}

export interface UpdateZoneOutput {
  id: number;
  name: string;
  description?: string;
}

export interface UpdateZoneError {
  error: string;
  description: string;
}

// ============================================================================
// PUT /:id/location - Set zone location
// ============================================================================
export interface SetZoneLocationInput {
  id: string;
  latitude: number;
  longitude: number;
}

export interface SetZoneLocationOutput {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface SetZoneLocationError {
  error: string;
  description: string;
}

// ============================================================================
// GET /:id/nearby-spots - Get spots near zone
// ============================================================================
export interface GetSpotsNearZoneInput {
  id: string;
  radius?: number;
}

export interface GetSpotsNearZoneOutput {
  spots: Array<{
    id: number;
    name: string;
    distance: number;
  }>;
}

export interface GetSpotsNearZoneError {
  error: string;
  description: string;
}

// ============================================================================
// POST /update-spot-zones - Update spot zones by proximity
// ============================================================================
export interface UpdateSpotZonesByProximityInput {
  radius?: number;
}

export interface UpdateSpotZonesByProximityOutput {
  updated: number;
  message: string;
}

export interface UpdateSpotZonesByProximityError {
  error: string;
  description: string;
}
