import { FilterSheet, EMPTY_FILTER } from '@/components/history/FilterSheet';
import { TxDetail } from '@/components/history/TxDetail';
import { useHistoryFilter } from '@/hooks/useHistoryFilter';
import { GradHdr } from '@/components/services/GradHdr';
import { useToast } from '@/store/toast.store';
import { DateInput } from '@/components/ui/DateInput';
import {
  CSV_HEADER,
  NETWORKS,
  TXNS,
  USER,
  buildCsvRow,
  fmtAgo,
  fmtDateTime,
  groupByDate,
} from '@/data';
import { C, F, G } from '@/theme';
import { formatGHS } from '@/utils/format';
import type { FilterState, SvcType, TxRecord } from '@/types';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Copy,
  Download,
  Globe,
  Phone,
  Search, SlidersHorizontal,
  Smartphone,
  Users,
  Wifi,
  X,
  XCircle,
} from 'lucide-react-native';
import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 4;

const STATUS_COLORS: Record<string, string> = {
  success: C.green,
  pending: C.orange,
  failed: C.red,
};

const SVC_LABELS: Record<string, string> = {
  airtime: 'Airtime',
  data: 'Data Bundle',
  fibre: 'Fibre',
  bulk: 'Bulk',
  momo: 'MoMo',
};

const SVC_ICON: Record<string, React.ComponentType<any>> = {
  data: Wifi,
  airtime: Phone,
  fibre: Globe,
  bulk: Users,
  momo: Smartphone,
};

const SVC_ICON_COLOR: Record<string, string> = {
  data: '#1878CE',
  airtime: '#4BAEE8',
  fibre: '#7C5CFC',
  bulk: '#E9910A',
  momo: '#0DA870',
};

const SVC_ICON_BG: Record<string, string> = {
  data: 'rgba(24,120,206,0.13)',
  airtime: 'rgba(75,174,232,0.13)',
  fibre: 'rgba(124,92,252,0.13)',
  bulk: 'rgba(233,145,10,0.13)',
  momo: 'rgba(13,168,112,0.13)',
};

function getTxTitle(tx: TxRecord): string {
  const netName = NETWORKS.find(n => n.id === tx.network)?.name ?? tx.network;
  if (tx.type === 'airtime') {
    const amt = tx.amount % 1 === 0 ? tx.amount.toFixed(0) : tx.amount.toFixed(2);
    return `${netName} Airtime`;
  }
  if (tx.bundle) return `${netName} ${tx.bundle}`;
  return `${netName} ${SVC_LABELS[tx.type] ?? tx.type}`;
}

function getTxTag(tx: TxRecord): string | null {
  if (tx.type === 'data' && tx.bundle) {
    const m = tx.bundle.match(/^(\d+[A-Za-z]+)\s+(Daily|Weekly|Monthly)/i);
    if (m) return `${m[2]} \u00B7 DATA_${m[1].toUpperCase()}`;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Memoised transaction row to minimise FlatList re-renders
interface TxRowProps { tx: TxRecord; isLast: boolean; onPress: (tx: TxRecord) => void; }
const TxRow = memo(function TxRow({ tx, isLast, onPress }: TxRowProps) {
  const net = NETWORKS.find(n => n.id === tx.network);
  const statusColor = STATUS_COLORS[tx.status] ?? C.mid;
  const IconComp = SVC_ICON[tx.type] ?? Phone;
  const iconColor = SVC_ICON_COLOR[tx.type] ?? C.blue;
  const iconBg = SVC_ICON_BG[tx.type] ?? 'rgba(24,120,206,0.13)';
  const title = getTxTitle(tx);
  const tag = getTxTag(tx);
  const StatusBadgeIcon = tx.status === 'failed' ? XCircle : CheckCircle2;
  const statusLabel = tx.status === 'success' ? 'Success' : tx.status === 'failed' ? 'Failed' : 'Pending';
  return (
    <TouchableOpacity onPress={() => onPress(tx)} activeOpacity={0.85}
      style={[hs.txRow, !isLast && hs.txRowBorder]}>
      <View style={hs.iconWrap}>
        <View style={[hs.iconCircle, { backgroundColor: iconBg }]}>
          <IconComp size={18} color={iconColor} strokeWidth={1.8} />
        </View>
        <View style={[hs.netDot, { backgroundColor: net?.color ?? C.pale }]}>
          <Text style={hs.netDotLetter}>{tx.network[0]?.toUpperCase() ?? '?'}</Text>
        </View>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={hs.txTitle} numberOfLines={1}>{title}</Text>
        <Text style={hs.txPhone}>{tx.phone}</Text>
        {tag && (<View style={hs.tagPill}><Text style={hs.tagText}>{tag}</Text></View>)}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <Text style={hs.txAmount} allowFontScaling={false}>{formatGHS(tx.amount)}</Text>
        <View style={[hs.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <StatusBadgeIcon size={9} color={statusColor} strokeWidth={2.2} />
          <Text style={[hs.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// Main HistoryScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const toast = useToast();
  const [selected, setSelected] = useState<TxRecord | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const { query, setQuery, filter, setFilter, page, setPage, filtered, paged, groups, activeFilterCount, stats, resetFilter } = useHistoryFilter();

  const exportCsv = useCallback(async () => {
    try {
      const csv = [CSV_HEADER, ...filtered.map(tx => buildCsvRow(tx, USER))].join('\n');
      const path = FileSystem.cacheDirectory + `mpay_txns_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(path, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(path, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Transactions',
        UTI: 'public.comma-separated-values-text',
      });
    } catch {
      toast.show('Could not export transactions. Please try again.', 'error');
    }
  }, [filtered, toast]);

  const handleSelect = useCallback((tx: TxRecord) => setSelected(tx), []);
  const handleBack = useCallback(() => setSelected(null), []);

  if (selected) {
    return <TxDetail tx={selected} onBack={handleBack} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Transactions" />

      <FlatList
        data={groups}
        keyExtractor={(g) => g.label}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: group }) => (
          <View style={hs.groupWrapper}>
            <View style={hs.dateLabelRow}>
              <Calendar size={12} color={C.muted} strokeWidth={2} />
              <Text style={hs.dateLabel}>{group.label}</Text>
              <View style={hs.dateLabelLine} />
              <Text style={hs.dateCount}>{group.items.length} txns</Text>
            </View>
            <View style={hs.txCard}>
              {group.items.map((tx, i) => (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  isLast={i === group.items.length - 1}
                  onPress={handleSelect}
                />
              ))}
            </View>
          </View>
        )}
        ListHeaderComponent={<>
        {/* ── Stats strip ── */}
        <View style={hs.statsStrip}>
          {[
            { label: 'Total', value: `${stats.total}`, color: C.blue },
            { label: 'Success', value: `${stats.success}`, color: C.green },
            { label: 'Failed', value: `${stats.failed}`, color: C.red },
            { label: 'Amount', value: formatGHS(stats.amount), color: C.purple },
          ].map(s => (
            <View key={s.label} style={hs.statCard}>
              <Text style={[hs.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={hs.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Search + filter row ── */}
        <View style={hs.searchRow}>
          <View style={hs.searchBox}>
            <Search size={14} color={C.pale} />
            <TextInput
              value={query}
              onChangeText={v => { setQuery(v); setPage(1); }}
              placeholder="Search phone, ref, network…"
              placeholderTextColor={C.pale}
              style={hs.searchInput}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7}>
                <X size={13} color={C.pale} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setFilterOpen(true)}
            activeOpacity={0.8}
            style={[hs.filterBtn, activeFilterCount > 0 && hs.filterBtnActive]}
          >
            <SlidersHorizontal size={15} color={activeFilterCount > 0 ? C.blue : C.mid} strokeWidth={1.8} />
            {activeFilterCount > 0 && (
              <View style={hs.filterBadge}>
                <Text style={hs.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={exportCsv} style={hs.csvBtn} activeOpacity={0.8}>
            <Download size={13} color={C.mid} />
            <Text style={hs.csvText}>CSV</Text>
          </TouchableOpacity>
        </View>

        {/* ── Active filter chips ── */}
        {activeFilterCount > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={hs.activeChipsRow}
          >
            {(Object.entries(filter) as [keyof FilterState, string][])
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => setFilter({ ...filter, [k]: '' })}
                  style={hs.activeChip}
                  activeOpacity={0.8}
                >
                  <Text style={hs.activeChipText}>{v}</Text>
                  <X size={9} color={C.blue} />
                </TouchableOpacity>
              ))}
            <TouchableOpacity
              onPress={() => setFilter(EMPTY_FILTER)}
              style={hs.clearAllChip}
              activeOpacity={0.8}
            >
              <Text style={hs.clearAllChipText}>Clear all</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── Results count ── */}
        <View style={hs.resultsRow}>
          <Text style={hs.resultsText}>
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            {(query || activeFilterCount > 0) ? ' found' : ''}
          </Text>
        </View>


        </>}
        ListEmptyComponent={
          <View style={hs.listContent}>
            <View style={hs.empty}>
              <View style={hs.emptyIconWrap}>
                <Search size={28} color={C.pale} />
              </View>
              <Text style={hs.emptyTitle}>No transactions found</Text>
              <Text style={hs.emptySub}>Try adjusting your search or clearing filters.</Text>
              {(query || activeFilterCount > 0) && (
                <TouchableOpacity onPress={() => { setQuery(""); setFilter(EMPTY_FILTER); }}
                  style={hs.emptyResetBtn} activeOpacity={0.85}>
                  <Text style={hs.emptyResetText}>Reset Search</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={hs.listContent}>
            {paged.length < filtered.length && (
              <TouchableOpacity onPress={() => setPage(p => p + 1)}
                style={hs.loadMoreBtn} activeOpacity={0.85}>
                <Text style={hs.loadMoreText}>
                  Load more · {filtered.length - paged.length} remaining
                </Text>
              </TouchableOpacity>
            )}
            <View style={{ height: 24 }} />
          </View>
        }
      />
    </View>
  );
}

const hs = StyleSheet.create({
  statsStrip: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  statCard: { flex: 1, backgroundColor: C.white, borderRadius: 13, borderWidth: 1, borderColor: C.border, paddingVertical: 11, alignItems: 'center' },
  statValue: { fontSize: 13, fontFamily: F.extrabold, marginBottom: 1 },
  statLabel: { fontSize: 10, fontFamily: F.medium, color: C.muted },

  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: { flex: 1, height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: F.medium, color: C.navy },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  filterBtnActive: { borderColor: C.blue, backgroundColor: 'rgba(24,120,206,0.06)' },
  filterBadge: { position: 'absolute', top: 6, right: 6, width: 15, height: 15, borderRadius: 8, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { fontSize: 10, fontFamily: F.extrabold, color: '#fff' },
  csvBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 44, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border },
  csvText: { fontSize: 11, fontFamily: F.bold, color: C.mid },

  activeChipsRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6, flexDirection: 'row' },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(24,120,206,0.08)', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(24,120,206,0.18)' },
  activeChipText: { fontSize: 10, fontFamily: F.semibold, color: C.blue, textTransform: 'capitalize' },
  clearAllChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(232,51,74,0.07)', borderWidth: 1, borderColor: 'rgba(232,51,74,0.18)' },
  clearAllChipText: { fontSize: 10, fontFamily: F.semibold, color: C.red },

  resultsRow: { paddingHorizontal: 16, paddingBottom: 6 },
  resultsText: { fontSize: 10, color: C.muted, fontFamily: F.medium },

  listContent: { paddingHorizontal: 16 },

  dateLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  dateLabel: { fontSize: 10, fontFamily: F.semibold, color: C.muted },
  dateLabelLine: { flex: 1, height: 1, backgroundColor: C.divider },
  dateCount: { fontSize: 10, fontFamily: F.medium, color: C.pale },

  txCard: { backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', shadowColor: '#071830', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  txRowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },

  iconWrap: { position: 'relative', width: 44, height: 44, flexShrink: 0 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  netDot: { position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.white },
  netDotLetter: { fontSize: 7, fontFamily: F.extrabold, color: '#fff' },

  txTitle: { fontSize: 13, fontFamily: F.bold, color: C.navy },
  txPhone: { fontSize: 10, color: C.muted, fontFamily: F.medium },
  tagPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(24,120,206,0.07)', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 7, marginTop: 2 },
  tagText: { fontSize: 10, fontFamily: F.semibold, color: C.blue },

  txAmount: { fontSize: 14, fontFamily: F.extrabold, color: C.navy },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 7 },
  statusText: { fontSize: 10, fontFamily: F.bold },

  empty: { alignItems: 'center', paddingVertical: 52 },
  emptyIconWrap: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(24,120,206,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 14, fontFamily: F.bold, color: C.navy, marginBottom: 5 },
  emptySub: { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17, paddingHorizontal: 24, marginBottom: 18 },
  emptyResetBtn: { paddingVertical: 9, paddingHorizontal: 22, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
  emptyResetText: { fontSize: 12, fontFamily: F.semibold, color: C.mid },

  loadMoreBtn: { paddingVertical: 13, borderRadius: 13, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', marginBottom: 8 },
  groupWrapper: { paddingHorizontal: 16, marginBottom: 16 },
  loadMoreText: { fontSize: 12, fontFamily: F.semibold, color: C.mid },
});
