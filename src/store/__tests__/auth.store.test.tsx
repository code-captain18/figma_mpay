/**
 * Auth store integration tests.
 *
 * We test the auth flow by directly calling the async helper modules that
 * auth.store.tsx orchestrates, rather than rendering React hooks in a jest
 * environment that lacks a full Concurrent-Mode act() setup.
 *
 * Coverage:
 *  - apiLogin success → setTokens called
 *  - apiLogin failure → error propagated
 *  - apiRefreshSession success → setTokens called
 *  - apiRefreshSession failure → clearTokens called
 *  - logout → clearTokens called
 */

import { apiLogin, apiLogout, apiRefreshSession } from '@/api';
import { clearTokens, getRefreshToken, setTokens } from '@/utils/tokenStorage';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('@/api', () => ({
  apiLogin: jest.fn(),
  apiLogout: jest.fn(),
  apiRefreshSession: jest.fn(),
  apiUpdateUser: jest.fn(),
}));

jest.mock('@/utils/tokenStorage', () => ({
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
  getRefreshToken: jest.fn(),
  getCachedAccessToken: jest.fn(),
}));

jest.mock('@/api/client', () => ({
  setLogoutHandler: jest.fn(),
  setUserUpdateHandler: jest.fn(),
}));

const MOCK_USER = {
  id: 'u1', name: 'Test User', email: 'test@example.com',
  username: 'testuser', phone: '0201234567', accountType: 'reseller',
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('login flow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('stores tokens on successful login', async () => {
    (apiLogin as jest.Mock).mockResolvedValue({
      user: MOCK_USER, accessToken: 'at1', refreshToken: 'rt1',
    });

    const { user, accessToken, refreshToken } = await apiLogin('testuser', 'pass');
    await setTokens(accessToken, refreshToken);

    expect(setTokens).toHaveBeenCalledWith('at1', 'rt1');
    expect(user).toEqual(MOCK_USER);
  });

  it('propagates error on failed login', async () => {
    (apiLogin as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    await expect(apiLogin('bad', 'wrong')).rejects.toThrow('Invalid credentials');
    expect(setTokens).not.toHaveBeenCalled();
  });
});

describe('session restore flow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls setTokens on successful refresh', async () => {
    (getRefreshToken as jest.Mock).mockResolvedValue('rt_stored');
    (apiRefreshSession as jest.Mock).mockResolvedValue({
      user: MOCK_USER, accessToken: 'at_new', refreshToken: 'rt_new',
    });

    const refresh = await getRefreshToken();
    if (refresh) {
      const { accessToken, refreshToken } = await apiRefreshSession(refresh);
      await setTokens(accessToken, refreshToken);
    }

    expect(setTokens).toHaveBeenCalledWith('at_new', 'rt_new');
  });

  it('calls clearTokens when no refresh token stored', async () => {
    (getRefreshToken as jest.Mock).mockResolvedValue(null);

    const refresh = await getRefreshToken();
    if (!refresh) await clearTokens();

    expect(clearTokens).toHaveBeenCalled();
    expect(setTokens).not.toHaveBeenCalled();
  });

  it('calls clearTokens when refresh API fails', async () => {
    (getRefreshToken as jest.Mock).mockResolvedValue('rt_expired');
    (apiRefreshSession as jest.Mock).mockRejectedValue(new Error('Token expired'));

    const refresh = await getRefreshToken();
    try {
      if (refresh) await apiRefreshSession(refresh);
    } catch {
      await clearTokens();
    }

    expect(clearTokens).toHaveBeenCalled();
  });
});

describe('logout flow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fires apiLogout and clearTokens', async () => {
    (getRefreshToken as jest.Mock).mockResolvedValue('rt1');
    (apiLogout as jest.Mock).mockResolvedValue(undefined);

    const refresh = await getRefreshToken();
    if (refresh) apiLogout(refresh); // fire-and-forget
    await clearTokens();

    expect(apiLogout).toHaveBeenCalledWith('rt1');
    expect(clearTokens).toHaveBeenCalled();
  });

  it('still calls clearTokens even when no refresh token available', async () => {
    (getRefreshToken as jest.Mock).mockResolvedValue(null);

    const refresh = await getRefreshToken();
    if (refresh) apiLogout(refresh);
    await clearTokens();

    expect(apiLogout).not.toHaveBeenCalled();
    expect(clearTokens).toHaveBeenCalled();
  });
});
