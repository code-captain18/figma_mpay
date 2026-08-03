/** Runtime config sourced from EXPO_PUBLIC_* environment variables. */
export const config = {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
} as const;
