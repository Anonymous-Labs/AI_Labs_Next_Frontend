/**
 * Auth Service - Centralized authentication API calls
 * This service layer abstracts API calls and provides type-safe methods
 */

import { api } from "../axios";
import type {
  AuthResponse,
  AuthUser,
  PasswordResetResponse,
  ApiResponse,
} from "@/types/api";
import type {
  SignInInput,
  SignUpInput,
  VerifyOtpInput,
  ResendOtpInput,
  RequestPasswordResetInput,
} from "@/lib/validations/auth";

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn(input: SignInInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/user/signin/", {
      ...input,
      username: input.email,
    });
    return response.data;
  }

  /**
   * Sign up with email, password, and user details
   */
  static async signUp(input: SignUpInput): Promise<ApiResponse<{ email: string }>> {
    const response = await api.post<ApiResponse<{ email: string }>>("/api/user/signup/", {
      ...input,
      username: input.email,
    });
    return response.data;
  }

  /**
   * Verify OTP code
   */
  static async verifyOtp(input: VerifyOtpInput): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/api/user/verify-otp/", input);
    return response.data;
  }

  /**
   * Resend OTP code
   */
  static async resendOtp(input: ResendOtpInput): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>("/api/user/resend-otp/", input);
    return response.data;
  }

  /**
   * Request password reset link
   */
  static async requestPasswordReset(
    input: RequestPasswordResetInput
  ): Promise<PasswordResetResponse> {
    const response = await api.post<PasswordResetResponse>(
      "/api/user/password-reset-link/",
      input
    );
    return response.data;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    uidb64: string,
    token: string,
    newPassword: string
  ): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      `/api/user/reset-password/${uidb64}/${token}/`,
      { new_password: newPassword }
    );
    return response.data;
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<Pick<AuthResponse, "access">> {
    const response = await api.post<Pick<AuthResponse, "access">>(
      "/api/user/token/refresh/",
      { refresh: refreshToken }
    );
    return response.data;
  }
}

