import { Request, Response } from 'express';
import { ReportService, GenerateReportRequest } from '../services/ReportService';
import { ReportFeedbackRepository } from '../repositories/ReportFeedbackRepository';
import { AIProviderFactory, AIProviderType } from '../strategy/AIProviderFactory';

export class ReportController {
  private reportService: ReportService;
  private feedbackRepository: ReportFeedbackRepository;

  constructor() {
    this.reportService = new ReportService();
    this.feedbackRepository = new ReportFeedbackRepository();
  }

  generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { spotId, userPreferences, aiProvider, forecastDays, targetDate, userId } = req.body;

      if (!spotId) {
        res.status(400).json({
          success: false,
          error: 'spotId is required'
        });
        return;
      }

      // Validar aiProvider si se proporciona
      if (aiProvider && !Object.values(AIProviderType).includes(aiProvider)) {
        res.status(400).json({
          success: false,
          error: `Invalid AI provider. Available options: ${Object.values(AIProviderType).join(', ')}`
        });
        return;
      }

      // Validar forecastDays
      if (forecastDays && (forecastDays < 1 || forecastDays > 14)) {
        res.status(400).json({
          success: false,
          error: 'forecastDays must be between 1 and 14'
        });
        return;
      }

      // Validar targetDate si se proporciona
      if (targetDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(targetDate)) {
          res.status(400).json({
            success: false,
            error: 'targetDate must be in YYYY-MM-DD format'
          });
          return;
        }
      }

      // Cambiar proveedor de IA si se especifica
      if (aiProvider && aiProvider !== AIProviderType.GEMINI) {
        try {
          this.reportService.setAIProviderByType(aiProvider);
        } catch (providerError) {
          res.status(400).json({
            success: false,
            error: `Failed to set AI provider: ${providerError instanceof Error ? providerError.message : 'Unknown error'}`
          });
          return;
        }
      }

      const request: GenerateReportRequest = {
        spotId,
        userPreferences,
        aiProvider: aiProvider || AIProviderType.GEMINI,
        forecastDays: forecastDays || 7,
        targetDate,
        userId
      };

      const report = await this.reportService.generateReport(request);

      console.log('Generated Report:', report, 'using AI Provider:', request.aiProvider,'request:', request);
      
      // Parsear el report_text como JSON si es posible
      let aiAnalysis = null;
      try {
        aiAnalysis = JSON.parse(report.report_text);
      } catch (e) {
        // Si no es JSON, dejarlo como texto
        aiAnalysis = { summary: report.report_text };
      }

      // Construir respuesta estructurada para el frontend
      const responseData = {
        id: report.id,
        spot_id: report.spot_id,
        created_at: report.created_at,

        // Datos de la IA parseados
        ai_analysis: aiAnalysis,

        // Datos meteorológicos raw
        weather_data: report.weather_data,

        // Datos estructurados para el frontend
        location: report.spot?.display_name || 'Ubicación desconocida',
        date: targetDate || new Date().toISOString().split('T')[0],
        rating: aiAnalysis.rating || 3,

        wave_conditions: {
          height: `${aiAnalysis.morning?.wave_height || 'N/A'} - ${aiAnalysis.afternoon?.wave_height || 'N/A'}`,
          period: 'Calculando...',
          direction: aiAnalysis.morning?.swell_direction || 'N/A'
        },

        wind_conditions: {
          speed: `${aiAnalysis.morning?.wind_speed || 'N/A'} - ${aiAnalysis.afternoon?.wind_speed || 'N/A'}`,
          direction: aiAnalysis.morning?.wind_direction || 'N/A',
          condition: aiAnalysis.morning?.conditions || 'Regular'
        },

        tide_conditions: {
          high_tide: aiAnalysis.tide_high || 'N/A',
          low_tide: aiAnalysis.tide_low || 'N/A',
          best_time: aiAnalysis.recommended_time || aiAnalysis.best_time || 'N/A'
        },

        recommendation: aiAnalysis.summary || 'No disponible'
      };

      res.status(201).json({
        success: true,
        data: responseData,
        message: 'Surf report generated successfully'
      });
    } catch (error) {
      console.error('Error generating report:', error);

      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = errorMessage.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  };

  getReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Report ID is required'
        });
        return;
      }

      const report = await this.reportService.getReportById(id);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found'
        });
        return;
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getReportsBySpot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { spotId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!spotId) {
        res.status(400).json({
          success: false,
          error: 'Spot ID is required'
        });
        return;
      }

      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
        return;
      }

      const reports = await this.reportService.getReportsBySpot(spotId, limit);

      res.json({
        success: true,
        data: reports,
        meta: {
          count: reports.length,
          limit
        }
      });
    } catch (error) {
      console.error('Error fetching reports by spot:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getRecentReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
        return;
      }

      const reports = await this.reportService.getRecentReports(limit);

      res.json({
        success: true,
        data: reports,
        meta: {
          count: reports.length,
          limit
        }
      });
    } catch (error) {
      console.error('Error fetching recent reports:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };


  searchReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters long'
        });
        return;
      }

      if (limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
        return;
      }

      const reports = await this.reportService.searchReports(q.trim(), limit);

      res.json({
        success: true,
        data: reports,
        meta: {
          count: reports.length,
          limit,
          query: q.trim()
        }
      });
    } catch (error) {
      console.error('Error searching reports:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getReportStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.reportService.getReportStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching report stats:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getReportsWithGoodConditions = async (req: Request, res: Response): Promise<void> => {
    try {
      const minWaveHeight = parseFloat(req.query.minWaveHeight as string) || 1.0;

      if (minWaveHeight < 0 || minWaveHeight > 10) {
        res.status(400).json({
          success: false,
          error: 'minWaveHeight must be between 0 and 10 meters'
        });
        return;
      }

      const reports = await this.reportService.getReportsWithGoodConditions(minWaveHeight);

      res.json({
        success: true,
        data: reports,
        meta: {
          count: reports.length,
          minWaveHeight
        }
      });
    } catch (error) {
      console.error('Error fetching reports with good conditions:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getWeatherForecast = async (req: Request, res: Response): Promise<void> => {
    try {
      const { spotId } = req.params;
      const forecastDays = parseInt(req.query.forecastDays as string) || 7;

      if (!spotId) {
        res.status(400).json({
          success: false,
          error: 'Spot ID is required'
        });
        return;
      }

      if (forecastDays < 1 || forecastDays > 14) {
        res.status(400).json({
          success: false,
          error: 'forecastDays must be between 1 and 14'
        });
        return;
      }

      const forecast = await this.reportService.getWeatherForecast(spotId, forecastDays);

      res.json({
        success: true,
        data: forecast,
        meta: {
          forecastDays
        }
      });
    } catch (error) {
      console.error('Error fetching weather forecast:', error);

      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = errorMessage.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  };

  testServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const results = await this.reportService.testServices();

      const allServicesWorking = Object.values(results).every(status => status);

      res.json({
        success: true,
        data: {
          services: results,
          allServicesWorking,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error testing services:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  // ==================== FEEDBACK ENDPOINTS ====================

  /**
   * Crear feedback para un reporte
   */
  submitFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reportId } = req.params;
      const { rating, comment, weather_accuracy_rating, recommendation_helpfulness } = req.body;
      const userId = (req as any).user?.id; // Obtener del middleware de auth si existe

      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
        return;
      }

      // Verificar si el reporte existe
      const report = await this.reportService.getReportById(reportId);
      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found'
        });
        return;
      }

      // Crear feedback
      const feedback = await this.feedbackRepository.create({
        report_id: reportId,
        user_id: userId,
        rating,
        comment,
        weather_accuracy_rating,
        recommendation_helpfulness
      });

      res.status(201).json({
        success: true,
        data: feedback,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Obtener feedback de un reporte
   */
  getReportFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reportId } = req.params;

      const feedbacks = await this.feedbackRepository.findByReportId(reportId);
      const stats = await this.feedbackRepository.getReportFeedbackStats(reportId);

      res.json({
        success: true,
        data: {
          feedbacks,
          stats
        }
      });
    } catch (error) {
      console.error('Error fetching report feedback:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Buscar reportes similares
   */
  getSimilarReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reportId } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;

      if (limit < 1 || limit > 20) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 20'
        });
        return;
      }

      const result = await this.reportService.findSimilarReports(reportId, limit);

      res.json({
        success: true,
        data: result,
        meta: {
          similar_count: result.similar_reports.length,
          limit
        }
      });
    } catch (error) {
      console.error('Error finding similar reports:', error);

      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      const statusCode = errorMessage.includes('not found') ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  };

  /**
   * Obtener estadísticas de embeddings
   */
  getEmbeddingStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.reportService.getEmbeddingStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching embedding stats:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Obtener reportes mejor valorados
   */
  getTopRatedReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      if (limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 50'
        });
        return;
      }

      const topRated = await this.feedbackRepository.findTopRatedReports(limit);

      res.json({
        success: true,
        data: topRated,
        meta: {
          count: topRated.length,
          limit
        }
      });
    } catch (error) {
      console.error('Error fetching top rated reports:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
}