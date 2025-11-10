import { Router, Request, Response } from 'express';
import { SpotController } from '../controllers/SpotController';

const router = Router();
const spotController = new SpotController();

// Obtener todos los spots
async function getAllSpots(req: Request, res: Response) {
  try {
    await spotController.getAllSpots(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching spots';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener spot por ID
async function getSpotById(req: Request, res: Response) {
  try {
    await spotController.getSpotById(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching spot';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener spots por zona
async function getSpotsByZona(req: Request, res: Response) {
  try {
    await spotController.getSpotsByZona(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching spots by zona';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Crear nuevo spot
async function createSpot(req: Request, res: Response) {
  try {
    await spotController.createSpot(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error creating spot';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

router.get('/', getAllSpots);
router.get('/zona/:zona', getSpotsByZona);
router.get('/:id', getSpotById);
router.post('/', createSpot);

export default router;