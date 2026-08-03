import { mockRequest } from './client';
import { TXNS } from '@/data';
import type { TxRecord } from '@/types';

export async function apiGetTransactions(_userId: string): Promise<TxRecord[]> {
  return mockRequest(() => [...TXNS]);
}
