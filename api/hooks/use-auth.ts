/**
 * TanStack Query hooks for authentication operations
 * Provides type-safe, optimized data fetching with automatic caching and error handling
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { storeTokensFromAuthResponse } from "../axios";
import type {
  SignInInput,
  SignUpInput,
  VerifyOtpInput,
  ResendOtpInput,
  RequestPasswordResetInput,
} from "@/lib/validations/auth";

export const AUTH_QUERY_KEYS = {
  all: ["auth"] as const,
  user: () => [...AUTH_QUERY_KEYS.all, "user"] as const,
} as const;

/**
 * Sign in mutation
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const { setPendingEmail, setUser, setIsAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: AuthService.signIn,
    onSuccess: (data, variables) => {
      if (data.requires_otp) {
        setPendingEmail(variables.email);
        return;
      }
      if (data.access || data.access_token) {
        storeTokensFromAuthResponse(data);
        setIsAuthenticated(true);
        setUser(data.user || { email: variables.email, id: "" });
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user() });
      }
    },
    onError: (error) => {
      console.error("Sign in error:", error);
    },
  });
}

/**
 * Sign up mutation
 */
export function useSignUp() {
  const { setPendingEmail } = useAuthStore();

  return useMutation({
    mutationFn: AuthService.signUp,
    onSuccess: (_, variables) => {
      setPendingEmail(variables.email);
    },
    onError: (error) => {
      console.error("Sign up error:", error);
    },
  });
}

/**
 * Verify OTP mutation
 */
export function useVerifyOtp() {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated, pendingEmail, clearPendingEmail } = useAuthStore();

  return useMutation({
    mutationFn: (input: VerifyOtpInput) => {
      const emailToUse = input.email || pendingEmail;
      return AuthService.verifyOtp({ ...input, email: emailToUse });
    },
    onSuccess: (data, variables) => {
      if (data.access || data.access_token) {
        storeTokensFromAuthResponse(data);
        setIsAuthenticated(true);
        setUser(data.user || { email: variables.email || pendingEmail || "", id: "" });
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user() });
      }
      clearPendingEmail();
    },
    onError: (error) => {
      console.error("OTP verification error:", error);
    },
  });
}

/**
 * Resend OTP mutation
 */
export function useResendOtp() {
  const { pendingEmail } = useAuthStore();

  return useMutation({
    mutationFn: (input?: ResendOtpInput) => {
      const emailToUse = input?.email || pendingEmail;
      return AuthService.resendOtp({ email: emailToUse });
    },
    onError: (error) => {
      console.error("Resend OTP error:", error);
    },
  });
}

/**
 * Request password reset mutation
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: AuthService.requestPasswordReset,
    onError: (error) => {
      console.error("Password reset request error:", error);
    },
  });
}

/**
 * Reset password with token mutation
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      uidb64,
      token,
      newPassword,
    }: {
      uidb64: string;
      token: string;
      newPassword: string;
    }) => AuthService.resetPassword(uidb64, token, newPassword),
    onError: (error) => {
      console.error("Password reset error:", error);
    },
  });
}

