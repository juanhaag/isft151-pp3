import { Request, Response } from 'express';
export declare class SpotController {
    private spotRepository;
    constructor();
    getAllSpots: (req: Request, res: Response) => Promise<void>;
    getSpotById: (req: Request, res: Response) => Promise<void>;
    getSpotsByZone: (req: Request, res: Response) => Promise<void>;
    createSpot: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=SpotController.d.ts.map