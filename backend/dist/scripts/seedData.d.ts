import 'reflect-metadata';
declare function seedDatabase(): Promise<void>;
export declare function createExampleData(): Promise<{
    zone: import("../entities").Zone;
    spot: import("../entities").Spot;
}>;
export { seedDatabase };
//# sourceMappingURL=seedData.d.ts.map