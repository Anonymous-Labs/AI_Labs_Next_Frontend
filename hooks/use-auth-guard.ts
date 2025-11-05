/**
 * Custom hook for authentication guard logic
 * Provides reusable authentication checking logic
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

/**
 * Hook to protect routes and redirect if not authenticated
 */
export function useAuthGuard() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const hasAuth = checkAuth();
    if (!hasAuth) {
      router.replace("/auth");
    }
  }, [router, checkAuth]);

  return { isAuthenticated, checkAuth };
}

