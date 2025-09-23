import { Request, Response } from 'express';
import { SpotRepository } from '../repositories/SpotRepository';

export class SpotController {
  private spotRepository: SpotRepository;

  constructor() {
    this.spotRepository = new SpotRepository();
  }

  getAllSpots = async (req: Request, res: Response): Promise<void> => {
    try {
      const spots = await this.spotRepository.findAll();

      res.json({
        success: true,
        data: spots
      });
    } catch (error) {
      console.error('Error fetching spots:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getSpotById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const spot = await this.spotRepository.findById(id);

      if (!spot) {
        res.status(404).json({ error: 'Spot not found' });
        return;
      }

      res.json({
        success: true,
        data: spot
      });
    } catch (error) {
      console.error('Error fetching spot:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getSpotsByZone = async (req: Request, res: Response): Promise<void> => {
    try {
      const { zoneId } = req.params;
      const zonaId = parseInt(zoneId);

      if (isNaN(zonaId)) {
        res.status(400).json({ error: 'Invalid zone ID' });
        return;
      }

      const spots = await this.spotRepository.findByZone(zonaId);

      res.json({
        success: true,
        data: spots
      });
    } catch (error) {
      console.error('Error fetching spots by zone:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  createSpot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { place_id, lat, lon, display_name, zona, zona_id } = req.body;

      if (!place_id || !lat || !lon || !display_name || !zona || !zona_id) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      const spot = await this.spotRepository.create({
        place_id,
        lat: lat.toString(),
        lon: lon.toString(),
        display_name,
        zona,
        zona_id: parseInt(zona_id)
      });

      res.status(201).json({
        success: true,
        data: spot
      });
    } catch (error) {
      console.error('Error creating spot:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
}