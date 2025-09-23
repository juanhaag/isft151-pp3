import { Spot } from './Spot';
export interface BestConditions {
    swell_direction: string[];
    wind_direction: string[];
    tide: string[];
    swell_size: string;
}
export declare class Zone {
    id: number;
    name: string;
    best_conditions: BestConditions;
    bad_conditions?: BestConditions;
    created_at: Date;
    updated_at: Date;
    spots: Spot[];
}
//# sourceMappingURL=Zone.d.ts.map