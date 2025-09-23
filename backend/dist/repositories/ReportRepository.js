"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRepository = void 0;
const entities_1 = require("../entities");
const database_1 = __importDefault(require("../config/database"));
class ReportRepository {
    constructor() {
        this.repository = database_1.default.getRepository(entities_1.Report);
    }
    async create(reportData) {
        try {
            const report = this.repository.create(reportData);
            const savedReport = await this.repository.save(report);
            // Cargar el spot relacionado
            const reportWithSpot = await this.repository.findOne({
                where: { id: savedReport.id },
                relations: ['spot', 'spot.zone']
            });
            return reportWithSpot || savedReport;
        }
        catch (error) {
            console.error('Error creating report:', error);
            throw new Error(`Failed to create report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findById(id) {
        try {
            const report = await this.repository.findOne({
                where: { id },
                relations: ['spot', 'spot.zone']
            });
            return report;
        }
        catch (error) {
            console.error('Error finding report by id:', error);
            throw new Error(`Failed to find report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findAll(limit = 50) {
        try {
            const reports = await this.repository.find({
                relations: ['spot', 'spot.zone'],
                order: {
                    created_at: 'DESC'
                },
                take: limit
            });
            return reports;
        }
        catch (error) {
            console.error('Error finding all reports:', error);
            throw new Error(`Failed to find reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findBySpotId(spotId, limit = 10) {
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
        }
        catch (error) {
            console.error('Error finding reports by spot:', error);
            throw new Error(`Failed to find reports by spot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findRecent(limit = 20) {
        try {
            const reports = await this.repository.find({
                relations: ['spot', 'spot.zone'],
                order: {
                    created_at: 'DESC'
                },
                take: limit
            });
            return reports;
        }
        catch (error) {
            console.error('Error finding recent reports:', error);
            throw new Error(`Failed to find recent reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async delete(id) {
        try {
            const result = await this.repository.delete(id);
            return (result.affected ?? 0) > 0;
        }
        catch (error) {
            console.error('Error deleting report:', error);
            throw new Error(`Failed to delete report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Métodos adicionales útiles
    async findByDateRange(startDate, endDate) {
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
        }
        catch (error) {
            console.error('Error finding reports by date range:', error);
            throw new Error(`Failed to find reports by date range: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findByZone(zoneId, limit = 20) {
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
        }
        catch (error) {
            console.error('Error finding reports by zone:', error);
            throw new Error(`Failed to find reports by zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async searchByContent(searchTerm, limit = 20) {
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
        }
        catch (error) {
            console.error('Error searching reports by content:', error);
            throw new Error(`Failed to search reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getReportStats() {
        try {
            const total = await this.repository.count();
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const thisWeek = await this.repository.count({
                where: {
                    created_at: database_1.default.getRepository(entities_1.Report)
                        .createQueryBuilder()
                        .where('created_at >= :date', { date: oneWeekAgo })
                        .getQuery()
                }
            });
            const thisMonth = await this.repository.count({
                where: {
                    created_at: database_1.default.getRepository(entities_1.Report)
                        .createQueryBuilder()
                        .where('created_at >= :date', { date: oneMonthAgo })
                        .getQuery()
                }
            });
            const averageReportsPerDay = thisMonth / 30;
            return {
                total,
                thisWeek,
                thisMonth,
                averageReportsPerDay: Math.round(averageReportsPerDay * 100) / 100
            };
        }
        catch (error) {
            console.error('Error getting report stats:', error);
            return {
                total: 0,
                thisWeek: 0,
                thisMonth: 0,
                averageReportsPerDay: 0
            };
        }
    }
    async findReportsWithGoodConditions(minWaveHeight = 1.0) {
        try {
            const reports = await this.repository
                .createQueryBuilder('report')
                .leftJoinAndSelect('report.spot', 'spot')
                .leftJoinAndSelect('spot.zone', 'zone')
                .where(`EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(
              report.weather_data->'wave_height'
            ) AS wave_height
            WHERE wave_height::float >= :minWaveHeight
          )`, { minWaveHeight })
                .orderBy('report.created_at', 'DESC')
                .getMany();
            return reports;
        }
        catch (error) {
            console.error('Error finding reports with good conditions:', error);
            throw new Error(`Failed to find reports with good conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.ReportRepository = ReportRepository;
//# sourceMappingURL=ReportRepository.js.map