import { mockRequest } from './client';
import type { AuthUser } from './auth.api';

export interface TopUpPayload {
  userId: string;
  walletType: 'etopup' | 'momo';
  product: string;
  amount: number;
  phoneNumber?: string;
  referenceId: string;
}

export interface TopUpResult {
  reference: string;
  amount: number;
  walletType: string;
}

export async function apiGetWalletBalances(
  userId: string,
): Promise<Pick<AuthUser, 'eTopupBalance' | 'momoBalance'>> {
  return mockRequest(() => ({ eTopupBalance: 480.50, momoBalance: 1250.00 }));
}

export async function apiTopUpWallet(payload: TopUpPayload): Promise<TopUpResult> {
  return mockRequest(() => ({
    reference: payload.referenceId,
    amount: payload.amount,
    walletType: payload.walletType === 'etopup' ? 'e Top-Up Wallet' : 'Mobile Money Wallet',
  }));
}
