import { Request, Response } from 'express';
export declare class ZoneController {
    private zoneRepository;
    constructor();
    getAllZones: (req: Request, res: Response) => Promise<void>;
    getZoneById: (req: Request, res: Response) => Promise<void>;
    createZone: (req: Request, res: Response) => Promise<void>;
    updateZone: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ZoneController.d.ts.map