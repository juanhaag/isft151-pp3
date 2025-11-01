import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';

const router = Router();
const profileController = new ProfileController();

// Wrapper functions con manejo de errores
async function getUserReports(req: any, res: any) {
  try {
    await profileController.getUserReports(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching user reports';
    res.status(500).json({ success: false, error: errorMessage });
  }
}


async function getReportById(req: any, res: any) {
  try {
    await profileController.getReportById(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error fetching report';
    res.status(500).json({ success: false, error: errorMessage });
  }
}

/**
 * @route   GET /api/profile/:userId/reports
 * @desc    Get all reports created by a user
 * @access  Public
 * @param   userId - ID of the user whose reports are to be fetched
 * @return  List of reports created by the user
 */
router.get('/:userId/reports', getUserReports);

/**
 * @route   GET /api/profile/reports/:reportId
 * @desc    Get a single report by ID (for sharing)
 * @access  Public
 * @param   reportId - ID of the report to fetch
 * @return  Report details
 */
router.get('/reports/:reportId', getReportById);

export default router;
