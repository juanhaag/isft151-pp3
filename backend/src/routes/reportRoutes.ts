import { Router, Request, Response } from 'express';
import { ReportController } from '../controllers/ReportController';

const router = Router();
const reportController = new ReportController();

// Generar reporte
async function generateReport(req: Request, res: Response) {
  try {
    await reportController.generateReport(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error generating report';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener reporte por ID
async function getReport(req: Request, res: Response) {
  try {
    await reportController.getReport(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching report';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener reportes por spot
async function getReportsBySpot(req: Request, res: Response) {
  try {
    await reportController.getReportsBySpot(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching reports by spot';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener reportes recientes
async function getRecentReports(req: Request, res: Response) {
  try {
    await reportController.getRecentReports(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching recent reports';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Buscar reportes
async function searchReports(req: Request, res: Response) {
  try {
    await reportController.searchReports(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error searching reports';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener estadísticas de reportes
async function getReportStats(req: Request, res: Response) {
  try {
    await reportController.getReportStats(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching report stats';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener reportes con buenas condiciones
async function getReportsWithGoodConditions(req: Request, res: Response) {
  try {
    await reportController.getReportsWithGoodConditions(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching reports with good conditions';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener pronóstico meteorológico
async function getWeatherForecast(req: Request, res: Response) {
  try {
    await reportController.getWeatherForecast(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching weather forecast';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Testing de servicios
async function testServices(req: Request, res: Response) {
  try {
    await reportController.testServices(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error testing services';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// ==================== FEEDBACK ROUTES ====================

// Enviar feedback para un reporte
async function submitFeedback(req: Request, res: Response) {
  try {
    await reportController.submitFeedback(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error submitting feedback';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener feedback de un reporte
async function getReportFeedback(req: Request, res: Response) {
  try {
    await reportController.getReportFeedback(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching feedback';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Buscar reportes similares
async function getSimilarReports(req: Request, res: Response) {
  try {
    await reportController.getSimilarReports(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error finding similar reports';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener estadísticas de embeddings
async function getEmbeddingStats(req: Request, res: Response) {
  try {
    await reportController.getEmbeddingStats(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching embedding stats';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Obtener reportes mejor valorados
async function getTopRatedReports(req: Request, res: Response) {
  try {
    await reportController.getTopRatedReports(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching top rated reports';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

// Rutas básicas
router.post('/generate', generateReport);
router.get('/recent', getRecentReports);
router.get('/stats', getReportStats);
router.get('/good-conditions', getReportsWithGoodConditions);
router.get('/search', searchReports);
router.get('/spot/:spotId', getReportsBySpot);
router.get('/:id', getReport);
router.get('/weather/forecast/:spotId', getWeatherForecast);
router.get('/test/services', testServices);

// Rutas de feedback
router.post('/:reportId/feedback', submitFeedback);
router.get('/:reportId/feedback', getReportFeedback);
router.get('/:reportId/similar', getSimilarReports);

// Rutas de estadísticas de embeddings
router.get('/embeddings/stats', getEmbeddingStats);
router.get('/top-rated', getTopRatedReports);

export default router;