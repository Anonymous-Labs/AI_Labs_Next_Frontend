/**
 * Centralized error handling utilities
 */

import type { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      return (
        axiosError.response.data.detail ||
        axiosError.response.data.error ||
        axiosError.response.data.message ||
        axiosError.message ||
        "An unexpected error occurred"
      );
    }
    return error.message || "An unexpected error occurred";
  }
  return "An unexpected error occurred";
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const axiosError = error as AxiosError;
    return !axiosError.response && axiosError.request;
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
  }
  return false;
}

