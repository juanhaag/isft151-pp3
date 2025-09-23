import { Zone, BestConditions } from '../entities';
export interface IZoneRepository {
    create(zoneData: Omit<Zone, 'id' | 'created_at' | 'updated_at' | 'spots'>): Promise<Zone>;
    findById(id: number): Promise<Zone | null>;
    findAll(): Promise<Zone[]>;
    update(id: number, updates: Partial<Omit<Zone, 'id' | 'created_at' | 'updated_at' | 'spots'>>): Promise<Zone | null>;
    delete(id: number): Promise<boolean>;
    findByName(name: string): Promise<Zone | null>;
}
export declare class ZoneRepository implements IZoneRepository {
    private repository;
    constructor();
    create(zoneData: Omit<Zone, 'id' | 'created_at' | 'updated_at' | 'spots'>): Promise<Zone>;
    findById(id: number): Promise<Zone | null>;
    findAll(): Promise<Zone[]>;
    update(id: number, updates: Partial<Omit<Zone, 'id' | 'created_at' | 'updated_at' | 'spots'>>): Promise<Zone | null>;
    delete(id: number): Promise<boolean>;
    findByName(name: string): Promise<Zone | null>;
    findZonesWithGoodConditions(conditions: Partial<BestConditions>): Promise<Zone[]>;
    countSpotsByZone(id: number): Promise<number>;
}
//# sourceMappingURL=ZoneRepository.d.ts.map