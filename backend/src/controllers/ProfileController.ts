import { Request, Response } from 'express';
import { ReportRepository } from '../repositories/ReportRepository';

export class ProfileController {
  private reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  /**
   * Get all reports created by a specific user
   * GET /api/profile/:userId/reports
   */
  getUserReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid userId'
        });
        return;
      }

      const reports = await this.reportRepository.findByUserId(userId);

      // Parse report_text as JSON for better frontend consumption
      const parsedReports = reports.map(report => {
        let aiAnalysis = null;
        try {
          aiAnalysis = JSON.parse(report.report_text);
        } catch (e) {
          aiAnalysis = { summary: report.report_text };
        }

        return {
          id: report.id,
          spot_id: report.spot_id,
          ai_analysis: aiAnalysis,
          weather_data: report.weather_data,
          created_at: report.created_at,
          updated_at: report.updated_at
        };
      });

      res.status(200).json({
        success: true,
        data: {
          userId,
          totalReports: parsedReports.length,
          reports: parsedReports
        }
      });
    } catch (error) {
      console.error('Error fetching user reports:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user reports'
      });
    }
  };

  /**
   * Get a single report by ID (for sharing)
   * GET /api/profile/reports/:reportId
   */
  getReportById = async (req: Request, res: Response): Promise<void> => {
    try {
      const reportId = req.params.reportId;

      if (!reportId) {
        res.status(400).json({
          success: false,
          error: 'reportId is required'
        });
        return;
      }

      const report = await this.reportRepository.findById(reportId);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found'
        });
        return;
      }

      // Parse report_text as JSON
      let aiAnalysis = null;
      try {
        aiAnalysis = JSON.parse(report.report_text);
      } catch (e) {
        aiAnalysis = { summary: report.report_text };
      }

      res.status(200).json({
        success: true,
        data: {
          id: report.id,
          spot_id: report.spot_id,
          user_id: report.user_id,
          ai_analysis: aiAnalysis,
          weather_data: report.weather_data,
          created_at: report.created_at,
          updated_at: report.updated_at
        }
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch report'
      });
    }
  };
}
