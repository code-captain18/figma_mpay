import { useCallback, useMemo, useState } from 'react';
import { TXNS, groupByDate } from '@/data';
import type { FilterState } from '@/types';
import { EMPTY_FILTER } from '@/components/history/FilterSheet';

const PAGE_SIZE = 4;

export function useHistoryFilter() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return TXNS.filter(tx => {
      if (filter.status && tx.status !== filter.status) return false;
      if (filter.svcType && tx.type !== filter.svcType) return false;
      if (filter.phone && !tx.phone.includes(filter.phone)) return false;
      if (filter.ref && !tx.ref.toLowerCase().includes(filter.ref.toLowerCase())) return false;
      if (filter.amtMin && tx.amount < parseFloat(filter.amtMin)) return false;
      if (filter.amtMax && tx.amount > parseFloat(filter.amtMax)) return false;
      if (filter.dateFrom) {
        const from = new Date(filter.dateFrom);
        if (!isNaN(from.getTime()) && new Date(tx.createdAt) < from) return false;
      }
      if (filter.dateTo) {
        const to = new Date(filter.dateTo);
        if (!isNaN(to.getTime()) && new Date(tx.createdAt) > to) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const hit =
          tx.phone.includes(q) ||
          tx.ref.toLowerCase().includes(q) ||
          tx.type.includes(q) ||
          tx.network.includes(q) ||
          tx.status.includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [filter, query]);

  const paged = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const groups = useMemo(() => groupByDate(paged), [paged]);

  const activeFilterCount = useMemo(
    () => Object.values(filter).filter(Boolean).length,
    [filter]
  );

  const stats = useMemo(() => ({
    total: filtered.length,
    success: filtered.filter(t => t.status === 'success').length,
    failed: filtered.filter(t => t.status === 'failed').length,
    amount: filtered.reduce((s, t) => s + t.amount, 0),
  }), [filtered]);

  const resetFilter = useCallback(() => {
    setFilter(EMPTY_FILTER);
    setQuery('');
    setPage(1);
  }, []);

  return {
    query, setQuery,
    filter, setFilter,
    page, setPage,
    filtered, paged, groups,
    activeFilterCount, stats,
    resetFilter,
  };
}
