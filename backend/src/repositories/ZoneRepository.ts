import { Repository } from 'typeorm';
import { Zone, BestConditions } from '../entities';
import AppDataSource from '../config/database';

export interface IZoneRepository {
  create(zoneData: Partial<Omit<Zone, 'id' | 'created_at' | 'updated_at' | 'spots' | 'setLocationFromCoordinates' | 'lat' | 'lon'>>): Promise<Zone>;
  findById(id: number): Promise<Zone | null>;
  findAll(): Promise<Zone[]>;
  update(id: number, updates: Partial<Omit<Zone, 'id' | 'created_at' | 'updated_at' | 'spots' | 'setLocationFromCoordinates' | 'lat' | 'lon'>>): Promise<Zone | null>;
  delete(id: number): Promise<boolean>;
  findByName(name: string): Promise<Zone | null>;
  findSpotsNearZone(zoneId: number, radiusMeters?: number): Promise<any[]>;
  updateSpotZonesByProximity(radiusMeters?: number): Promise<number>;
  setZoneLocation(id: number, latitude: number, longitude: number): Promise<Zone | null>;
}

export class ZoneRepository implements IZoneRepository {
  private repository: Repository<Zone>;

  constructor() {
    this.repository = AppDataSource.getRepository(Zone);
  }

  async create(zoneData: Partial<Omit<Zone, 'id' | 'created_at' | 'updated_at' | 'spots' | 'setLocationFromCoordinates' | 'lat' | 'lon'>>): Promise<Zone> {
    try {
      const zone = this.repository.create(zoneData);
      const savedZone = await this.repository.save(zone);
      return savedZone;
    } catch (error) {
      console.error('Error creating zone:', error);
      throw new Error(`Failed to create zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: number): Promise<Zone | null> {
    try {
      const zone = await this.repository.findOne({
        where: { id },
        relations: ['spots']
      });
      return zone;
    } catch (error) {
      console.error('Error finding zone by id:', error);
      throw new Error(`Failed to find zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Zone[]> {
    try {
      const zones = await this.repository.find({
        relations: ['spots'],
        order: {
          name: 'ASC'
        }
      });
      return zones;
    } catch (error) {
      console.error('Error finding all zones:', error);
      throw new Error(`Failed to find zones: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: number, updates: Partial<Omit<Zone, 'id' | 'created_at' | 'updated_at' | 'spots' | 'setLocationFromCoordinates' | 'lat' | 'lon'>>): Promise<Zone | null> {
    try {
      const zone = await this.repository.findOneBy({ id });
      if (!zone) {
        return null;
      }

      // Actualizar solo los campos proporcionados
      Object.assign(zone, updates);

      const updatedZone = await this.repository.save(zone);
      return updatedZone;
    } catch (error) {
      console.error('Error updating zone:', error);
      throw new Error(`Failed to update zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting zone:', error);
      throw new Error(`Failed to delete zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByName(name: string): Promise<Zone | null> {
    try {
      const zone = await this.repository.findOne({
        where: { name },
        relations: ['spots']
      });
      return zone;
    } catch (error) {
      console.error('Error finding zone by name:', error);
      throw new Error(`Failed to find zone by name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Métodos adicionales útiles
  async findZonesWithGoodConditions(conditions: Partial<BestConditions>): Promise<Zone[]> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('zone');

      if (conditions.swell_direction) {
        queryBuilder.andWhere(
          "zone.best_conditions->>'swell_direction' ?| :swellDirs",
          { swellDirs: conditions.swell_direction }
        );
      }

      if (conditions.wind_direction) {
        queryBuilder.andWhere(
          "zone.best_conditions->>'wind_direction' ?| :windDirs",
          { windDirs: conditions.wind_direction }
        );
      }

      const zones = await queryBuilder.getMany();
      return zones;
    } catch (error) {
      console.error('Error finding zones with good conditions:', error);
      throw new Error(`Failed to find zones with conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async countSpotsByZone(id: number): Promise<number> {
    try {
      const zone = await this.repository.findOne({
        where: { id },
        relations: ['spots']
      });
      return zone?.spots?.length || 0;
    } catch (error) {
      console.error('Error counting spots by zone:', error);
      return 0;
    }
  }

  // PostGIS methods
  async findSpotsNearZone(zoneId: number, radiusMeters: number = 50000): Promise<any[]> {
    try {
      const result = await this.repository.query(
        'SELECT * FROM find_spots_near_zone($1, $2)',
        [zoneId, radiusMeters]
      );
      return result;
    } catch (error) {
      console.error('Error finding spots near zone:', error);
      throw new Error(`Failed to find spots near zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateSpotZonesByProximity(radiusMeters: number = 50000): Promise<number> {
    try {
      const result = await this.repository.query(
        'SELECT update_spot_zones_by_proximity($1)',
        [radiusMeters]
      );
      return result[0]?.update_spot_zones_by_proximity || 0;
    } catch (error) {
      console.error('Error updating spot zones by proximity:', error);
      throw new Error(`Failed to update spot zones: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setZoneLocation(id: number, latitude: number, longitude: number): Promise<Zone | null> {
    try {
      const zone = await this.repository.findOneBy({ id });
      if (!zone) {
        return null;
      }

      // Update using raw query to properly handle PostGIS geometry
      await this.repository.query(
        `UPDATE zones
         SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326),
             latitude = $2,
             longitude = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [longitude, latitude, id]
      );

      // Fetch and return the updated zone
      const updatedZone = await this.repository.findOneBy({ id });
      return updatedZone;
    } catch (error) {
      console.error('Error setting zone location:', error);
      throw new Error(`Failed to set zone location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}