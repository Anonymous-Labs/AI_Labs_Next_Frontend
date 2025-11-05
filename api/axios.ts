import axios, { AxiosError } from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "@/lib/constants";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

function setTokens(access?: string, refresh?: string): void {
  if (typeof window === "undefined") return;
  if (access) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
}

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string | null) => void; reject: (err: unknown) => void; }> = [];

function subscribeTokenRefresh() {
  return new Promise<string | null>((resolve, reject) => {
    pendingQueue.push({ resolve, reject });
  });
}

function onRefreshed(token: string | null) {
  pendingQueue.forEach(p => p.resolve(token));
  pendingQueue = [];
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers?.Authorization) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;
    const status = error.response?.status;

    if (status === 401 && !original?._retry) {
      if (isRefreshing) {
        const newToken = await subscribeTokenRefresh();
        if (newToken && original.headers) {
          original.headers.set("Authorization", `Bearer ${newToken}`);
        }
        original._retry = true;
        return api(original);
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const refresh = getRefreshToken();
        if (!refresh) throw error;
        const resp = await axios.post(`${API_BASE_URL}/api/user/token/refresh/`, { refresh });
        const access = (resp.data as any)?.access || (resp.data as any)?.access_token;
        setTokens(access, refresh);
        onRefreshed(access || null);
        if (access && original.headers) {
          original.headers.set("Authorization", `Bearer ${access}`);
        }
        return api(original);
      } catch (e) {
        onRefreshed(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function storeTokensFromAuthResponse(data: any) {
  const access = data?.access || data?.access_token;
  const refresh = data?.refresh || data?.refresh_token;
  setTokens(access, refresh);
}
