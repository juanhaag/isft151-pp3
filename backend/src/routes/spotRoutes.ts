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

/** 
 * @route   GET /api/spots/
 * @desc    Get all spots
 * @access  Public
 * @param   N/A
 * @return  List of all surf spots
 * 
 */
router.get('/', getAllSpots);

/** 
 * @route   GET /api/spots/zona/:zona
 * @desc    Get spots by zona
 * @access  Public
 * @param   zona - Zona to filter spots
 * @return  List of surf spots in the specified zona
 */
router.get('/zona/:zona', getSpotsByZona);

/** 
 * @route   GET /api/spots/:id
 * @desc    Get spot by ID
 * @access  Public
 * @param   id - ID of the spot
 * @return  Spot details
 */
router.get('/:id', getSpotById);

/** 
 * @route   POST /api/spots/
 * @desc    Create a new spot
 * @access  Public
 * @param   Spot data in request body
 * @return  Created spot details
 */
router.post('/', createSpot);

export default router;