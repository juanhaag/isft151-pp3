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

  getSpotsByZona = async (req: Request, res: Response): Promise<void> => {
    try {
      const { zona } = req.params;

      if (!zona) {
        res.status(400).json({ error: 'Zona name is required' });
        return;
      }

      const spots = await this.spotRepository.findByZona(zona);

      res.json({
        success: true,
        data: spots
      });
    } catch (error) {
      console.error('Error fetching spots by zona:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  createSpot = async (req: Request, res: Response): Promise<void> => {
    try {
      const { place_id, lat, lon, display_name, zona, best_conditions, bad_conditions } = req.body;

      if (!place_id || !lat || !lon || !display_name || !zona || !best_conditions) {
        res.status(400).json({ error: 'place_id, lat, lon, display_name, zona, and best_conditions are required' });
        return;
      }

      const location = `POINT(${lon} ${lat})`;

      const spot = await this.spotRepository.create({
        place_id,
        location,
        display_name,
        zona,
        best_conditions,
        bad_conditions
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