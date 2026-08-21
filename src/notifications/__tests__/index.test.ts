/**
 * Push notification tests (C-003 / spec section 21).
 *
 * Covers:
 *  - Token retrieval using EAS projectId
 *  - Permission denied → returns null (app stays functional)
 *  - Missing projectId → returns null
 *  - Token fetch failure → returns null (graceful degradation)
 *  - setupNotificationListeners cleanup
 */

jest.mock('expo-constants', () => ({
    __esModule: true,
    default: {
        appOwnership: 'standalone', // not Expo Go
        expoConfig: { extra: { eas: { projectId: 'test-project-id' } } },
    },
}));

// Lazy-require mock must be in place before the module is loaded
const mockSetNotificationHandler = jest.fn();
const mockSetNotificationChannelAsync = jest.fn().mockResolvedValue(undefined);
const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockGetExpoPushTokenAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn().mockResolvedValue(undefined);
const mockAddNotificationReceivedListener = jest.fn(() => ({ remove: jest.fn() }));
const mockAddNotificationResponseReceivedListener = jest.fn(() => ({ remove: jest.fn() }));

jest.mock('expo-notifications', () => ({
    setNotificationHandler: mockSetNotificationHandler,
    setNotificationChannelAsync: mockSetNotificationChannelAsync,
    getPermissionsAsync: mockGetPermissionsAsync,
    requestPermissionsAsync: mockRequestPermissionsAsync,
    getExpoPushTokenAsync: mockGetExpoPushTokenAsync,
    scheduleNotificationAsync: mockScheduleNotificationAsync,
    addNotificationReceivedListener: mockAddNotificationReceivedListener,
    addNotificationResponseReceivedListener: mockAddNotificationResponseReceivedListener,
    AndroidImportance: { HIGH: 4 },
}));


import {
    registerForPushNotificationsAsync,
    setupNotificationListeners,
} from '../index';

beforeEach(() => {
    jest.clearAllMocks();
    mockSetNotificationChannelAsync.mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockResolvedValue(undefined);
});

// ── registerForPushNotificationsAsync ────────────────────────────────────────

describe('registerForPushNotificationsAsync', () => {
    it('returns push token when permission already granted', async () => {
        mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
        mockGetExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[abc123]' });

        const token = await registerForPushNotificationsAsync();
        expect(token).toBe('ExponentPushToken[abc123]');
        expect(mockGetExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'test-project-id' });
    });

    it('requests permission when not yet granted, then returns token', async () => {
        mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
        mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
        mockGetExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[xyz]' });

        const token = await registerForPushNotificationsAsync();
        expect(mockRequestPermissionsAsync).toHaveBeenCalled();
        expect(token).toBe('ExponentPushToken[xyz]');
    });

    it('returns null when permission is denied — app stays functional', async () => {
        mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
        mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

        const token = await registerForPushNotificationsAsync();
        expect(token).toBeNull();
        expect(mockGetExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('returns null when permission request is denied', async () => {
        mockGetPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
        mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

        const token = await registerForPushNotificationsAsync();
        expect(token).toBeNull();
    });

    it('returns null when token fetch throws — app stays functional', async () => {
        mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
        mockGetExpoPushTokenAsync.mockRejectedValue(new Error('Device not registered'));

        const token = await registerForPushNotificationsAsync();
        expect(token).toBeNull();
    });
});

// ── setupNotificationListeners ────────────────────────────────────────────────

describe('setupNotificationListeners', () => {
    it('returns a cleanup function that removes both subscriptions', () => {
        const removeSub1 = jest.fn();
        const removeSub2 = jest.fn();
        mockAddNotificationReceivedListener.mockReturnValueOnce({ remove: removeSub1 });
        mockAddNotificationResponseReceivedListener.mockReturnValueOnce({ remove: removeSub2 });

        const cleanup = setupNotificationListeners();
        cleanup();

        expect(removeSub1).toHaveBeenCalled();
        expect(removeSub2).toHaveBeenCalled();
    });

    it('calls onResponse handler when a notification is tapped', () => {
        const onResponse = jest.fn();
        const capturedHandler = { fn: (_: unknown) => { } };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mockAddNotificationResponseReceivedListener as jest.Mock).mockImplementationOnce((fn: (r: unknown) => void) => {
            capturedHandler.fn = fn;
            return { remove: jest.fn() };
        });
        mockAddNotificationReceivedListener.mockReturnValueOnce({ remove: jest.fn() });

        setupNotificationListeners(undefined, onResponse);

        const fakeResponse = { notification: { request: { content: { data: { txId: 'tx123' } } } } };
        capturedHandler.fn(fakeResponse);

        expect(onResponse).toHaveBeenCalledWith(fakeResponse);
    });
});
