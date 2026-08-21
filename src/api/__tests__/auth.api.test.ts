/**
 * Tests for apiLogin error discrimination (B-002).
 * Verifies network/timeout/server errors produce distinct messages from invalid credentials.
 */
import axios from 'axios';
import { apiLogin, apiVerifyPassword } from '../auth.api';

jest.mock('@/utils/config', () => ({
    config: { apiBaseUrl: 'https://test.example.com/api' },
}));

// apiVerifyPassword uses apiClient, which needs these mocks
jest.mock('../client', () => {
    class MockApiError extends Error {
        status: number;
        constructor(statusCode: number, message: string) {
            super(message);
            this.name = 'ApiError';
            this.status = statusCode;
        }
    }
    return {
        apiClient: { post: jest.fn() },
        ApiError: MockApiError,
    };
});

const mockAxiosPost = jest.spyOn(axios, 'post');

beforeEach(() => {
    jest.clearAllMocks();
});

// ── apiLogin ─────────────────────────────────────────────────────────────────

describe('apiLogin — error discrimination', () => {
    it('returns user data on success', async () => {
        const user = { userId: 1, username: 'alice', accountType: 'reseller', accountId: 'ACC1', enableApi: 'yes' };
        mockAxiosPost.mockResolvedValueOnce({ data: { user, accessToken: 'at', refreshToken: 'rt' } });

        const result = await apiLogin('alice', 'correct');
        expect(result.user).toEqual(user);
        expect(result.accessToken).toBe('at');
    });

    it('throws with invalid-credentials message for 401', async () => {
        mockAxiosPost.mockRejectedValueOnce({
            response: { status: 401, data: { message: 'Invalid credentials' } },
        });

        await expect(apiLogin('alice', 'wrong')).rejects.toMatchObject({
            status: 401,
            message: 'Invalid credentials',
        });
    });

    it('throws with invalid-credentials fallback for 400 without message', async () => {
        mockAxiosPost.mockRejectedValueOnce({ response: { status: 400, data: {} } });

        await expect(apiLogin('u', 'p')).rejects.toMatchObject({
            message: 'Invalid username or password.',
        });
    });

    it('throws network-connectivity message when no response', async () => {
        mockAxiosPost.mockRejectedValueOnce({ code: 'ERR_NETWORK' });

        await expect(apiLogin('u', 'p')).rejects.toMatchObject({
            status: 0,
            message: expect.stringContaining('Unable to connect'),
        });
    });

    it('throws timeout message for ECONNABORTED', async () => {
        mockAxiosPost.mockRejectedValueOnce({ code: 'ECONNABORTED' });

        await expect(apiLogin('u', 'p')).rejects.toMatchObject({
            status: 0,
            message: expect.stringContaining('timed out'),
        });
    });

    it('throws timeout message for ETIMEDOUT', async () => {
        mockAxiosPost.mockRejectedValueOnce({ code: 'ETIMEDOUT' });

        await expect(apiLogin('u', 'p')).rejects.toMatchObject({
            message: expect.stringContaining('timed out'),
        });
    });

    it('throws service-unavailable message for 500', async () => {
        mockAxiosPost.mockRejectedValueOnce({ response: { status: 500, data: {} } });

        await expect(apiLogin('u', 'p')).rejects.toMatchObject({
            status: 500,
            message: expect.stringContaining('temporarily unavailable'),
        });
    });

    it('throws service-unavailable message for 503', async () => {
        mockAxiosPost.mockRejectedValueOnce({ response: { status: 503, data: {} } });

        await expect(apiLogin('u', 'p')).rejects.toMatchObject({
            message: expect.stringContaining('temporarily unavailable'),
        });
    });

    it('throws rate-limit message for 429', async () => {
        mockAxiosPost.mockRejectedValueOnce({ response: { status: 429, data: {} } });

        await expect(apiLogin('u', 'p')).rejects.toMatchObject({
            status: 429,
            message: expect.stringContaining('Too many login attempts'),
        });
    });
});

// ── apiVerifyPassword ─────────────────────────────────────────────────────────

describe('apiVerifyPassword — error discrimination', () => {
    const { apiClient } = require('../client') as { apiClient: { post: jest.Mock } };

    beforeEach(() => jest.clearAllMocks());

    it('returns true when server confirms valid password', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { valid: true } });
        await expect(apiVerifyPassword('correct')).resolves.toBe(true);
    });

    it('returns false for 401 (wrong password)', async () => {
        apiClient.post.mockRejectedValueOnce({ response: { status: 401 } });
        await expect(apiVerifyPassword('wrong')).resolves.toBe(false);
    });

    it('returns false for 400 (wrong password)', async () => {
        apiClient.post.mockRejectedValueOnce({ response: { status: 400 } });
        await expect(apiVerifyPassword('wrong')).resolves.toBe(false);
    });

    it('throws (does not return false) on network error', async () => {
        apiClient.post.mockRejectedValueOnce({ code: 'ERR_NETWORK' });
        await expect(apiVerifyPassword('p')).rejects.toBeInstanceOf(Error);
    });

    it('throws (does not return false) on server error', async () => {
        apiClient.post.mockRejectedValueOnce({ response: { status: 500, data: { message: 'Server error' } } });
        await expect(apiVerifyPassword('p')).rejects.toBeInstanceOf(Error);
    });
});
