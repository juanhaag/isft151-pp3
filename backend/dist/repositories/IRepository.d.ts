export interface IRepository<T, ID = string> {
    create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
    findById(id: ID): Promise<T | null>;
    findAll(): Promise<T[]>;
    delete(id: ID): Promise<boolean>;
}
//# sourceMappingURL=IRepository.d.ts.map