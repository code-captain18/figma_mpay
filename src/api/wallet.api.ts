import { apiClient, ApiError } from './client';

export interface WalletBalances {
  topup: number;
  momo: number;
}

export interface LoadWalletPayload {
  amount: number;
  phoneNumber?: string;  // local format e.g. 0XXXXXXXXX
  referenceId: string;
  product: 'MMONEYDB' | 'MOMOWALLET' | 'MOMOWALLETDB' | 'MOMOCASHOUT' | 'MOMOCASHIN';
  accountId: string;
  // assistant accounts use these instead of accountId
  reselleraccountId?: string;
  resellerid?: string;
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
  ResponseCode?: string;
  transactionStatus?: string;
  statusDescription?: string;
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
  const creditBody = { amount: payload.amount, phoneNumber: '', referenceId: payload.referenceId, product: 'MOMOWALLET', accountId: payload.accountId };
  // Step 1: credit MoMo → e-TopUp
  try {
    await apiClient.post('core/credit', creditBody);
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Credit transaction failed.');
  }

  // Step 2: debit MoMo wallet
  const debitRef = payload.referenceId.replace(/^WB/, 'WC');
  const debitBody = { amount: payload.amount, phoneNumber: '', referenceId: debitRef, product: 'MOMOWALLETDB', accountId: payload.accountId };
  try {
    const { data } = await apiClient.post<LoadWalletResult>('core/debit', debitBody);
    return data;
  } catch (err: any) {
    // Credit succeeded but debit failed — surface ref so support can reconcile
    throw new ApiError(
      err.response?.status ?? 0,
      `Wallet load incomplete. Your MoMo may have been deducted. Please contact support with reference: ${payload.referenceId}`,
    );
  }
}

function parseTxStatus(entry: TransactionStatusEntry): 'success' | 'failed' | 'pending' {
  // Prefer structured ResponseCode — more reliable than text matching
  if (entry.ResponseCode === '001') return 'success';
  if (entry.ResponseCode === '000') return 'pending';
  if (entry.ResponseCode) return 'failed';
  // Fall back to text matching only when ResponseCode is absent
  const txt = `${entry.transactionStatus ?? ''} ${entry.statusDescription ?? ''} ${entry.Message ?? ''}`.toLowerCase();
  if (txt.includes('successfully') || txt.includes('complet')) return 'success';
  if (txt.includes('pending') || txt.includes('process')) return 'pending';
  if (txt.includes('failed') || txt.includes('could not')) return 'failed';
  return 'pending';
}

export async function apiCheckTransactionStatus(referenceId: string): Promise<TransactionStatusResult> {
  try {
    const { data } = await apiClient.post<{ success: boolean; data: TransactionStatusEntry[] }>(
      'transaction-report/report',
      { referenceId },
    );
    const entry = data.data?.[0];
    if (!entry) return { status: 'pending' };
    return { status: parseTxStatus(entry), entry };
  } catch (err: any) {
    if (err.response?.status === 404) return { status: 'pending' };
    throw new ApiError(err.response?.status ?? 0, 'Failed to check transaction status.');
  }
}

export async function apiSendMoMo(payload: LoadWalletPayload): Promise<LoadWalletResult> {
  const isAsst = !!payload.reselleraccountId;
  const acctFields = isAsst
    ? { reselleraccountId: payload.reselleraccountId, resellerid: payload.resellerid }
    : { accountId: payload.accountId };
  try {
    const { data } = await apiClient.post<LoadWalletResult>('core/credit', {
      amount: payload.amount,
      phoneNumber: payload.phoneNumber,
      referenceId: payload.referenceId,
      product: payload.product,
      ...acctFields,
    });
    return data;
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Transfer failed.');
  }
}

export async function apiLoadWalletMoMo(payload: LoadWalletPayload): Promise<LoadWalletResult> {
  const isAsst = !!payload.reselleraccountId;
  const acctFields = isAsst
    ? { reselleraccountId: payload.reselleraccountId, resellerid: payload.resellerid }
    : { accountId: payload.accountId };
  try {
    const { data } = await apiClient.post<LoadWalletResult>('core/debit', {
      amount: payload.amount,
      phoneNumber: payload.phoneNumber,
      referenceId: payload.referenceId,
      product: payload.product,
      ...acctFields,
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

