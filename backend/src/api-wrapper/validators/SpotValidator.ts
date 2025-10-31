/**
 * Validators for Spot API endpoints
 * Only validate structure/format, NOT business logic
 */

export class SpotValidator {
  // ============================================================================
  // Get All Spots
  // ============================================================================
  static validateGetAllSpotsOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data.spots)) {
      errors.push("spots is required and must be an array");
    } else {
      data.spots.forEach((spot: any, index: number) => {
        if (typeof spot.id !== "number") {
          errors.push(`spots[${index}].id must be a number`);
        }
        if (typeof spot.name !== "string") {
          errors.push(`spots[${index}].name must be a string`);
        }
        if (typeof spot.latitude !== "number") {
          errors.push(`spots[${index}].latitude must be a number`);
        }
        if (typeof spot.longitude !== "number") {
          errors.push(`spots[${index}].longitude must be a number`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get Spot By Id
  // ============================================================================
  static validateGetSpotByIdInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.id || typeof data.id !== "string") {
      errors.push("id is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateGetSpotByIdOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.id !== "number") {
      errors.push("id is required and must be a number");
    }

    if (typeof data.name !== "string") {
      errors.push("name is required and must be a string");
    }

    if (typeof data.latitude !== "number") {
      errors.push("latitude is required and must be a number");
    }

    if (typeof data.longitude !== "number") {
      errors.push("longitude is required and must be a number");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get Spots By Zone
  // ============================================================================
  static validateGetSpotsByZoneInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.zoneId || typeof data.zoneId !== "string") {
      errors.push("zoneId is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateGetSpotsByZoneOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data.spots)) {
      errors.push("spots is required and must be an array");
    } else {
      data.spots.forEach((spot: any, index: number) => {
        if (typeof spot.id !== "number") {
          errors.push(`spots[${index}].id must be a number`);
        }
        if (typeof spot.name !== "string") {
          errors.push(`spots[${index}].name must be a string`);
        }
        if (typeof spot.latitude !== "number") {
          errors.push(`spots[${index}].latitude must be a number`);
        }
        if (typeof spot.longitude !== "number") {
          errors.push(`spots[${index}].longitude must be a number`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Create Spot
  // ============================================================================
  static validateCreateSpotInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== "string") {
      errors.push("name is required and must be a string");
    }

    if (typeof data.latitude !== "number") {
      errors.push("latitude is required and must be a number");
    }

    if (typeof data.longitude !== "number") {
      errors.push("longitude is required and must be a number");
    }

    if (data.zoneId !== undefined && typeof data.zoneId !== "number") {
      errors.push("zoneId must be a number if provided");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateCreateSpotOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.id !== "number") {
      errors.push("id is required and must be a number");
    }

    if (typeof data.name !== "string") {
      errors.push("name is required and must be a string");
    }

    if (typeof data.latitude !== "number") {
      errors.push("latitude is required and must be a number");
    }

    if (typeof data.longitude !== "number") {
      errors.push("longitude is required and must be a number");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
