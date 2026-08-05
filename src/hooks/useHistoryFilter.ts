import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/store/auth.store';
import { apiGetTransactions } from '@/api';
import type { TxFilters, TxPage } from '@/api/transactions.api';
import type { FilterState } from '@/types';
import { EMPTY_FILTER } from '@/components/history/FilterSheet';
import { groupByDate } from '@/data';

const PAGE_SIZE = 20;

const TO_API_STATUS: Record<string, string> = {
  success: '001',
  pending: '000',
  failed: '007',
};

export function useHistoryFilter() {
  const { user } = useAuth();
  const isAssistant = user?.accountType?.toLowerCase() === 'assistant';

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [source, setSource] = useState<'recent' | 'history'>('recent');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [txPage, setTxPage] = useState<TxPage | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPage = useCallback(async (
    q: string, f: FilterState, src: 'recent' | 'history', pg: number
  ) => {
    setLoading(true);
    try {
      const filters: TxFilters = {
        source: src,
        page: pg,
        pageSize: PAGE_SIZE,
        search: q || undefined,
        referenceId: f.ref || undefined,
        phoneNumber: f.phone || undefined,
        status: f.status ? TO_API_STATUS[f.status] : undefined,
        dateFrom: f.dateFrom || undefined,
        dateTo: f.dateTo || undefined,
        amountFrom: f.amtMin ? parseFloat(f.amtMin) : undefined,
        amountTo: f.amtMax ? parseFloat(f.amtMax) : undefined,
      };
      const result = await apiGetTransactions(filters, isAssistant);
      setTxPage(prev =>
        pg === 1
          ? result
          : prev
            ? { ...result, data: [...prev.data, ...result.data], raw: [...prev.raw, ...result.raw] }
            : result
      );
    } catch { /* keep existing data on error */ } finally {
      setLoading(false);
    }
  }, [isAssistant]);

  // Debounce filter/query/source changes; always reset to page 1
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPage(query, filter, source, 1);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, filter, source, fetchPage]);

  // Load additional pages — only fires when page increments above 1 via loadMore
  useEffect(() => {
    if (page > 1) fetchPage(query, filter, source, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // intentionally narrow: only react to explicit loadMore calls

  const loadMore = useCallback(() => {
    const total = txPage?.pagination.totalPages ?? 0;
    if (!loading && page < total) setPage(p => p + 1);
  }, [loading, page, txPage]);

  const groups = useMemo(() => groupByDate(txPage?.data ?? []), [txPage]);

  const activeFilterCount = useMemo(
    () => Object.values(filter).filter(Boolean).length,
    [filter]
  );

  const stats = useMemo(() => {
    const items = txPage?.data ?? [];
    return {
      total: txPage?.pagination.total ?? 0,
      success: items.filter(t => t.status === 'success').length,
      failed: items.filter(t => t.status === 'failed').length,
      amount: items.reduce((s, t) => s + t.amount, 0),
    };
  }, [txPage]);

  const resetFilter = useCallback(() => {
    setFilter(EMPTY_FILTER);
    setQuery('');
    setPage(1);
  }, []);

  return {
    query, setQuery,
    filter, setFilter,
    source, setSource,
    page, loadMore,
    loading,
    txPage,
    groups,
    activeFilterCount, stats,
    resetFilter,
  };
}
