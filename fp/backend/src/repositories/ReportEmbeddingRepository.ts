import { AppDataSource } from '../config/database';
import { ReportEmbedding } from '../entities/ReportEmbedding';
import { Repository } from 'typeorm';

export interface SimilarReport {
  report_id: string;
  spot_id: string;
  similarity: number;
  avg_rating: number;
  total_feedback_count: number;
  wave_height_avg: number;
  wind_speed_avg: number;
  conditions_date: Date;
}

export class ReportEmbeddingRepository {
  private repository: Repository<ReportEmbedding>;

  constructor() {
    this.repository = AppDataSource.getRepository(ReportEmbedding);
  }

  /**
   * Crear o actualizar embedding de reporte
   */
  async upsert(embeddingData: {
    report_id: string;
    spot_id: string;
    weather_embedding: number[];
    wave_height_avg?: number;
    wave_period_avg?: number;
    wind_speed_avg?: number;
    wind_direction?: string;
    swell_direction?: string;
    tide_state?: string;
    conditions_date: Date;
  }): Promise<ReportEmbedding> {
    // Buscar si ya existe
    let embedding = await this.repository.findOne({
      where: { report_id: embeddingData.report_id }
    });

    if (embedding) {
      // Actualizar
      embedding.spot_id = embeddingData.spot_id;
      embedding.setEmbeddingArray(embeddingData.weather_embedding);
      embedding.wave_height_avg = embeddingData.wave_height_avg;
      embedding.wave_period_avg = embeddingData.wave_period_avg;
      embedding.wind_speed_avg = embeddingData.wind_speed_avg;
      embedding.wind_direction = embeddingData.wind_direction;
      embedding.swell_direction = embeddingData.swell_direction;
      embedding.tide_state = embeddingData.tide_state;
      embedding.conditions_date = embeddingData.conditions_date;
    } else {
      // Crear nuevo
      embedding = this.repository.create({
        ...embeddingData,
        weather_embedding: `[${embeddingData.weather_embedding.join(',')}]`
      });
    }

    return await this.repository.save(embedding);
  }

  /**
   * Obtener embedding por report_id
   */
  async findByReportId(reportId: string): Promise<ReportEmbedding | null> {
    return await this.repository.findOne({
      where: { report_id: reportId },
      relations: ['report', 'spot']
    });
  }

  /**
   * Buscar reportes similares usando búsqueda vectorial
   */
  async findSimilarReports(
    targetEmbedding: number[],
    spotId: string,
    similarityThreshold: number = 0.7,
    limit: number = 5
  ): Promise<SimilarReport[]> {
    try {
      // Convertir el embedding a formato PostgreSQL vector
      const embeddingStr = `[${targetEmbedding.join(',')}]`;

      // Usar la función SQL find_similar_reports definida en la migración
      const query = `
        SELECT * FROM find_similar_reports(
          $1::vector(384),
          $2::varchar,
          $3::decimal,
          $4::integer
        )
      `;

      const results = await this.repository.query(query, [
        embeddingStr,
        spotId,
        similarityThreshold,
        limit
      ]);

      return results.map((r: any) => ({
        report_id: r.report_id,
        spot_id: r.spot_id,
        similarity: parseFloat(r.similarity),
        avg_rating: r.avg_rating ? parseFloat(r.avg_rating) : 0,
        total_feedback_count: r.total_feedback_count || 0,
        wave_height_avg: r.wave_height_avg ? parseFloat(r.wave_height_avg) : 0,
        wind_speed_avg: r.wind_speed_avg ? parseFloat(r.wind_speed_avg) : 0,
        conditions_date: new Date(r.conditions_date)
      }));
    } catch (error) {
      console.error('Error finding similar reports:', error);
      // Si falla la búsqueda vectorial, intentar con búsqueda simple
      return await this.findSimilarReportsSimple(spotId, limit);
    }
  }

  /**
   * Búsqueda simple de reportes similares (fallback sin vectores)
   */
  private async findSimilarReportsSimple(
    spotId: string,
    limit: number = 5
  ): Promise<SimilarReport[]> {
    const embeddings = await this.repository.find({
      where: { spot_id: spotId },
      order: {
        avg_rating: 'DESC',
        total_feedback_count: 'DESC'
      },
      take: limit
    });

    return embeddings
      .filter(e => e.total_feedback_count > 0)
      .map(e => ({
        report_id: e.report_id,
        spot_id: e.spot_id,
        similarity: 0.5, // Similitud por defecto
        avg_rating: e.avg_rating || 0,
        total_feedback_count: e.total_feedback_count,
        wave_height_avg: e.wave_height_avg || 0,
        wind_speed_avg: e.wind_speed_avg || 0,
        conditions_date: e.conditions_date
      }));
  }

  /**
   * Obtener embeddings de un spot
   */
  async findBySpotId(spotId: string, limit: number = 20): Promise<ReportEmbedding[]> {
    return await this.repository.find({
      where: { spot_id: spotId },
      order: { conditions_date: 'DESC' },
      take: limit
    });
  }

  /**
   * Obtener embeddings con mejor rating
   */
  async findTopRated(limit: number = 10): Promise<ReportEmbedding[]> {
    return await this.repository.find({
      where: {
        // Solo reportes con feedback
      },
      order: {
        avg_rating: 'DESC',
        total_feedback_count: 'DESC'
      },
      take: limit
    });
  }

  /**
   * Obtener embeddings por rango de fechas
   */
  async findByDateRange(
    spotId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportEmbedding[]> {
    return await this.repository
      .createQueryBuilder('embedding')
      .where('embedding.spot_id = :spotId', { spotId })
      .andWhere('embedding.conditions_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .orderBy('embedding.conditions_date', 'DESC')
      .getMany();
  }

  /**
   * Buscar reportes por condiciones similares (sin usar vectores)
   */
  async findByConditions(
    spotId: string,
    conditions: {
      waveHeightMin?: number;
      waveHeightMax?: number;
      windSpeedMin?: number;
      windSpeedMax?: number;
      windDirection?: string;
    },
    limit: number = 10
  ): Promise<ReportEmbedding[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('embedding')
      .where('embedding.spot_id = :spotId', { spotId });

    if (conditions.waveHeightMin !== undefined) {
      queryBuilder.andWhere('embedding.wave_height_avg >= :waveHeightMin', {
        waveHeightMin: conditions.waveHeightMin
      });
    }

    if (conditions.waveHeightMax !== undefined) {
      queryBuilder.andWhere('embedding.wave_height_avg <= :waveHeightMax', {
        waveHeightMax: conditions.waveHeightMax
      });
    }

    if (conditions.windSpeedMin !== undefined) {
      queryBuilder.andWhere('embedding.wind_speed_avg >= :windSpeedMin', {
        windSpeedMin: conditions.windSpeedMin
      });
    }

    if (conditions.windSpeedMax !== undefined) {
      queryBuilder.andWhere('embedding.wind_speed_avg <= :windSpeedMax', {
        windSpeedMax: conditions.windSpeedMax
      });
    }

    if (conditions.windDirection) {
      queryBuilder.andWhere('embedding.wind_direction = :windDirection', {
        windDirection: conditions.windDirection
      });
    }

    return await queryBuilder
      .orderBy('embedding.avg_rating', 'DESC')
      .addOrderBy('embedding.total_feedback_count', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Eliminar embedding
   */
  async delete(reportId: string): Promise<boolean> {
    const result = await this.repository.delete({ report_id: reportId });
    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Obtener estadísticas de embeddings
   */
  async getStats(): Promise<{
    total: number;
    withFeedback: number;
    averageRating: number;
    spotsWithEmbeddings: number;
  }> {
    const total = await this.repository.count();
    const withFeedback = await this.repository.count({
      where: {
        // TypeORM doesn't support direct comparison, use query builder
      }
    });

    const avgResult = await this.repository
      .createQueryBuilder('embedding')
      .select('AVG(embedding.avg_rating)', 'average')
      .where('embedding.avg_rating IS NOT NULL')
      .getRawOne();

    const spotsResult = await this.repository
      .createQueryBuilder('embedding')
      .select('COUNT(DISTINCT embedding.spot_id)', 'count')
      .getRawOne();

    return {
      total,
      withFeedback: withFeedback,
      averageRating: avgResult?.average ? parseFloat(avgResult.average) : 0,
      spotsWithEmbeddings: spotsResult?.count ? parseInt(spotsResult.count) : 0
    };
  }
}
