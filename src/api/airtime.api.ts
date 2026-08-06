import { apiClient, ApiError } from './client';

export interface ApiBundle {
  BundleCode: string;
  BundleName: string;
  BundleType: string;
  Amount: number | null;
  Validity: string;
}

export interface ApiProduct {
  prodCode: string;
  network: string;
  Type: string;
  Description: string;
  bundles?: ApiBundle[];
}

export interface AirtimePayload {
  amount: number;
  phoneNumber: string;
  product: string;
  referenceId: string;
  transactionDescription: string;
  reselleraccountId?: string;
  resellerAccountId?: string;
  resellerId?: string;
  resellerid?: string;
}

export interface DataPayload {
  amount: number;
  phoneNumber: string;
  product: string;
  bundleType: string;
  bundleCode: string;
  referenceId: string;
  transactionDescription: string;
  reselleraccountId?: string;
  resellerAccountId?: string;
  resellerId?: string;
  resellerid?: string;
}

export interface TxSubmitResult {
  message: string;
  transactionId: string;
  referenceId: string;
  status: 'SUCCESS' | 'PENDING';
  amount: number;
  phoneNumber: string;
  bundleCode?: string;
}

export async function apiGetResellerProducts(
  isAssistant: boolean,
  accountId?: string,
): Promise<ApiProduct[]> {
  const body = isAssistant && accountId
    ? { reselleraccountId: accountId, resellerAccountId: accountId, resellerId: accountId, resellerid: accountId }
    : {};
  try {
    const { data } = await apiClient.post<{ products: ApiProduct[] }>('reseller-products/v1', body);
    return data.products ?? [];
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: { error?: string; message?: string } } };
    throw new ApiError(e.response?.status ?? 0, e.response?.data?.error ?? e.response?.data?.message ?? 'Failed to fetch products.');
  }
}

export async function apiPurchaseAirtime(payload: AirtimePayload): Promise<TxSubmitResult> {
  try {
    const { data } = await apiClient.post<TxSubmitResult>('web-transaction/airtime', payload);
    return data;
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: { error?: string; message?: string } } };
    throw new ApiError(e.response?.status ?? 0, e.response?.data?.error ?? e.response?.data?.message ?? 'Airtime topup failed.');
  }
}

/** Data and Fibre both use the same endpoint. */
export async function apiPurchaseData(payload: DataPayload): Promise<TxSubmitResult> {
  try {
    const { data } = await apiClient.post<TxSubmitResult>('web-transaction/databundle', payload);
    return data;
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: { error?: string; message?: string } } };
    throw new ApiError(e.response?.status ?? 0, e.response?.data?.error ?? e.response?.data?.message ?? 'Bundle topup failed.');
  }
}

export interface BulkTxItem {
  phoneNumber: string;
  amount: number;
  product: string;
  referenceId: string;
  bundleCode: string;
  bundleType: string;
}

export interface BulkTxResult {
  phoneNumber: string;
  amount: number;
  product: string;
  referenceId: string;
  status: number;
  result: {
    ResponseCode: string;
    message?: string;
    Message?: string;
  };
}

export interface BulkUploadResult {
  transactions: BulkTxResult[];
  successCount: number;
  failedCount: number;
}

export async function apiBulkUpload(transactions: BulkTxItem[]): Promise<BulkUploadResult> {
  try {
    const { data } = await apiClient.post<{ result: { transactions: BulkTxResult[] } }>(
      'bulk/upload',
      { transactions },
    );
    const txResults = data.result?.transactions ?? [];
    const successCount = txResults.filter(
      t => t.status === 201 || t.result?.ResponseCode === '000',
    ).length;
    return { transactions: txResults, successCount, failedCount: txResults.length - successCount };
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: { error?: string; message?: string } } };
    throw new ApiError(e.response?.status ?? 0, e.response?.data?.error ?? e.response?.data?.message ?? 'Bulk upload failed.');
  }
}
