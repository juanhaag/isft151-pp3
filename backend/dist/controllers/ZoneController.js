"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneController = void 0;
const ZoneRepository_1 = require("../repositories/ZoneRepository");
class ZoneController {
    constructor() {
        this.getAllZones = async (req, res) => {
            try {
                const zones = await this.zoneRepository.findAll();
                res.json({
                    success: true,
                    data: zones
                });
            }
            catch (error) {
                console.error('Error fetching zones:', error);
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Internal server error'
                });
            }
        };
        this.getZoneById = async (req, res) => {
            try {
                const { id } = req.params;
                const zone = await this.zoneRepository.findById(id);
                if (!zone) {
                    res.status(404).json({ error: 'Zone not found' });
                    return;
                }
                res.json({
                    success: true,
                    data: zone
                });
            }
            catch (error) {
                console.error('Error fetching zone:', error);
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Internal server error'
                });
            }
        };
        this.createZone = async (req, res) => {
            try {
                const { name, best_conditions, bad_conditions } = req.body;
                if (!name || !best_conditions) {
                    res.status(400).json({ error: 'Name and best_conditions are required' });
                    return;
                }
                const zone = await this.zoneRepository.create({
                    name,
                    best_conditions,
                    bad_conditions
                });
                res.status(201).json({
                    success: true,
                    data: zone
                });
            }
            catch (error) {
                console.error('Error creating zone:', error);
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Internal server error'
                });
            }
        };
        this.updateZone = async (req, res) => {
            try {
                const { id } = req.params;
                const updates = req.body;
                const zone = await this.zoneRepository.update(id, updates);
                if (!zone) {
                    res.status(404).json({ error: 'Zone not found' });
                    return;
                }
                res.json({
                    success: true,
                    data: zone
                });
            }
            catch (error) {
                console.error('Error updating zone:', error);
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Internal server error'
                });
            }
        };
        this.zoneRepository = new ZoneRepository_1.ZoneRepository();
    }
}
exports.ZoneController = ZoneController;
//# sourceMappingURL=ZoneController.js.map