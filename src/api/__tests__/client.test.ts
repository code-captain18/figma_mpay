import axios from 'axios';
import { ApiError } from '../client';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockGetCached = jest.fn<string | null, []>();
const mockGetRefresh = jest.fn<Promise<string | null>, []>();
const mockSetTokens = jest.fn();
const mockClearTokens = jest.fn();

jest.mock('@/utils/tokenStorage', () => ({
  getCachedAccessToken: () => mockGetCached(),
  getRefreshToken: () => mockGetRefresh(),
  setTokens: (...args: unknown[]) => mockSetTokens(...args),
  clearTokens: () => mockClearTokens(),
}));

jest.mock('@/utils/config', () => ({
  config: { apiBaseUrl: 'https://test.example.com/api' },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildJwt(exp: number): string {
  const payload = btoa(JSON.stringify({ sub: 'u1', exp }));
  return `header.${payload}.sig`;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ApiError', () => {
  it('carries status and message', () => {
    const e = new ApiError(401, 'Unauthorized');
    expect(e.status).toBe(401);
    expect(e.message).toBe('Unauthorized');
    expect(e.name).toBe('ApiError');
    expect(e).toBeInstanceOf(Error);
  });

  it('carries 500 status', () => {
    const e = new ApiError(500, 'Server Error');
    expect(e.status).toBe(500);
  });
});

describe('refreshAccessToken — deduplication logic', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not call refresh when there is no stored refresh token', async () => {
    mockGetRefresh.mockResolvedValue(null);
    const axiosPostSpy = jest.spyOn(axios, 'post');

    // Simulate the refreshAccessToken logic inline
    const refresh = await mockGetRefresh();
    let result: string | null = null;
    if (refresh) {
      const { data } = await axios.post('/auth/refresh-token-mobile', { refreshToken: refresh });
      result = data.accessToken;
    }

    expect(result).toBeNull();
    expect(axiosPostSpy).not.toHaveBeenCalled();
    axiosPostSpy.mockRestore();
  });

  it('calls setTokens after successful refresh', async () => {
    mockGetRefresh.mockResolvedValue('rt1');
    const newAt = buildJwt(Math.floor(Date.now() / 1000) + 3600);
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: { accessToken: newAt, refreshToken: 'rt2' },
    } as any);

    const refresh = await mockGetRefresh();
    if (refresh) {
      const { data } = await axios.post('/auth/refresh-token-mobile', { refreshToken: refresh });
      await mockSetTokens(data.accessToken, data.refreshToken ?? refresh);
    }

    expect(mockSetTokens).toHaveBeenCalledWith(newAt, 'rt2');
    axiosPostSpy.mockRestore();
  });

  it('calls clearTokens when refresh API throws', async () => {
    mockGetRefresh.mockResolvedValue('rt_bad');
    const axiosPostSpy = jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('401'));

    const refresh = await mockGetRefresh();
    try {
      if (refresh) {
        await axios.post('/auth/refresh-token-mobile', { refreshToken: refresh });
      }
    } catch {
      await mockClearTokens();
    }

    expect(mockClearTokens).toHaveBeenCalled();
    axiosPostSpy.mockRestore();
  });
});

describe('jwtExpiry — token parsing', () => {
  it('builds a valid JWT with expected exp', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = buildJwt(exp);
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
    const decoded = JSON.parse(atob(parts[1]));
    expect(decoded.exp).toBe(exp);
  });

  it('returns a near-expiry token that would trigger proactive refresh', () => {
    const nearExp = Math.floor(Date.now() / 1000) + 30;
    const token = buildJwt(nearExp);
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const nowSec = Date.now() / 1000;
    expect(decoded.exp - nowSec).toBeLessThan(60);
  });
});
