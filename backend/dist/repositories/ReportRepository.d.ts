import { Report } from '../entities';
export interface IReportRepository {
    create(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'spot'>): Promise<Report>;
    findById(id: string): Promise<Report | null>;
    findAll(limit?: number): Promise<Report[]>;
    findBySpotId(spotId: string, limit?: number): Promise<Report[]>;
    findRecent(limit?: number): Promise<Report[]>;
    delete(id: string): Promise<boolean>;
}
export declare class ReportRepository implements IReportRepository {
    private repository;
    constructor();
    create(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'spot'>): Promise<Report>;
    findById(id: string): Promise<Report | null>;
    findAll(limit?: number): Promise<Report[]>;
    findBySpotId(spotId: string, limit?: number): Promise<Report[]>;
    findRecent(limit?: number): Promise<Report[]>;
    delete(id: string): Promise<boolean>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Report[]>;
    findByZone(zoneId: number, limit?: number): Promise<Report[]>;
    searchByContent(searchTerm: string, limit?: number): Promise<Report[]>;
    getReportStats(): Promise<{
        total: number;
        thisWeek: number;
        thisMonth: number;
        averageReportsPerDay: number;
    }>;
    findReportsWithGoodConditions(minWaveHeight?: number): Promise<Report[]>;
}
//# sourceMappingURL=ReportRepository.d.ts.map