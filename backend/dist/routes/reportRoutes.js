"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReportController_1 = require("../controllers/ReportController");
const router = (0, express_1.Router)();
const reportController = new ReportController_1.ReportController();
// Generar reporte
router.post('/generate', reportController.generateReport);
// Obtener reportes
router.get('/recent', reportController.getRecentReports);
router.get('/stats', reportController.getReportStats);
router.get('/good-conditions', reportController.getReportsWithGoodConditions);
router.get('/search', reportController.searchReports);
router.get('/zone/:zoneId', reportController.getReportsByZone);
router.get('/spot/:spotId', reportController.getReportsBySpot);
router.get('/:id', reportController.getReport);
// Pronóstico meteorológico sin generar reporte
router.get('/weather/forecast/:spotId', reportController.getWeatherForecast);
// Testing
router.get('/test/services', reportController.testServices);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map