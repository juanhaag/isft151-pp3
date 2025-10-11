/**
 * Validators for Zone API endpoints
 * Only validate structure/format, NOT business logic
 */

export class ZoneValidator {
  // ============================================================================
  // Get All Zones
  // ============================================================================
  static validateGetAllZonesOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data.zones)) {
      errors.push("zones is required and must be an array");
    } else {
      data.zones.forEach((zone: any, index: number) => {
        if (typeof zone.id !== "number") {
          errors.push(`zones[${index}].id must be a number`);
        }
        if (typeof zone.name !== "string") {
          errors.push(`zones[${index}].name must be a string`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get Zone By Id
  // ============================================================================
  static validateGetZoneByIdInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.id || typeof data.id !== "string") {
      errors.push("id is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateGetZoneByIdOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.id !== "number") {
      errors.push("id is required and must be a number");
    }

    if (typeof data.name !== "string") {
      errors.push("name is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Create Zone
  // ============================================================================
  static validateCreateZoneInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== "string") {
      errors.push("name is required and must be a string");
    }

    if (data.description !== undefined && typeof data.description !== "string") {
      errors.push("description must be a string if provided");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateCreateZoneOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.id !== "number") {
      errors.push("id is required and must be a number");
    }

    if (typeof data.name !== "string") {
      errors.push("name is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Update Zone
  // ============================================================================
  static validateUpdateZoneInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.id || typeof data.id !== "string") {
      errors.push("id is required and must be a string");
    }

    if (data.name !== undefined && typeof data.name !== "string") {
      errors.push("name must be a string if provided");
    }

    if (data.description !== undefined && typeof data.description !== "string") {
      errors.push("description must be a string if provided");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateUpdateZoneOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.id !== "number") {
      errors.push("id is required and must be a number");
    }

    if (typeof data.name !== "string") {
      errors.push("name is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Set Zone Location
  // ============================================================================
  static validateSetZoneLocationInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.id || typeof data.id !== "string") {
      errors.push("id is required and must be a string");
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

  static validateSetZoneLocationOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.id !== "number") {
      errors.push("id is required and must be a number");
    }

    if (typeof data.name !== "string") {
      errors.push("name is required and must be a string");
    }

    if (!data.location || typeof data.location !== "object") {
      errors.push("location is required and must be an object");
    } else {
      if (typeof data.location.latitude !== "number") {
        errors.push("location.latitude must be a number");
      }
      if (typeof data.location.longitude !== "number") {
        errors.push("location.longitude must be a number");
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get Spots Near Zone
  // ============================================================================
  static validateGetSpotsNearZoneInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.id || typeof data.id !== "string") {
      errors.push("id is required and must be a string");
    }

    if (data.radius !== undefined && typeof data.radius !== "number") {
      errors.push("radius must be a number if provided");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateGetSpotsNearZoneOutput(data: any): { valid: boolean; errors?: string[] } {
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
        if (typeof spot.distance !== "number") {
          errors.push(`spots[${index}].distance must be a number`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Update Spot Zones By Proximity
  // ============================================================================
  static validateUpdateSpotZonesByProximityInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (data.radius !== undefined && typeof data.radius !== "number") {
      errors.push("radius must be a number if provided");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateUpdateSpotZonesByProximityOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.updated !== "number") {
      errors.push("updated is required and must be a number");
    }

    if (typeof data.message !== "string") {
      errors.push("message is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
