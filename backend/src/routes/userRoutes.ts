import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

/**
 * @route   POST /api/users/
 * @desc    Create a new user
 * @access  Public
 * @param   userData - Data for the new user
 * @return  Created user details
 */
router.post('/', (req, res) => userController.create(req, res));

/**
 * @route   GET /api/users/
 * @desc    Get all users
 * @access  Public
 * @param   N/A
 * @return  List of all users
 */

router.get('/', (req, res) => userController.getAll(req, res));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 * @param   id - ID of the user
 * @return  User details
 */
router.get('/:id', (req, res) => userController.getById(req, res));

export default router;