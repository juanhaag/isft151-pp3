import { Request, Response } from 'express';
import { ZoneRepository } from '../repositories/ZoneRepository';

export class ZoneController {
  private zoneRepository: ZoneRepository;

  constructor() {
    this.zoneRepository = new ZoneRepository();
  }

  getAllZones = async (req: Request, res: Response): Promise<void> => {
    try {
      const zones = await this.zoneRepository.findAll();

      res.json({
        success: true,
        data: zones
      });
    } catch (error) {
      console.error('Error fetching zones:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getZoneById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const zone = await this.zoneRepository.findById(parseInt(id));

      if (!zone) {
        res.status(404).json({ error: 'Zone not found' });
        return;
      }

      res.json({
        success: true,
        data: zone
      });
    } catch (error) {
      console.error('Error fetching zone:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  createZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, best_conditions, bad_conditions, latitude, longitude } = req.body;

      if (!name || !best_conditions) {
        res.status(400).json({ error: 'Name and best_conditions are required' });
        return;
      }

      const zoneData: any = {
        name,
        best_conditions,
        bad_conditions
      };

      // Add location data if provided
      if (latitude !== undefined && longitude !== undefined) {
        zoneData.latitude = latitude;
        zoneData.longitude = longitude;
        zoneData.location = `POINT(${longitude} ${latitude})`;
      }

      const zone = await this.zoneRepository.create(zoneData);

      res.status(201).json({
        success: true,
        data: zone
      });
    } catch (error) {
      console.error('Error creating zone:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  updateZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const zone = await this.zoneRepository.update(parseInt(id), updates);

      if (!zone) {
        res.status(404).json({ error: 'Zone not found' });
        return;
      }

      res.json({
        success: true,
        data: zone
      });
    } catch (error) {
      console.error('Error updating zone:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  setZoneLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      if (latitude === undefined || longitude === undefined) {
        res.status(400).json({ 
          success: false,
          error: 'Latitude and longitude are required' 
        });
        return;
      }

      // Validate coordinates
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        res.status(400).json({ 
          success: false,
          error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180' 
        });
        return;
      }

      const zone = await this.zoneRepository.setZoneLocation(parseInt(id), latitude, longitude);

      if (!zone) {
        res.status(404).json({ 
          success: false,
          error: 'Zone not found' 
        });
        return;
      }

      res.json({
        success: true,
        data: zone,
        message: 'Zone location updated successfully'
      });
    } catch (error) {
      console.error('Error setting zone location:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getSpotsNearZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { radius } = req.query;

      const radiusMeters = radius ? parseInt(radius as string) : 50000; // 50km por defecto

      if (radiusMeters <= 0) {
        res.status(400).json({ 
          success: false,
          error: 'Radius must be a positive number' 
        });
        return;
      }

      const spots = await this.zoneRepository.findSpotsNearZone(parseInt(id), radiusMeters);

      res.json({
        success: true,
        data: {
          zone_id: parseInt(id),
          radius_meters: radiusMeters,
          spots: spots,
          count: spots.length
        },
        message: `Found ${spots.length} spots within ${radiusMeters/1000}km of zone`
      });
    } catch (error) {
      console.error('Error finding spots near zone:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  updateSpotZonesByProximity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { radius } = req.body;
      const radiusMeters = radius || 50000; // 50km por defecto

      if (radiusMeters <= 0) {
        res.status(400).json({ 
          success: false,
          error: 'Radius must be a positive number' 
        });
        return;
      }

      const updatedCount = await this.zoneRepository.updateSpotZonesByProximity(radiusMeters);

      res.json({
        success: true,
        data: {
          updated_spots: updatedCount,
          radius_meters: radiusMeters
        },
        message: `Updated zone assignment for ${updatedCount} spots based on proximity within ${radiusMeters/1000}km`
      });
    } catch (error) {
      console.error('Error updating spot zones by proximity:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
}