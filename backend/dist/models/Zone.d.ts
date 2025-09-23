import { Zone } from '../types';
export declare class ZoneModel {
    static create(zone: Omit<Zone, 'id'>): Promise<Zone>;
    static findById(id: string): Promise<Zone | null>;
    static findAll(): Promise<Zone[]>;
    static update(id: string, updates: Partial<Omit<Zone, 'id'>>): Promise<Zone | null>;
    static delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=Zone.d.ts.map