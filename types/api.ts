/**
 * API response types for type safety across the application
 */

export interface ApiError {
  detail?: string;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  detail?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  access_token?: string;
  refresh_token?: string;
}

export interface AuthResponse extends AuthTokens {
  user?: AuthUser;
  requires_otp?: boolean;
  email?: string;
}

export interface AuthUser {
  id: string | number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface PasswordResetResponse {
  message: string;
  email?: string;
}

