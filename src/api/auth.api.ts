import type { PermMap } from '@/types';
import { config } from '@/utils/config';
import axios from 'axios';
import { apiClient, ApiError } from './client';

export interface AuthUser {
  userId: number;
  username: string;
  accountType: string;
  accountId: string;
  enableApi: string;
  // Optional — populated from profile/wallet endpoints:
  name?: string;
  email?: string;
  phone?: string;
  eTopupBalance?: number;
  momoBalance?: number;
  hasETopup?: boolean;
  hasMoMo?: boolean;
  permissions?: PermMap;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  try {
    const { data } = await axios.post<LoginResponse>(`${config.apiBaseUrl}/auth/login-mobile`, { username, password }, { timeout: 30_000 });
    return data;
  } catch (err: any) {
    if (!err.response) {
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        throw new ApiError(0, 'The request timed out. Please try again.');
      }
      throw new ApiError(0, 'Unable to connect. Please check your internet connection and try again.');
    }
    const status: number = err.response.status;
    if (status === 429) throw new ApiError(429, 'Too many login attempts. Please wait and try again.');
    if (status >= 500) throw new ApiError(status, 'Service temporarily unavailable. Please try again later.');
    throw new ApiError(status, err.response?.data?.message ?? 'Invalid username or password.');
  }
}

export async function apiRefreshSession(refreshToken: string): Promise<LoginResponse> {
  try {
    const { data } = await axios.post<LoginResponse>(`${config.apiBaseUrl}/auth/refresh-token-mobile`, { refreshToken }, { timeout: 30_000 });
    return data;
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, 'Session expired.');
  }
}

export async function apiLogout(refreshToken: string): Promise<void> {
  // Best-effort: fire and forget, don't block the UI
  apiClient.post('/auth/logout-mobile', { refreshToken }).catch(() => { });
}

export async function apiVerifyPassword(password: string): Promise<boolean> {
  try {
    const { data } = await apiClient.post<{ valid: boolean }>('auth/verify-password', { password });
    return Boolean(data.valid);
  } catch (err: any) {
    const status = err?.response?.status;
    // 400/401 means wrong password; anything else is a network/server error
    if (status === 400 || status === 401) return false;
    throw new ApiError(status ?? 0, err?.response?.data?.message ?? 'Could not verify password. Check your connection and try again.');
  }
}

export async function apiChangePassword(newPassword: string): Promise<void> {
  try {
    await apiClient.post('auth/change-user-password', { password: newPassword });
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Failed to change password.');
  }
}

export async function apiUpdateUser(
  data: Partial<Pick<AuthUser, 'name' | 'phone' | 'email'>>,
): Promise<AuthUser> {
  try {
    const { data: updated } = await apiClient.patch<AuthUser>('/auth/profile', data);
    return updated;
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Failed to update profile.');
  }
}
