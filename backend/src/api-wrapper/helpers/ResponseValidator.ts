/**
 * Helper to validate responses before sending them
 * This ensures ALL responses (success and errors) match the API specification
 */

import { Response } from "express";

export class ResponseValidator {
  /**
   * Validates and sends a response
   * @param res Express response object
   * @param statusCode HTTP status code
   * @param data Response data
   * @param validator Validator function that takes (data, statusCode) and returns validation result
   */
  static validateAndSend(
    res: Response,
    statusCode: number,
    data: any,
    validator: (data: any, statusCode: number) => { valid: boolean; errors?: string[] }
  ): Response {
    const validation = validator(data, statusCode);

    if (!validation.valid) {
      console.error(
        `[API Spec Validation Error] Status ${statusCode}:`,
        validation.errors
      );
      console.error("Response data:", JSON.stringify(data, null, 2));

    }

    return res.status(statusCode).json(data);
  }

  /**
   * Sends a response without validation (for gradual migration)
   */
  static send(res: Response, statusCode: number, data: any): Response {
    return res.status(statusCode).json(data);
  }
}
