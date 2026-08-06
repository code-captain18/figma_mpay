import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'mpay_access_token';
const REFRESH_KEY = 'mpay_refresh_token';

// Kept in memory so the Axios request interceptor can read it synchronously
let _memAccessToken: string | null = null;

export const getCachedAccessToken = (): string | null => _memAccessToken;
export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY);

export async function setTokens(access: string, refresh: string): Promise<void> {
    _memAccessToken = access;
    await Promise.all([
        SecureStore.setItemAsync(ACCESS_KEY, access),
        SecureStore.setItemAsync(REFRESH_KEY, refresh),
    ]);
}

export async function clearTokens(): Promise<void> {
    _memAccessToken = null;
    await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_KEY),
        SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
}
