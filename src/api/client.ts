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

// Decode JWT exp without a library; returns expiry epoch seconds or 0 on failure
function jwtExpiry(token: string): number {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.exp ?? 0;
  } catch {
    return 0;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

apiClient.interceptors.request.use(async (reqConfig) => {
  let token = getCachedAccessToken();

  // Proactively refresh if token is expired or expires within 60 seconds
  if (token) {
    const exp = jwtExpiry(token);
    const nowSec = Date.now() / 1000;
    if (exp > 0 && exp - nowSec < 60) {
      if (!pendingRefresh) {
        pendingRefresh = refreshAccessToken().finally(() => { pendingRefresh = null; });
      }
      token = await pendingRefresh;
    }
  }

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
