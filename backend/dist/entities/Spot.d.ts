import { Zone } from './Zone';
import { Report } from './Report';
export declare class Spot {
    place_id: string;
    location: string;
    display_name: string;
    zona: string;
    zona_id: number;
    created_at: Date;
    updated_at: Date;
    zone: Zone;
    reports: Report[];
    get latitude(): number;
    get longitude(): number;
    private getCoordinateFromLocation;
    setLocationFromCoordinates(longitude: number, latitude: number): void;
}
//# sourceMappingURL=Spot.d.ts.map