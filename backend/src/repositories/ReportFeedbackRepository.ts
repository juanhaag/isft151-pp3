import { AppDataSource } from '../config/database';
import { ReportFeedback } from '../entities/ReportFeedback';
import { Repository } from 'typeorm';

export class ReportFeedbackRepository {
  private repository: Repository<ReportFeedback>;

  constructor() {
    this.repository = AppDataSource.getRepository(ReportFeedback);
  }

  /**
   * Crear nuevo feedback
   */
  async create(feedbackData: {
    report_id: string;
    user_id?: string;
    rating: number;
    comment?: string;
    weather_accuracy_rating?: number;
    recommendation_helpfulness?: number;
  }): Promise<ReportFeedback> {
    const feedback = this.repository.create(feedbackData);
    return await this.repository.save(feedback);
  }

  /**
   * Obtener feedback por ID
   */
  async findById(id: string): Promise<ReportFeedback | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['report', 'user']
    });
  }

  /**
   * Obtener todo el feedback de un reporte
   */
  async findByReportId(reportId: string): Promise<ReportFeedback[]> {
    return await this.repository.find({
      where: { report_id: reportId },
      relations: ['user'],
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Obtener feedback de un usuario
   */
  async findByUserId(userId: string, limit: number = 20): Promise<ReportFeedback[]> {
    return await this.repository.find({
      where: { user_id: userId },
      relations: ['report'],
      order: { created_at: 'DESC' },
      take: limit
    });
  }

  /**
   * Obtener estadísticas de feedback de un reporte
   */
  async getReportFeedbackStats(reportId: string): Promise<{
    averageRating: number;
    totalCount: number;
    ratingDistribution: { [key: number]: number };
    averageWeatherAccuracy: number;
    averageRecommendationHelpfulness: number;
  }> {
    const feedbacks = await this.findByReportId(reportId);

    if (feedbacks.length === 0) {
      return {
        averageRating: 0,
        totalCount: 0,
        ratingDistribution: {},
        averageWeatherAccuracy: 0,
        averageRecommendationHelpfulness: 0
      };
    }

    const ratingDistribution: { [key: number]: number } = {};
    let totalRating = 0;
    let totalWeatherAccuracy = 0;
    let totalRecommendationHelpfulness = 0;
    let weatherAccuracyCount = 0;
    let recommendationHelpfulnessCount = 0;

    feedbacks.forEach(feedback => {
      totalRating += feedback.rating;
      ratingDistribution[feedback.rating] = (ratingDistribution[feedback.rating] || 0) + 1;

      if (feedback.weather_accuracy_rating) {
        totalWeatherAccuracy += feedback.weather_accuracy_rating;
        weatherAccuracyCount++;
      }

      if (feedback.recommendation_helpfulness) {
        totalRecommendationHelpfulness += feedback.recommendation_helpfulness;
        recommendationHelpfulnessCount++;
      }
    });

    return {
      averageRating: totalRating / feedbacks.length,
      totalCount: feedbacks.length,
      ratingDistribution,
      averageWeatherAccuracy: weatherAccuracyCount > 0 ? totalWeatherAccuracy / weatherAccuracyCount : 0,
      averageRecommendationHelpfulness: recommendationHelpfulnessCount > 0 ? totalRecommendationHelpfulness / recommendationHelpfulnessCount : 0
    };
  }

  /**
   * Actualizar feedback
   */
  async update(id: string, updateData: Partial<ReportFeedback>): Promise<ReportFeedback | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Eliminar feedback
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Verificar si un usuario ya dio feedback a un reporte
   */
  async hasUserProvidedFeedback(reportId: string, userId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        report_id: reportId,
        user_id: userId
      }
    });
    return count > 0;
  }

  /**
   * Obtener feedback reciente del sistema
   */
  async findRecent(limit: number = 20): Promise<ReportFeedback[]> {
    return await this.repository.find({
      relations: ['report', 'user'],
      order: { created_at: 'DESC' },
      take: limit
    });
  }

  /**
   * Obtener reportes mejor valorados
   */
  async findTopRatedReports(limit: number = 10): Promise<{
    report_id: string;
    average_rating: number;
    feedback_count: number;
  }[]> {
    const result = await this.repository
      .createQueryBuilder('feedback')
      .select('feedback.report_id', 'report_id')
      .addSelect('AVG(feedback.rating)', 'average_rating')
      .addSelect('COUNT(*)', 'feedback_count')
      .groupBy('feedback.report_id')
      .having('COUNT(*) >= 3') // Al menos 3 feedbacks para ser considerado
      .orderBy('average_rating', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(r => ({
      report_id: r.report_id,
      average_rating: parseFloat(r.average_rating),
      feedback_count: parseInt(r.feedback_count)
    }));
  }
}
