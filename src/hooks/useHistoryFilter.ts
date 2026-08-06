import { apiGetTransactions } from '@/api';
import type { TxFilters } from '@/api/transactions.api';
import { EMPTY_FILTER } from '@/components/history/FilterSheet';
import { groupByDate } from '@/data';
import { useAuth } from '@/store/auth.store';
import type { FilterState } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';

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

  // Debounce search/filter changes via React's useDeferredValue
  const deferredQuery = useDeferredValue(query);
  const deferredFilter = useDeferredValue(filter);

  const {
    data,
    isFetching: loading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['transactions', deferredQuery, deferredFilter, source, isAssistant],
    queryFn: ({ pageParam = 1 }) => {
      const filters: TxFilters = {
        source,
        page: pageParam as number,
        pageSize: PAGE_SIZE,
        search: deferredQuery || undefined,
        referenceId: deferredFilter.ref || undefined,
        phoneNumber: deferredFilter.phone || undefined,
        status: deferredFilter.status ? TO_API_STATUS[deferredFilter.status] : undefined,
        dateFrom: deferredFilter.dateFrom || undefined,
        dateTo: deferredFilter.dateTo || undefined,
        amountFrom: deferredFilter.amtMin ? parseFloat(deferredFilter.amtMin) : undefined,
        amountTo: deferredFilter.amtMax ? parseFloat(deferredFilter.amtMax) : undefined,
      };
      return apiGetTransactions(filters, isAssistant);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page: pg, totalPages } = lastPage.pagination;
      return pg < totalPages ? pg + 1 : undefined;
    },
  });

  const allTxRecords = useMemo(
    () => data?.pages.flatMap(p => p.data) ?? [],
    [data],
  );

  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) fetchNextPage();
  }, [loading, hasNextPage, fetchNextPage]);

  const groups = useMemo(() => groupByDate(allTxRecords), [allTxRecords]);

  const activeFilterCount = useMemo(
    () => Object.values(filter).filter(Boolean).length,
    [filter],
  );

  const stats = useMemo(() => {
    const total = data?.pages[data.pages.length - 1]?.pagination.total ?? 0;
    return {
      total,
      success: allTxRecords.filter(t => t.status === 'success').length,
      failed: allTxRecords.filter(t => t.status === 'failed').length,
      amount: allTxRecords.reduce((s, t) => s + t.amount, 0),
    };
  }, [data, allTxRecords]);

  const resetFilter = useCallback(() => {
    setFilter(EMPTY_FILTER);
    setQuery('');
  }, []);

  // txPage-compatible shape for consumers that read pagination
  const txPage = useMemo(() => {
    const lastPage = data?.pages[data.pages.length - 1];
    if (!lastPage) return null;
    return { ...lastPage, data: allTxRecords };
  }, [data, allTxRecords]);

  return {
    query, setQuery,
    filter, setFilter,
    source, setSource,
    loadMore,
    loading,
    txPage,
    groups,
    activeFilterCount, stats,
    resetFilter,
  };
}
