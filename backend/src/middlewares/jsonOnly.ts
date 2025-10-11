import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para asegurar que solo se aceptan requests JSON
 * y todas las responses sean JSON
 */
export const jsonOnlyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        success: false,
        message: 'Content-Type debe ser application/json',
        error: 'Unsupported Media Type'
      });
    }
  }

  // Asegurar que todas las responses sean JSON
  res.setHeader('Content-Type', 'application/json');

  next();
};
