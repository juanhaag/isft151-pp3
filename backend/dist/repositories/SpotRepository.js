"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotRepository = void 0;
const entities_1 = require("../entities");
const database_1 = __importDefault(require("../config/database"));
class SpotRepository {
    constructor() {
        this.repository = database_1.default.getRepository(entities_1.Spot);
    }
    async create(spotData) {
        try {
            // Use raw query for geometry insertion to avoid TypeORM geometry issues
            const result = await this.repository.query(`
        INSERT INTO spots (place_id, location, display_name, zona, zona_id)
        VALUES ($1, ST_GeomFromText($2, 4326), $3, $4, $5)
        RETURNING *
      `, [spotData.place_id, spotData.location, spotData.display_name, spotData.zona, spotData.zona_id]);
            return result[0];
        }
        catch (error) {
            console.error('Error creating spot:', error);
            throw new Error(`Failed to create spot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findById(placeId) {
        try {
            const spot = await this.repository.findOne({
                where: { place_id: placeId },
                relations: ['zone', 'reports']
            });
            return spot;
        }
        catch (error) {
            console.error('Error finding spot by id:', error);
            throw new Error(`Failed to find spot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findAll() {
        try {
            const spots = await this.repository.find({
                relations: ['zone'],
                order: {
                    display_name: 'ASC'
                }
            });
            return spots;
        }
        catch (error) {
            console.error('Error finding all spots:', error);
            throw new Error(`Failed to find spots: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findByZone(zonaId) {
        try {
            const spots = await this.repository.find({
                where: { zona_id: zonaId },
                relations: ['zone'],
                order: {
                    display_name: 'ASC'
                }
            });
            return spots;
        }
        catch (error) {
            console.error('Error finding spots by zone:', error);
            throw new Error(`Failed to find spots by zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async delete(placeId) {
        try {
            const result = await this.repository.delete({ place_id: placeId });
            return (result.affected ?? 0) > 0;
        }
        catch (error) {
            console.error('Error deleting spot:', error);
            throw new Error(`Failed to delete spot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findNearby(latitude, longitude, radiusKm = 50) {
        try {
            // Usar función PostGIS para encontrar spots cercanos
            const spots = await this.repository
                .createQueryBuilder('spot')
                .leftJoinAndSelect('spot.zone', 'zone')
                .where(`ST_DWithin(
            spot.location,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :radius
          )`, {
                longitude,
                latitude,
                radius: radiusKm * 1000 // Convertir km a metros
            })
                .orderBy(`ST_Distance(
            spot.location,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
          )`, 'ASC')
                .setParameters({ longitude, latitude })
                .getMany();
            return spots;
        }
        catch (error) {
            console.error('Error finding nearby spots:', error);
            throw new Error(`Failed to find nearby spots: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Métodos adicionales útiles
    async findByName(searchTerm) {
        try {
            const spots = await this.repository
                .createQueryBuilder('spot')
                .leftJoinAndSelect('spot.zone', 'zone')
                .where('LOWER(spot.display_name) LIKE LOWER(:searchTerm)', {
                searchTerm: `%${searchTerm}%`
            })
                .orWhere('LOWER(spot.zona) LIKE LOWER(:searchTerm)', {
                searchTerm: `%${searchTerm}%`
            })
                .orderBy('spot.display_name', 'ASC')
                .getMany();
            return spots;
        }
        catch (error) {
            console.error('Error searching spots by name:', error);
            throw new Error(`Failed to search spots: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getCoordinates(placeId) {
        try {
            const result = await this.repository
                .createQueryBuilder('spot')
                .select([
                'ST_X(spot.location) as longitude',
                'ST_Y(spot.location) as latitude'
            ])
                .where('spot.place_id = :placeId', { placeId })
                .getRawOne();
            if (!result)
                return null;
            return {
                latitude: parseFloat(result.latitude),
                longitude: parseFloat(result.longitude)
            };
        }
        catch (error) {
            console.error('Error getting spot coordinates:', error);
            return null;
        }
    }
    async updateLocation(placeId, latitude, longitude) {
        try {
            const result = await this.repository
                .createQueryBuilder()
                .update(entities_1.Spot)
                .set({
                location: () => `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`
            })
                .where('place_id = :placeId', { placeId })
                .execute();
            return (result.affected ?? 0) > 0;
        }
        catch (error) {
            console.error('Error updating spot location:', error);
            throw new Error(`Failed to update spot location: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSpotsWithRecentReports(days = 7) {
        try {
            const spots = await this.repository
                .createQueryBuilder('spot')
                .leftJoinAndSelect('spot.zone', 'zone')
                .leftJoinAndSelect('spot.reports', 'reports')
                .where('reports.created_at >= :date', {
                date: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            })
                .orderBy('reports.created_at', 'DESC')
                .getMany();
            return spots;
        }
        catch (error) {
            console.error('Error finding spots with recent reports:', error);
            throw new Error(`Failed to find spots with recent reports: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.SpotRepository = SpotRepository;
//# sourceMappingURL=SpotRepository.js.map