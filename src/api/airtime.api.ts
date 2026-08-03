import { mockRequest } from './client';

export interface AirtimePayload {
  networkId: string;
  phone: string;
  amount: number;
  fee: number;
  total: number;
}

export interface DataPayload {
  networkId: string;
  phone: string;
  bundleId: string;
  bundleLabel: string;
  price: number;
}

export interface PurchaseResult {
  reference: string;
  status: 'success';
}

const genRef = () =>
  'MPY-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') +
  '-' + Math.random().toString(36).slice(2, 7).toUpperCase();

export async function apiPurchaseAirtime(payload: AirtimePayload): Promise<PurchaseResult> {
  return mockRequest(() => ({ reference: genRef(), status: 'success' as const }));
}

export async function apiPurchaseData(payload: DataPayload): Promise<PurchaseResult> {
  return mockRequest(() => ({ reference: genRef(), status: 'success' as const }));
}
