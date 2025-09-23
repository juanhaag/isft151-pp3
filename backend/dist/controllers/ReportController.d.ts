import { Request, Response } from 'express';
export declare class ReportController {
    private reportService;
    constructor();
    generateReport: (req: Request, res: Response) => Promise<void>;
    getReport: (req: Request, res: Response) => Promise<void>;
    getReportsBySpot: (req: Request, res: Response) => Promise<void>;
    getRecentReports: (req: Request, res: Response) => Promise<void>;
    getReportsByZone: (req: Request, res: Response) => Promise<void>;
    searchReports: (req: Request, res: Response) => Promise<void>;
    getReportStats: (req: Request, res: Response) => Promise<void>;
    getReportsWithGoodConditions: (req: Request, res: Response) => Promise<void>;
    getWeatherForecast: (req: Request, res: Response) => Promise<void>;
    testServices: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ReportController.d.ts.map