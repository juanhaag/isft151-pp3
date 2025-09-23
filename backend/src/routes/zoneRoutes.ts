import { Router } from 'express';
import { ZoneController } from '../controllers/ZoneController';

const router = Router();
const zoneController = new ZoneController();

router.get('/', zoneController.getAllZones);
router.get('/:id', zoneController.getZoneById);
router.post('/', zoneController.createZone);
router.put('/:id', zoneController.updateZone);

// PostGIS routes
router.put('/:id/location', zoneController.setZoneLocation);
router.get('/:id/nearby-spots', zoneController.getSpotsNearZone);
router.post('/update-spot-zones', zoneController.updateSpotZonesByProximity);

export default router;