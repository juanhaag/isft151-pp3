"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneRepository = void 0;
const entities_1 = require("../entities");
const database_1 = __importDefault(require("../config/database"));
class ZoneRepository {
    constructor() {
        this.repository = database_1.default.getRepository(entities_1.Zone);
    }
    async create(zoneData) {
        try {
            const zone = this.repository.create(zoneData);
            const savedZone = await this.repository.save(zone);
            return savedZone;
        }
        catch (error) {
            console.error('Error creating zone:', error);
            throw new Error(`Failed to create zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findById(id) {
        try {
            const zone = await this.repository.findOne({
                where: { id },
                relations: ['spots']
            });
            return zone;
        }
        catch (error) {
            console.error('Error finding zone by id:', error);
            throw new Error(`Failed to find zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findAll() {
        try {
            const zones = await this.repository.find({
                relations: ['spots'],
                order: {
                    name: 'ASC'
                }
            });
            return zones;
        }
        catch (error) {
            console.error('Error finding all zones:', error);
            throw new Error(`Failed to find zones: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async update(id, updates) {
        try {
            const zone = await this.repository.findOneBy({ id });
            if (!zone) {
                return null;
            }
            // Actualizar solo los campos proporcionados
            Object.assign(zone, updates);
            const updatedZone = await this.repository.save(zone);
            return updatedZone;
        }
        catch (error) {
            console.error('Error updating zone:', error);
            throw new Error(`Failed to update zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async delete(id) {
        try {
            const result = await this.repository.delete(id);
            return (result.affected ?? 0) > 0;
        }
        catch (error) {
            console.error('Error deleting zone:', error);
            throw new Error(`Failed to delete zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findByName(name) {
        try {
            const zone = await this.repository.findOne({
                where: { name },
                relations: ['spots']
            });
            return zone;
        }
        catch (error) {
            console.error('Error finding zone by name:', error);
            throw new Error(`Failed to find zone by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Métodos adicionales útiles
    async findZonesWithGoodConditions(conditions) {
        try {
            const queryBuilder = this.repository.createQueryBuilder('zone');
            if (conditions.swell_direction) {
                queryBuilder.andWhere("zone.best_conditions->>'swell_direction' ?| :swellDirs", { swellDirs: conditions.swell_direction });
            }
            if (conditions.wind_direction) {
                queryBuilder.andWhere("zone.best_conditions->>'wind_direction' ?| :windDirs", { windDirs: conditions.wind_direction });
            }
            const zones = await queryBuilder.getMany();
            return zones;
        }
        catch (error) {
            console.error('Error finding zones with good conditions:', error);
            throw new Error(`Failed to find zones with conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async countSpotsByZone(id) {
        try {
            const zone = await this.repository.findOne({
                where: { id },
                relations: ['spots']
            });
            return zone?.spots?.length || 0;
        }
        catch (error) {
            console.error('Error counting spots by zone:', error);
            return 0;
        }
    }
}
exports.ZoneRepository = ZoneRepository;
//# sourceMappingURL=ZoneRepository.js.map