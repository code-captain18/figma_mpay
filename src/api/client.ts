import { config } from '@/utils/config';
import { clearTokens, getCachedAccessToken, getRefreshToken, setTokens } from '@/utils/tokenStorage';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- Mock infrastructure (for non-integrated endpoints) ---
const LATENCY = { min: 300, max: 800 };
export async function mockRequest<T>(factory: () => T): Promise<T> {
  const delay = LATENCY.min + Math.random() * (LATENCY.max - LATENCY.min);
  await new Promise<void>(r => setTimeout(r, delay));
  return factory();
}

// --- Real HTTP client ---
let logoutHandler: (() => void) | null = null;
let userUpdateHandler: ((user: unknown) => void) | null = null;

export function setLogoutHandler(fn: () => void): void {
  logoutHandler = fn;
}

export function setUserUpdateHandler(fn: (user: unknown) => void): void {
  userUpdateHandler = fn;
}

let pendingRefresh: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${config.apiBaseUrl}/auth/refresh-token-mobile`, { refreshToken: refresh });
    await setTokens(data.accessToken, data.refreshToken ?? refresh);
    if (data.user) userUpdateHandler?.(data.user);
    return data.accessToken as string;
  } catch {
    await clearTokens();
    logoutHandler?.();
    return null;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

apiClient.interceptors.request.use((reqConfig) => {
  const token = getCachedAccessToken();
  if (token) reqConfig.headers.Authorization = `Bearer ${token}`;
  return reqConfig;
});

apiClient.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    // Deduplicate concurrent refresh attempts
    if (!pendingRefresh) {
      pendingRefresh = refreshAccessToken().finally(() => { pendingRefresh = null; });
    }
    const newToken = await pendingRefresh;
    if (!newToken) return Promise.reject(new ApiError(401, 'Session expired. Please log in again.'));

    original.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(original);
  },
);
