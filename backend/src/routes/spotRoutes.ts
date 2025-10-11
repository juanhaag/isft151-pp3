import { Router } from 'express';
import { SpotController } from '../controllers/SpotController';

const router = Router();
const spotController = new SpotController();

router.get('/', spotController.getAllSpots);
router.get('/zona/:zona', spotController.getSpotsByZona);
router.get('/:id', spotController.getSpotById);
router.post('/', spotController.createSpot);

export default router;