/**
 * API Wrapper Types for User Endpoints
 */

// ============================================================================
// POST / - Create user
// ============================================================================
export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateUserOutput {
  id: number;
  username: string;
  email: string;
  phone?: string;
}

export interface CreateUserError {
  error: string;
  description: string;
}

// ============================================================================
// GET / - Get all users
// ============================================================================
export interface GetAllUsersInput {
  // No input required
}

export interface GetAllUsersOutput {
  users: Array<{
    id: number;
    username: string;
    email: string;
    phone?: string;
  }>;
}

export interface GetAllUsersError {
  error: string;
  description: string;
}

// ============================================================================
// GET /:id - Get user by id
// ============================================================================
export interface GetUserByIdInput {
  id: string;
}

export interface GetUserByIdOutput {
  id: number;
  username: string;
  email: string;
  phone?: string;
}

export interface GetUserByIdError {
  error: string;
  description: string;
}
