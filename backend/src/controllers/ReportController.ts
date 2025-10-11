import { Request, Response } from 'express';
import { ReportService, GenerateReportRequest } from '../services/ReportService';
import { AIProviderFactory, AIProviderType } from '../strategy/AIProviderFactory';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { spotId, userPreferences, aiProvider, forecastDays } = req.body;

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
        forecastDays: forecastDays || 7
      };

      const report = await this.reportService.generateReport(request);

      res.status(201).json({
        success: true,
        data: report,
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
}