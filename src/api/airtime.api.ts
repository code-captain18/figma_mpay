import { genRef } from '@/utils/ref';
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

export async function apiPurchaseAirtime(payload: AirtimePayload): Promise<PurchaseResult> {
  return mockRequest(() => ({ reference: genRef(), status: 'success' as const }));
}

export async function apiPurchaseData(payload: DataPayload): Promise<PurchaseResult> {
  return mockRequest(() => ({ reference: genRef(), status: 'success' as const }));
}
