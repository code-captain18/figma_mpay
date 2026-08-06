import { apiClient, ApiError } from './client';

export interface WalletBalances {
  topup: number;
  momo: number;
}

export interface LoadWalletPayload {
  amount: number;
  phoneNumber?: string;  // '233XXXXXXXXX' format
  referenceId: string;
  product: 'MMONEYDB' | 'MOMOWALLET' | 'MOMOCASHOUT' | 'MOMOCASHIN';
  accountId: string;
}

export interface LoadWalletResult {
  success: boolean;
  message: string;
  referenceId: string;
}

export interface TransactionStatusEntry {
  Message: string;
  ReferenceId: string;
  Amount: number;
  PhoneNumber: string;
  TransactionDate: string;
}

export interface TransactionStatusResult {
  status: 'success' | 'failed' | 'pending';
  entry?: TransactionStatusEntry;
}

export interface UserProduct {
  prodCode: string;
  prodName: string;
  prodType: string;
  enabled: boolean;
}

export async function apiGetWalletBalances(): Promise<WalletBalances> {
  try {
    const { data } = await apiClient.post<{ balances: WalletBalances }>('resellers/user/balance', {});
    return data.balances;
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.error ?? 'Failed to fetch balances.');
  }
}


export async function apiLoadWalletFromWallet(payload: LoadWalletPayload): Promise<LoadWalletResult> {
  // Step 1: credit MoMo → e-TopUp
  try {
    await apiClient.post('core/credit', {
      amount: payload.amount,
      phoneNumber: payload.phoneNumber,
      referenceId: payload.referenceId,
      product: payload.product,
      accountId: payload.accountId,
    });
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Credit transaction failed.');
  }

  // Step 2: debit e-TopUp balance (credit already committed above)
  const debitRef = payload.referenceId.replace(/^WB/, 'WC');
  try {
    const { data } = await apiClient.post<LoadWalletResult>('core/debit', {
      amount: payload.amount,
      phoneNumber: payload.phoneNumber,
      referenceId: debitRef,
      product: payload.product,
      accountId: payload.accountId,
    });
    return data;
  } catch (err: any) {
    // Credit succeeded but debit failed — surface ref so support can reconcile
    throw new ApiError(
      err.response?.status ?? 0,
      `Wallet load incomplete. Your MoMo may have been deducted. Please contact support with reference: ${payload.referenceId}`,
    );
  }
}

export async function apiCheckTransactionStatus(referenceId: string): Promise<TransactionStatusResult> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: TransactionStatusEntry[] }>(
      'transaction-report/report',
      { referenceId },
    );
    const entry = data.data?.[0];
    if (!entry) return { status: 'pending' };
    const msg = entry.Message.toLowerCase();
    const status = msg.includes('successfully') ? 'success'
      : (msg.includes('failed') || msg.includes('could not')) ? 'failed'
        : 'pending';
    return { status, entry };
  } catch (err: any) {
    if (err.response?.status === 404) return { status: 'pending' };
    throw new ApiError(err.response?.status ?? 0, 'Failed to check transaction status.');
  }
}

export async function apiSendMoMo(payload: LoadWalletPayload): Promise<LoadWalletResult> {
  try {
    const { data } = await apiClient.post<LoadWalletResult>('core/credit', {
      amount: payload.amount,
      phoneNumber: payload.phoneNumber,
      referenceId: payload.referenceId,
      product: payload.product,
      accountId: payload.accountId,
    });
    return data;
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Transfer failed.');
  }
}

export async function apiLoadWalletMoMo(payload: LoadWalletPayload): Promise<LoadWalletResult> {
  try {
    const { data } = await apiClient.post<LoadWalletResult>('core/debit', {
      amount: payload.amount,
      phoneNumber: payload.phoneNumber,
      referenceId: payload.referenceId,
      product: payload.product,
      accountId: payload.accountId,
    });
    return data;
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'MoMo wallet load failed.');
  }
}

export async function apiGetUserProducts(): Promise<UserProduct[]> {
  try {
    const { data } = await apiClient.post<{ products: UserProduct[] }>('resellers/view', {});
    return data.products ?? [];
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, 'Failed to fetch products.');
  }
}

