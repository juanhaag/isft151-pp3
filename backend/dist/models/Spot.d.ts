import { Spot } from '../types';
export declare class SpotModel {
    static create(spot: Omit<Spot, 'zone'>): Promise<Spot>;
    static findByPlaceId(placeId: string): Promise<Spot | null>;
    static findAll(): Promise<Spot[]>;
    static findByZone(zonaId: number): Promise<Spot[]>;
    static delete(placeId: string): Promise<boolean>;
}
//# sourceMappingURL=Spot.d.ts.map