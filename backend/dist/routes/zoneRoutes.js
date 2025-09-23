"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ZoneController_1 = require("../controllers/ZoneController");
const router = (0, express_1.Router)();
const zoneController = new ZoneController_1.ZoneController();
router.get('/', zoneController.getAllZones);
router.get('/:id', zoneController.getZoneById);
router.post('/', zoneController.createZone);
router.put('/:id', zoneController.updateZone);
exports.default = router;
//# sourceMappingURL=zoneRoutes.js.map