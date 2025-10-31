/**
 * Validators for Report API endpoints
 * Only validate structure/format, NOT business logic
 */

export class ReportValidator {
  // ============================================================================
  // Generate Report
  // ============================================================================
  static validateGenerateReportInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.spotId !== "number") {
      errors.push("spotId is required and must be a number");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateGenerateReportOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.id !== "number") {
      errors.push("id is required and must be a number");
    }

    if (typeof data.spotId !== "number") {
      errors.push("spotId is required and must be a number");
    }

    if (typeof data.waveHeight !== "number") {
      errors.push("waveHeight is required and must be a number");
    }

    if (typeof data.waveDirection !== "string") {
      errors.push("waveDirection is required and must be a string");
    }

    if (typeof data.wavePeriod !== "number") {
      errors.push("wavePeriod is required and must be a number");
    }

    if (typeof data.windSpeed !== "number") {
      errors.push("windSpeed is required and must be a number");
    }

    if (typeof data.windDirection !== "string") {
      errors.push("windDirection is required and must be a string");
    }

    if (typeof data.temperature !== "number") {
      errors.push("temperature is required and must be a number");
    }

    if (typeof data.conditions !== "string") {
      errors.push("conditions is required and must be a string");
    }

    if (typeof data.aiAnalysis !== "string") {
      errors.push("aiAnalysis is required and must be a string");
    }

    if (typeof data.createdAt !== "string") {
      errors.push("createdAt is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get Recent Reports
  // ============================================================================
  static validateGetRecentReportsInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (data.limit !== undefined && typeof data.limit !== "number") {
      errors.push("limit must be a number if provided");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateReportListOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data.reports)) {
      errors.push("reports is required and must be an array");
    } else {
      data.reports.forEach((report: any, index: number) => {
        if (typeof report.id !== "number") {
          errors.push(`reports[${index}].id must be a number`);
        }
        if (typeof report.spotId !== "number") {
          errors.push(`reports[${index}].spotId must be a number`);
        }
        if (typeof report.waveHeight !== "number") {
          errors.push(`reports[${index}].waveHeight must be a number`);
        }
        if (typeof report.conditions !== "string") {
          errors.push(`reports[${index}].conditions must be a string`);
        }
        if (typeof report.createdAt !== "string") {
          errors.push(`reports[${index}].createdAt must be a string`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get Report Stats
  // ============================================================================
  static validateGetReportStatsOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.total !== "number") {
      errors.push("total is required and must be a number");
    }

    if (typeof data.averageWaveHeight !== "number") {
      errors.push("averageWaveHeight is required and must be a number");
    }

    if (typeof data.averageWindSpeed !== "number") {
      errors.push("averageWindSpeed is required and must be a number");
    }

    if (typeof data.mostCommonCondition !== "string") {
      errors.push("mostCommonCondition is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Search Reports
  // ============================================================================
  static validateSearchReportsInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (data.query !== undefined && typeof data.query !== "string") {
      errors.push("query must be a string if provided");
    }

    if (data.minWaveHeight !== undefined && typeof data.minWaveHeight !== "number") {
      errors.push("minWaveHeight must be a number if provided");
    }

    if (data.maxWaveHeight !== undefined && typeof data.maxWaveHeight !== "number") {
      errors.push("maxWaveHeight must be a number if provided");
    }

    if (data.conditions !== undefined && typeof data.conditions !== "string") {
      errors.push("conditions must be a string if provided");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get Reports By Zone/Spot
  // ============================================================================
  static validateGetReportsByIdInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.id || typeof data.id !== "string") {
      errors.push("id is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Get Report By Id
  // ============================================================================
  static validateGetReportByIdOutput(data: any): { valid: boolean; errors?: string[] } {
    return ReportValidator.validateGenerateReportOutput(data);
  }

  // ============================================================================
  // Get Weather Forecast
  // ============================================================================
  static validateGetWeatherForecastInput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.spotId || typeof data.spotId !== "string") {
      errors.push("spotId is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  static validateGetWeatherForecastOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (typeof data.spotId !== "number") {
      errors.push("spotId is required and must be a number");
    }

    if (!Array.isArray(data.forecast)) {
      errors.push("forecast is required and must be an array");
    } else {
      data.forecast.forEach((item: any, index: number) => {
        if (typeof item.date !== "string") {
          errors.push(`forecast[${index}].date must be a string`);
        }
        if (typeof item.waveHeight !== "number") {
          errors.push(`forecast[${index}].waveHeight must be a number`);
        }
        if (typeof item.windSpeed !== "number") {
          errors.push(`forecast[${index}].windSpeed must be a number`);
        }
        if (typeof item.temperature !== "number") {
          errors.push(`forecast[${index}].temperature must be a number`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ============================================================================
  // Test Services
  // ============================================================================
  static validateTestServicesOutput(data: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!data.services || typeof data.services !== "object") {
      errors.push("services is required and must be an object");
    }

    if (typeof data.status !== "string") {
      errors.push("status is required and must be a string");
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
