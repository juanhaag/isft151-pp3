"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SpotController_1 = require("../controllers/SpotController");
const router = (0, express_1.Router)();
const spotController = new SpotController_1.SpotController();
router.get('/', spotController.getAllSpots);
router.get('/:id', spotController.getSpotById);
router.get('/zone/:zoneId', spotController.getSpotsByZone);
router.post('/', spotController.createSpot);
exports.default = router;
//# sourceMappingURL=spotRoutes.js.map