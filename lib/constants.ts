/**
 * Application-wide constants
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || process.env.SERVER_BASE_URL || "http://localhost:8000";

export const APP_NAME = "AI Lab";
export const APP_DESCRIPTION = "Next Generation AI Workspace";

export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  RESET_PASSWORD: "/reset-password",
  RESET_PASSWORD_WITH_TOKEN: (uidb64: string, token: string) => `/reset-password/${uidb64}/${token}`,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  AUTH_USER: "auth_user",
} as const;

