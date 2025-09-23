import { Repository } from 'typeorm';
import { Report, WeatherData } from '../entities';
import AppDataSource from '../config/database';

export interface IReportRepository {
  create(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'spot'>): Promise<Report>;
  findById(id: string): Promise<Report | null>;
  findAll(limit?: number): Promise<Report[]>;
  findBySpotId(spotId: string, limit?: number): Promise<Report[]>;
  findRecent(limit?: number): Promise<Report[]>;
  delete(id: string): Promise<boolean>;
}

export class ReportRepository implements IReportRepository {
  private repository: Repository<Report>;

  constructor() {
    this.repository = AppDataSource.getRepository(Report);
  }

  async create(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'spot'>): Promise<Report> {
    try {
      const report = this.repository.create(reportData);
      const savedReport = await this.repository.save(report);

      // Cargar el spot relacionado
      const reportWithSpot = await this.repository.findOne({
        where: { id: savedReport.id },
        relations: ['spot', 'spot.zone']
      });

      return reportWithSpot || savedReport;
    } catch (error) {
      console.error('Error creating report:', error);
      throw new Error(`Failed to create report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Report | null> {
    try {
      const report = await this.repository.findOne({
        where: { id },
        relations: ['spot', 'spot.zone']
      });
      return report;
    } catch (error) {
      console.error('Error finding report by id:', error);
      throw new Error(`Failed to find report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(limit: number = 50): Promise<Report[]> {
    try {
      const reports = await this.repository.find({
        relations: ['spot', 'spot.zone'],
        order: {
          created_at: 'DESC'
        },
        take: limit
      });
      return reports;
    } catch (error) {
      console.error('Error finding all reports:', error);
      throw new Error(`Failed to find reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBySpotId(spotId: string, limit: number = 10): Promise<Report[]> {
    try {
      const reports = await this.repository.find({
        where: { spot_id: spotId },
        relations: ['spot', 'spot.zone'],
        order: {
          created_at: 'DESC'
        },
        take: limit
      });
      return reports;
    } catch (error) {
      console.error('Error finding reports by spot:', error);
      throw new Error(`Failed to find reports by spot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findRecent(limit: number = 20): Promise<Report[]> {
    try {
      const reports = await this.repository.find({
        relations: ['spot', 'spot.zone'],
        order: {
          created_at: 'DESC'
        },
        take: limit
      });
      return reports;
    } catch (error) {
      console.error('Error finding recent reports:', error);
      throw new Error(`Failed to find recent reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw new Error(`Failed to delete report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Métodos adicionales útiles
  async findByDateRange(startDate: Date, endDate: Date): Promise<Report[]> {
    try {
      const reports = await this.repository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.spot', 'spot')
        .leftJoinAndSelect('spot.zone', 'zone')
        .where('report.created_at >= :startDate', { startDate })
        .andWhere('report.created_at <= :endDate', { endDate })
        .orderBy('report.created_at', 'DESC')
        .getMany();

      return reports;
    } catch (error) {
      console.error('Error finding reports by date range:', error);
      throw new Error(`Failed to find reports by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByZone(zoneId: number, limit: number = 20): Promise<Report[]> {
    try {
      const reports = await this.repository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.spot', 'spot')
        .leftJoinAndSelect('spot.zone', 'zone')
        .where('spot.zona_id = :zoneId', { zoneId })
        .orderBy('report.created_at', 'DESC')
        .limit(limit)
        .getMany();

      return reports;
    } catch (error) {
      console.error('Error finding reports by zone:', error);
      throw new Error(`Failed to find reports by zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchByContent(searchTerm: string, limit: number = 20): Promise<Report[]> {
    try {
      const reports = await this.repository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.spot', 'spot')
        .leftJoinAndSelect('spot.zone', 'zone')
        .where('LOWER(report.report_text) LIKE LOWER(:searchTerm)', {
          searchTerm: `%${searchTerm}%`
        })
        .orWhere('LOWER(report.user_preferences) LIKE LOWER(:searchTerm)', {
          searchTerm: `%${searchTerm}%`
        })
        .orderBy('report.created_at', 'DESC')
        .limit(limit)
        .getMany();

      return reports;
    } catch (error) {
      console.error('Error searching reports by content:', error);
      throw new Error(`Failed to search reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReportStats(): Promise<{
    total: number;
    thisWeek: number;
    thisMonth: number;
    averageReportsPerDay: number;
  }> {
    try {
      const total = await this.repository.count();

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const thisWeek = await this.repository.count({
        where: {
          created_at: AppDataSource.getRepository(Report)
            .createQueryBuilder()
            .where('created_at >= :date', { date: oneWeekAgo })
            .getQuery() as any
        }
      });

      const thisMonth = await this.repository.count({
        where: {
          created_at: AppDataSource.getRepository(Report)
            .createQueryBuilder()
            .where('created_at >= :date', { date: oneMonthAgo })
            .getQuery() as any
        }
      });

      const averageReportsPerDay = thisMonth / 30;

      return {
        total,
        thisWeek,
        thisMonth,
        averageReportsPerDay: Math.round(averageReportsPerDay * 100) / 100
      };
    } catch (error) {
      console.error('Error getting report stats:', error);
      return {
        total: 0,
        thisWeek: 0,
        thisMonth: 0,
        averageReportsPerDay: 0
      };
    }
  }

  async findReportsWithGoodConditions(minWaveHeight: number = 1.0): Promise<Report[]> {
    try {
      const reports = await this.repository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.spot', 'spot')
        .leftJoinAndSelect('spot.zone', 'zone')
        .where(
          `EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(
              report.weather_data->'wave_height'
            ) AS wave_height
            WHERE wave_height::float >= :minWaveHeight
          )`,
          { minWaveHeight }
        )
        .orderBy('report.created_at', 'DESC')
        .getMany();

      return reports;
    } catch (error) {
      console.error('Error finding reports with good conditions:', error);
      throw new Error(`Failed to find reports with good conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}