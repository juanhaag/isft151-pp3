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


/**
 * @route   POST /api/reports/generate
 * @desc    Generate a surf report
 * @access  Public
 * @param   location - Location data for the report
 * @return  Generated surf report
 */
router.post('/generate', generateReport);

/** 
 * @route   GET /api/reports/recent
 * @desc    Get recent surf reports
 * @access  Public
 * @param   recent - Parameters for recent reports
 * @return  List of recent surf reports
 * */ 
router.get('/recent', getRecentReports);

/** 
 * @route   GET /api/reports/stats
 * @desc    Get report statistics
 * @access  Public
 * @param   stats - Parameters for report statistics
 * @return  Report statistics
 * */
router.get('/stats', getReportStats);


/**
 * @route   GET /api/reports/good-conditions
 * @desc    Get reports with good surf conditions
 * @access  Public
 * @param   conditions - Filter parameters for good conditions
 * @return  List of reports with good conditions
 */

router.get('/good-conditions', getReportsWithGoodConditions);


/**
 * @route   GET /api/reports/search
 * @desc    Search surf reports
 * @access  Public
 * @param   query - Search query parameters
 * @return  List of matching surf reports
 */
router.get('/search', searchReports);

/**
 * @route   GET /api/reports/spot/:spotId
 * @desc    Get reports for a specific spot
 * @access  Public
 * @param   spotId - ID of the spot
 * @return  List of surf reports for the spot
 */
router.get('/spot/:spotId', getReportsBySpot);

/**
 * @route   GET /api/reports/:id
 * @desc    Get a surf report by ID
 * @access  Public
 * @param   id - ID of the surf report
 * @return  Surf report details
 */
router.get('/:id', getReport);

/**
 * @route   GET /api/reports/weather/forecast/:spotId
 * @desc    Get weather forecast for a specific spot
 * @access  Public 
 * @param   spotId - ID of the spot
 * @return  Weather forecast data for the spot
 */
router.get('/weather/forecast/:spotId', getWeatherForecast);

/**
 * @route   GET /api/reports/test/services
 * @desc    Test all report services
 * @access  Public
 * @param   N/A  
 * @return  Service test results
 */
router.get('/test/services', testServices);


/**
 *  @route   POST /api/reports/:reportId/feedback
 *  @desc    Submit feedback for a specific report
 *  @access  Public
 *  @param   reportId - ID of the report to submit feedback for
 *  @return  Success message or error
 */
router.post('/:reportId/feedback', submitFeedback);
/**
 * @route   GET /api/reports/:reportId/feedback
 * @desc    Get feedback for a specific report
 * @access  Public
 * @param   reportId - ID of the report to get feedback for
 * @return  List of feedback entries for the report//  */
router.get('/:reportId/feedback', getReportFeedback);

/**
 * @route   GET /api/reports/:reportId/similar
 * @desc    Get similar reports based on a specific report
 * @access  Public
 * @param   reportId - ID of the report to find similar reports for
 * @return  List of similar reports*/
router.get('/:reportId/similar', getSimilarReports);

/**
 * @route   GET /api/reports/embeddings/stats
 * @desc    Get statistics about report embeddings
 * @access  Public
 * @param   N/A
 * @return  Embedding statistics
 * */  
router.get('/embeddings/stats', getEmbeddingStats);

/**
 * @route   GET /api/reports/top-rated
 * @desc    Get top rated surf reports  
 * @access  Public
 * @param   N/A
 * @return  List of top rated surf reports
 * */
router.get('/top-rated', getTopRatedReports);

export default router;