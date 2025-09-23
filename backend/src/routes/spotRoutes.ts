import { Router } from 'express';
import { SpotController } from '../controllers/SpotController';

const router = Router();
const spotController = new SpotController();

router.get('/', spotController.getAllSpots);
router.get('/:id', spotController.getSpotById);
router.get('/zone/:zoneId', spotController.getSpotsByZone);
router.post('/', spotController.createSpot);

export default router;