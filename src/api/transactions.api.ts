import type { SvcType, TxRecord } from '@/types';
import { apiClient, ApiError } from './client';

export interface ApiTxRecord {
  requestId: string;
  referenceId: string;
  requestTime: string;
  inputDate: string;
  transactionDate: string;
  ResponseCode: string;
  Message: string;
  transactionStatus: string;
  statusDescription: string;
  phoneNumber: string;
  fromAni: string;
  amount: number;
  sellAmount: number;
  Ccy: string;
  commission: number;
  myCommission: number;
  surcharge: number;
  mySurcharge: number;
  previousBalance: number;
  newBalance: number;
  prodCode: string;
  product: string;
  apiProduct: string;
  network: string;
  sysModule: string;
  transType: string;
  productWallet: string;
  transactionType: string;
  BundleType: string;
  bundleType: string;
  BundleCode: string;
  bundleCode: string;
  walletType: string;
  serviceType: string;
  txReference: string;
  accountName: string;
  reseller: string;
  resellerId: string;
  fromEmail: string;
  transactionDescription: string;
  createdBy: string;
}

export interface TxFilters {
  source: 'recent' | 'history';
  page: number;
  pageSize: number;
  search?: string;
  referenceId?: string;
  phoneNumber?: string;
  product?: string;
  status?: string;  // API codes: '001' success, '000' pending, '007' failed
  dateFrom?: string;
  dateTo?: string;
  bundleType?: string;
  bundleCode?: string;
  amountFrom?: number;
  amountTo?: number;
}

export interface TxPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TxPage {
  data: TxRecord[];
  raw: ApiTxRecord[];
  pagination: TxPagination;
}

function mapStatus(code: string): 'success' | 'pending' | 'failed' {
  if (code === '001') return 'success';
  if (code === '000') return 'pending';
  return 'failed';
}

function mapSysModule(r: ApiTxRecord): SvcType {
  // Prefer prodCode which reliably encodes type (e.g. MTNAIRTIME, MTNDATA, MTNFIBRE)
  const code = (r.prodCode ?? r.product ?? r.apiProduct ?? '').toLowerCase();
  const mod  = (r.sysModule ?? r.serviceType ?? r.transactionType ?? '').toLowerCase();
  const combined = `${code} ${mod}`;
  if (combined.includes('fibre')) return 'fibre';
  if (combined.includes('bulk'))  return 'bulk';
  if (combined.includes('airtime')) return 'airtime';
  if (combined.includes('data'))  return 'data';
  if (combined.includes('money') || combined.includes('momo') || combined.includes('wallet')) return 'momo';
  return 'airtime'; // safer default — airtime is most common; unknown won't mislead as data
}

export function mapApiTxRecord(r: ApiTxRecord): TxRecord {
  return {
    id: r.referenceId || r.requestId || '',
    ref: r.referenceId || r.txReference || '',
    createdAt: r.requestTime || r.inputDate || r.transactionDate || new Date().toISOString(),
    status: mapStatus(r.ResponseCode),
    type: mapSysModule(r),
    network: r.network || r.apiProduct || '',
    phone: r.phoneNumber || r.fromAni || '',
    amount: Number(r.sellAmount ?? r.amount ?? 0) || 0,
    fee: Number(r.commission ?? 0) || 0,
    bundle: r.bundleCode || r.BundleCode || undefined,
    momoType: r.transType === 'CR' ? 'cashin' : undefined,
    accountId: r.resellerId,
  };
}

function buildBody(filters: Omit<TxFilters, 'page' | 'pageSize'>): Record<string, unknown> {
  const b: Record<string, unknown> = { source: filters.source };
  if (filters.search) b.search = filters.search;
  if (filters.referenceId) b.referenceId = filters.referenceId;
  if (filters.phoneNumber) b.phoneNumber = filters.phoneNumber;
  if (filters.product) b.product = filters.product;
  if (filters.status) b.status = filters.status;
  if (filters.dateFrom) b.dateFrom = filters.dateFrom;
  if (filters.dateTo) b.dateTo = filters.dateTo;
  if (filters.bundleType) b.bundleType = filters.bundleType;
  if (filters.bundleCode) b.bundleCode = filters.bundleCode;
  if (filters.amountFrom !== undefined) b.amountFrom = filters.amountFrom;
  if (filters.amountTo !== undefined) b.amountTo = filters.amountTo;
  return b;
}

export async function apiGetTransactions(filters: TxFilters, isAssistant = false): Promise<TxPage> {
  const endpoint = isAssistant
    ? 'assistant-transaction-report/report'
    : 'transaction-report/report';
  try {
    const { data } = await apiClient.post<{
      success: boolean;
      data: ApiTxRecord[];
      pagination: TxPagination;
    }>(endpoint, { ...buildBody(filters), page: filters.page, pageSize: filters.pageSize });
    return {
      data: (data.data ?? []).map(mapApiTxRecord),
      raw: data.data ?? [],
      pagination: data.pagination ?? { page: 1, pageSize: filters.pageSize, total: 0, totalPages: 0 },
    };
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.error ?? 'Failed to fetch transactions.');
  }
}

export async function apiExportTransactions(
  filters: Omit<TxFilters, 'page' | 'pageSize'>,
  isAssistant = false
): Promise<ApiTxRecord[]> {
  const endpoint = isAssistant
    ? 'assistant-transaction-report/report/csv'
    : 'transaction-report/report/csv';
  try {
    const { data } = await apiClient.post<{ success: boolean; data: ApiTxRecord[] }>(
      endpoint, buildBody(filters)
    );
    return data.data ?? [];
  } catch (err: any) {
    throw new ApiError(err.response?.status ?? 0, err.response?.data?.error ?? 'Failed to export transactions.');
  }
}

export const API_CSV_HEADER =
  'Reference Id,Request Time,Status Description,Transaction Type,Phone Number,Currency,Sell Amount,Commission,Surcharge,Balance Before,Balance After,Transaction Date,Service Type,TX Reference,Product,Network,Bundle Type,Bundle Code,Reseller,Reseller Account ID,From Email,Wallet Type,Transaction Description,Created By';

export function buildApiCsvRow(r: ApiTxRecord): string {
  const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [
    q(r.referenceId), q(r.requestTime), q(r.statusDescription || r.transactionStatus),
    q(r.transactionType), q(r.phoneNumber || r.fromAni), q(r.Ccy || 'GHS'),
    q(r.sellAmount), q(r.commission), q(r.surcharge),
    q(r.previousBalance), q(r.newBalance), q(r.transactionDate),
    q(r.serviceType || r.sysModule), q(r.txReference), q(r.product || r.prodCode),
    q(r.network), q(r.bundleType || r.BundleType), q(r.bundleCode || r.BundleCode),
    q(r.reseller), q(r.resellerId), q(r.fromEmail),
    q(r.walletType || r.productWallet), q(r.transactionDescription), q(r.createdBy),
  ].join(',');
}
