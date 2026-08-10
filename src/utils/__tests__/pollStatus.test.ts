import { pollTransactionStatus } from '../pollStatus';

jest.mock('@/api', () => ({
  apiCheckTransactionStatus: jest.fn(),
}));

import { apiCheckTransactionStatus } from '@/api';
const mockCheck = apiCheckTransactionStatus as jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  mockCheck.mockReset();
});
afterEach(() => jest.useRealTimers());

async function runPoll(promise: Promise<void>) {
  // Advance timers repeatedly until the promise settles
  const result = promise.then(() => 'resolved').catch((e: Error) => e.message);
  for (let i = 0; i < 20; i++) {
    await Promise.resolve();
    jest.advanceTimersByTime(2_500);
    await Promise.resolve();
  }
  return result;
}

describe('pollTransactionStatus', () => {
  it('resolves immediately on first success', async () => {
    mockCheck.mockResolvedValue({ status: 'success' });
    const result = await runPoll(pollTransactionStatus('REF-1'));
    expect(result).toBe('resolved');
    expect(mockCheck).toHaveBeenCalledWith('REF-1');
  });

  it('rejects immediately on first failure', async () => {
    mockCheck.mockResolvedValue({ status: 'failed', entry: { Message: 'Insufficient funds' } });
    const result = await runPoll(pollTransactionStatus('REF-2'));
    expect(result).toBe('Insufficient funds');
  });

  it('keeps polling while pending then resolves on success', async () => {
    mockCheck
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValue({ status: 'success' });
    const result = await runPoll(pollTransactionStatus('REF-3'));
    expect(result).toBe('resolved');
    expect(mockCheck.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('rejects with timeout message when max duration exceeded', async () => {
    mockCheck.mockResolvedValue({ status: 'pending' });
    const promise = pollTransactionStatus('REF-4', 1_000);
    // Advance past the timeout
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
      jest.advanceTimersByTime(200);
      await Promise.resolve();
    }
    const result = await promise.then(() => 'resolved').catch((e: Error) => e.message);
    expect(result).toMatch(/timed out/i);
  });

  it('retries silently on network error', async () => {
    mockCheck
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({ status: 'success' });
    const result = await runPoll(pollTransactionStatus('REF-5'));
    expect(result).toBe('resolved');
  });

  it('uses fallback message when failed entry has no Message', async () => {
    mockCheck.mockResolvedValue({ status: 'failed', entry: {} });
    const result = await runPoll(pollTransactionStatus('REF-6'));
    expect(result).toBe('Transaction failed.');
  });
});
