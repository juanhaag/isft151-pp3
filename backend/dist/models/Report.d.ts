import { Report } from '../types';
export declare class ReportModel {
    static create(report: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report>;
    static findById(id: string): Promise<Report | null>;
    static findBySpotId(spotId: string, limit?: number): Promise<Report[]>;
    static findRecent(limit?: number): Promise<Report[]>;
    static delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=Report.d.ts.map