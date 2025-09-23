import { Spot } from '../entities';
export interface ISpotRepository {
    create(spotData: Omit<Spot, 'created_at' | 'updated_at' | 'zone' | 'reports' | 'latitude' | 'longitude' | 'setLocationFromCoordinates'>): Promise<Spot>;
    findById(placeId: string): Promise<Spot | null>;
    findAll(): Promise<Spot[]>;
    findByZone(zonaId: number): Promise<Spot[]>;
    delete(placeId: string): Promise<boolean>;
    findNearby(latitude: number, longitude: number, radiusKm: number): Promise<Spot[]>;
}
export declare class SpotRepository implements ISpotRepository {
    private repository;
    constructor();
    create(spotData: Omit<Spot, 'created_at' | 'updated_at' | 'zone' | 'reports' | 'latitude' | 'longitude' | 'setLocationFromCoordinates'>): Promise<Spot>;
    findById(placeId: string): Promise<Spot | null>;
    findAll(): Promise<Spot[]>;
    findByZone(zonaId: number): Promise<Spot[]>;
    delete(placeId: string): Promise<boolean>;
    findNearby(latitude: number, longitude: number, radiusKm?: number): Promise<Spot[]>;
    findByName(searchTerm: string): Promise<Spot[]>;
    getCoordinates(placeId: string): Promise<{
        latitude: number;
        longitude: number;
    } | null>;
    updateLocation(placeId: string, latitude: number, longitude: number): Promise<boolean>;
    getSpotsWithRecentReports(days?: number): Promise<Spot[]>;
}
//# sourceMappingURL=SpotRepository.d.ts.map