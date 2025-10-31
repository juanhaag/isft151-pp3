/**
 * API Wrapper Types for Auth Endpoints
 * Define input/output specifications for each auth endpoint
 * Including all possible responses (success and errors)
 */

// ============================================================================
// Common error structure
// ============================================================================
export interface ErrorResponse {
  error: string;
  description: string;
}

export interface ValidationErrorResponse {
  errors: Record<string, any>;
}

// ============================================================================
// POST /login
// ============================================================================
export interface LoginInput {
  username: string;
  password: string;
}

// Success response (200)
export interface LoginSuccessResponse {
  token: string;
}

// All possible responses
export type LoginResponse =
  | LoginSuccessResponse                   
  | ErrorResponse                            
  | ValidationErrorResponse                  
  | { error: "Not Found"; description: string }         
  | { error: "Unauthorized"; description: string }      
  | { error: "Internal Server Error"; description: string }; 

export interface LoginOutput {
  token: string;
}

export interface LoginError {
  error: string;
  description: string;
}

// ============================================================================
// POST /register
// ============================================================================
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  phone?: string;
}

// Success response (201)
export interface RegisterSuccessResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone?: string;
  };
}

// All possible responses
export type RegisterResponse =
  | RegisterSuccessResponse                              
  | ErrorResponse                                        
  | ValidationErrorResponse                             
  | { error: "Conflict"; description: string }           
  | { error: "Internal Server Error"; description: string }; 

export interface RegisterOutput {
  token: string;
  user: {
    id: number;
    username?: string;
    email: string;
    phone?: string;
  };
}

export interface RegisterError {
  error: string;
  description: string;
}

// ============================================================================
// POST /logout
// ============================================================================
export interface LogoutInput {
  // No input required
}

// Success response (200)
export interface LogoutSuccessResponse {
  success: boolean;
  message: string;
}

export type LogoutResponse =
  | LogoutSuccessResponse                               
  | { error: "Internal Server Error"; description: string }; 

export interface LogoutOutput {
  success: boolean;
  message: string;
}

export interface LogoutError {
  error: string;
  description: string;
}
