import { QK } from '../useAppQueries';

describe('QK — query key contract', () => {
  it('walletBalances key is a stable array', () => {
    expect(QK.walletBalances).toEqual(['walletBalances']);
  });

  it('transactions key is a stable array', () => {
    expect(QK.transactions).toEqual(['transactions']);
  });

  it('recentTransactions key includes limit', () => {
    expect(QK.recentTransactions(5)).toEqual(['recent-transactions', 5]);
    expect(QK.recentTransactions(10)).toEqual(['recent-transactions', 10]);
  });

  it('dashboard key includes date range', () => {
    expect(QK.dashboard('2026-01-01', '2026-01-31')).toEqual(['dashboard', '2026-01-01', '2026-01-31']);
  });

  it('profile key includes assistant flag and email', () => {
    expect(QK.profile(false, 'user@test.com')).toEqual(['profile', false, 'user@test.com']);
    expect(QK.profile(true, 'asst@test.com')).toEqual(['profile', true, 'asst@test.com']);
  });

  it('all wallet-affecting invalidation targets exist on QK', () => {
    // Ensures every screen that calls invalidateQueries can always find the key
    expect(QK.walletBalances).toBeDefined();
    expect(QK.transactions).toBeDefined();
    expect(QK.recentTransactions(5)).toBeDefined();
  });
});
