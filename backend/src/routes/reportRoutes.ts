import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const router = Router();
const reportController = new ReportController();

// Generar reporte
router.post('/generate', reportController.generateReport);

// Obtener reportes
router.get('/recent', reportController.getRecentReports);
router.get('/stats', reportController.getReportStats);
router.get('/good-conditions', reportController.getReportsWithGoodConditions);
router.get('/search', reportController.searchReports);
router.get('/spot/:spotId', reportController.getReportsBySpot);
router.get('/:id', reportController.getReport);

// Pronóstico meteorológico sin generar reporte
router.get('/weather/forecast/:spotId', reportController.getWeatherForecast);

// Testing
router.get('/test/services', reportController.testServices);

export default router;