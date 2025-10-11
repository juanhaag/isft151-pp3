import { Response } from 'express';
import { UserService } from '../services/UserService';
import { UserRequest, CreateUserRequest, UpdateUserRequest } from '../requests/UserRequest';
import { UserResource } from '../resources/UserResource';
import { UserValidator } from '../api-wrapper/validators/UserValidator';
import { CreateUserOutput, GetAllUsersOutput, GetUserByIdOutput } from '../api-wrapper/types/UserTypes';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async create(req: CreateUserRequest, res: Response) {
    // Validate input with API wrapper
    const inputValidation = UserValidator.validateCreateUserInput(req.body);
    if (!inputValidation.valid) {
      return res.status(400).json({ errors: inputValidation.errors });
    }

    // Also validate with existing business logic validator
    const validation = UserRequest.validateCreate(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const { username, email, password, phone } = req.body;

    try {
      const newUser = await this.userService.createUser({
        username,
        email,
        password,
        phone
      });

      // Prepare output according to API spec
      const output: CreateUserOutput = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone
      };

      // Validate output with API wrapper
      const outputValidation = UserValidator.validateCreateUserOutput(output);
      if (!outputValidation.valid) {
        console.error("API Output validation failed:", outputValidation.errors);
      }

      res.status(201).json(output);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating user';

      if (errorMessage === 'Username already exists') {
        return res.status(409).json({ error: errorMessage });
      }

      if (errorMessage === 'Email already exists') {
        return res.status(409).json({ error: errorMessage });
      }

      console.error(error);
      res.status(500).json({ error: 'Error creating user', details: errorMessage });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();

      // Prepare output according to API spec
      const output: GetAllUsersOutput = {
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone
        }))
      };

      // Validate output with API wrapper
      const outputValidation = UserValidator.validateGetAllUsersOutput(output);
      if (!outputValidation.valid) {
        console.error("API Output validation failed:", outputValidation.errors);
      }

      res.json(output);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching users', details: error instanceof Error ? error.message : error });
    }
  }

  async getById(req: Request, res: Response) {
    // Validate input with API wrapper
    const inputValidation = UserValidator.validateGetUserByIdInput({ id: req.params.id });
    if (!inputValidation.valid) {
      return res.status(400).json({ errors: inputValidation.errors });
    }

    try {
      const user = await this.userService.findUserById(Number(req.params.id));
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Prepare output according to API spec
      const output: GetUserByIdOutput = {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone
      };

      // Validate output with API wrapper
      const outputValidation = UserValidator.validateGetUserByIdOutput(output);
      if (!outputValidation.valid) {
        console.error("API Output validation failed:", outputValidation.errors);
      }

      res.json(output);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching user', details: error instanceof Error ? error.message : error });
    }
  }

  async update(req: UpdateUserRequest, res: Response) {
    const validation = UserRequest.validateUpdate(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    try {
      const id = Number(req.params.id);
      const updates = req.body;

      const updatedUser = await this.userService.updateUser(id, updates);

      res.json(UserResource.single(updatedUser));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating user';

      if (errorMessage === 'User not found') {
        return res.status(404).json({ error: errorMessage });
      }

      console.error(error);
      res.status(500).json({ error: 'Error updating user', details: errorMessage });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await this.userService.deleteUser(id);

      res.json({ success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting user';

      if (errorMessage === 'User not found') {
        return res.status(404).json({ error: errorMessage });
      }

      console.error(error);
      res.status(500).json({ error: 'Error deleting user', details: errorMessage });
    }
  }
}
