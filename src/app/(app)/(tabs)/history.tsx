import { GradHdr } from '@/components/services/GradHdr';
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
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FILTER: FilterState = {
  status: '',
  svcType: '',
  phone: '',
  ref: '',
  dateFrom: '',
  dateTo: '',
  amtMin: '',
  amtMax: '',
};

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
    return `${netName} Airtime GH\u20B5${amt}`;
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
// TxDetail — full transaction detail view
// ─────────────────────────────────────────────────────────────────────────────
function TxDetail({ tx, onBack }: { tx: TxRecord; onBack: () => void }) {
  const [refCopied, setRefCopied] = useState(false);

  const handleCopyRef = async () => {
    await Clipboard.setStringAsync(tx.ref);
    setRefCopied(true);
    setTimeout(() => setRefCopied(false), 2000);
  };
  const net = NETWORKS.find(n => n.id === tx.network);
  const statusColor = STATUS_COLORS[tx.status] ?? C.mid;
  const isSuccess = tx.status === 'success';
  const isPending = tx.status === 'pending';

  const StatusIcon = isSuccess
    ? () => <CheckCircle2 size={34} color={statusColor} strokeWidth={1.8} />
    : isPending
      ? () => <Clock size={34} color={statusColor} strokeWidth={1.8} />
      : () => <XCircle size={34} color={statusColor} strokeWidth={1.8} />;

  function DetailRow({
    label, value, mono = false,
  }: { label: string; value: string; mono?: boolean }) {
    return (
      <View style={det.row}>
        <Text style={det.rowLabel}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
          <Text
            style={[det.rowValue, mono && det.rowValueMono]}
            numberOfLines={1}
            adjustsFontSizeToFit={mono}
          >
            {value}
          </Text>
          {mono && (
            <TouchableOpacity
              onPress={() => Clipboard.setStringAsync(value)}
              style={det.copyBtn}
              activeOpacity={0.7}
            >
              <Copy size={10} color={C.blue} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const sections = [
    {
      title: 'Transaction',
      rows: [
        { label: 'Reference', value: tx.ref, mono: true },
        { label: 'Date & Time', value: fmtDateTime(tx.createdAt), mono: false },
        { label: 'Status', value: tx.status, mono: false },
      ],
    },
    {
      title: 'Product',
      rows: [
        { label: 'Service Type', value: SVC_LABELS[tx.type] ?? tx.type, mono: false },
        ...(tx.bundle ? [{ label: 'Bundle', value: tx.bundle, mono: false }] : []),
        ...(tx.momoType ? [{ label: 'MoMo Type', value: tx.momoType, mono: false }] : []),
        { label: 'Network', value: tx.network, mono: false },
      ],
    },
    {
      title: 'Financial',
      rows: [
        { label: 'Amount', value: `GH₵ ${tx.amount.toFixed(2)}`, mono: false },
        { label: 'Fee', value: `GH₵ ${tx.fee.toFixed(2)}`, mono: false },
        { label: 'Net Amount', value: `GH₵ ${(tx.amount - tx.fee).toFixed(2)}`, mono: false },
      ],
    },
    {
      title: 'Account',
      rows: [
        { label: 'Phone', value: tx.phone, mono: false },
        ...(tx.accountId ? [{ label: 'Account ID', value: tx.accountId, mono: true }] : []),
        { label: 'Agent ID', value: USER.accountId, mono: true },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Custom header — no GradHdr so we can keep it tight */}
      <LinearGradient
        colors={G.header.colors}
        start={G.header.start}
        end={G.header.end}
        style={det.hdr}
      >
        <TouchableOpacity onPress={onBack} style={det.backBtn} activeOpacity={0.8}>
          <ChevronLeft size={17} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={det.hdrTitle}>Transaction Detail</Text>
        <View style={{ width: 32 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={det.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Status hero ── */}
        <View style={[
          det.statusHero,
          {
            borderColor: statusColor + '44',
            backgroundColor: statusColor + '0D',
          },
        ]}>
          <StatusIcon />
          <Text style={[det.statusLabel, { color: statusColor }]}>
            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
          </Text>
          <Text style={[det.statusAmount, { color: statusColor }]}>
            GH₵ {tx.amount.toFixed(2)}
          </Text>
          <Text style={det.statusTime}>{fmtAgo(tx.createdAt)}</Text>

          {/* Network badge */}
          {net && (
            <View style={[
              det.netBadge,
              {
                backgroundColor: net.color + '22',
                borderColor: net.color + '66',
              },
            ]}>
              <View style={[det.netDotLarge, { backgroundColor: net.color }]} />
              <Text style={[det.netBadgeText, { color: net.color }]}>
                {net.name}
              </Text>
            </View>
          )}
        </View>

        {/* ── Detail sections ── */}
        {sections.map(sec => (
          <View key={sec.title} style={det.section}>
            <View style={det.sectionHeader}>
              <Text style={det.sectionTitle}>{sec.title.toUpperCase()}</Text>
            </View>
            {sec.rows.map((r, i) => (
              <View key={r.label}>
                <DetailRow label={r.label} value={r.value} mono={r.mono} />
                {i < sec.rows.length - 1 && (
                  <View style={det.rowDivider} />
                )}
              </View>
            ))}
          </View>
        ))}

        {/* ── Reference copy card ── */}
        <View style={det.refCard}>
          <Text style={det.refCardLabel}>TRANSACTION REFERENCE</Text>
          <Text style={det.refCardValue}>{tx.ref}</Text>
          <TouchableOpacity
            onPress={handleCopyRef}
            style={det.refCopyBtn}
            activeOpacity={0.85}
          >
            <Copy size={12} color={refCopied ? C.green : C.blue} />
            <Text style={[det.refCopyText, refCopied && { color: C.green }]}>
              {refCopied ? 'Copied!' : 'Copy Reference'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const det = StyleSheet.create({
  hdr: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  hdrTitle: { flex: 1, fontSize: 15, fontFamily: F.extrabold, color: '#fff', textAlign: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  statusHero: { borderRadius: 20, borderWidth: 1.5, padding: 24, alignItems: 'center', marginBottom: 16, gap: 4 },
  statusLabel: { fontSize: 13, fontFamily: F.bold, textTransform: 'capitalize', marginTop: 6 },
  statusAmount: { fontSize: 26, fontFamily: F.black },
  statusTime: { fontSize: 10, color: C.muted, marginTop: 2 },
  netBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 99, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1.5, marginTop: 10 },
  netDotLarge: { width: 7, height: 7, borderRadius: 4 },
  netBadgeText: { fontSize: 11, fontFamily: F.bold },
  section: { backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 12 },
  sectionHeader: { backgroundColor: C.bg, paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.divider },
  sectionTitle: { fontSize: 11, fontFamily: F.semibold, color: C.navy, letterSpacing: 0.6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11 },
  rowLabel: { fontSize: 11, color: C.muted, fontFamily: F.medium },
  rowValue: { fontSize: 12, color: C.navy, fontFamily: F.semibold, textAlign: 'right' },
  rowValueMono: { fontFamily: F.black, letterSpacing: 0.5, fontSize: 11 },
  rowDivider: { marginLeft: 14, height: 1, backgroundColor: C.divider },
  copyBtn: { width: 22, height: 22, borderRadius: 7, backgroundColor: 'rgba(24,120,206,0.1)', alignItems: 'center', justifyContent: 'center' },
  refCard: { backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, alignItems: 'center', gap: 4 },
  refCardLabel: { fontSize: 11, fontFamily: F.semibold, color: C.muted, letterSpacing: 0.6 },
  refCardValue: { fontSize: 14, fontFamily: F.black, color: C.navy, letterSpacing: 1.5 },
  refCopyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: 'rgba(24,120,206,0.07)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(24,120,206,0.15)' },
  refCopyText: { fontSize: 11, fontFamily: F.semibold, color: C.blue },
});

// ─────────────────────────────────────────────────────────────────────────────
// FilterSheet — bottom sheet modal
// ─────────────────────────────────────────────────────────────────────────────
function FilterSheet({
  filter,
  setFilter,
  onApply,
  onClose,
}: {
  filter: FilterState;
  setFilter: (f: FilterState) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<FilterState>(filter);

  const set = (k: keyof FilterState, v: string) =>
    setLocal(p => ({ ...p, [k]: v }));

  const Chip = ({
    label, field, value,
  }: { label: string; field: keyof FilterState; value: string }) => {
    const active = local[field] === value;
    return (
      <TouchableOpacity
        onPress={() => set(field, active ? '' : value)}
        activeOpacity={0.8}
        style={[fs.chip, active && fs.chipActive]}
      >
        <Text style={[fs.chipText, active && fs.chipTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const fullFields: { label: string; field: keyof FilterState; kbd: import('react-native').KeyboardTypeOptions; ph: string }[] = [
    { label: 'PHONE NUMBER', field: 'phone', kbd: 'phone-pad', ph: 'e.g. 233244123456' },
    { label: 'REFERENCE ID', field: 'ref', kbd: 'default', ph: 'e.g. WB17220912234567890' },
  ];

  const pairedFields: { label: string; field: keyof FilterState; kbd: import('react-native').KeyboardTypeOptions; ph: string; icon?: true }[][] = [
    [
      { label: 'DATE FROM', field: 'dateFrom', kbd: 'default', ph: 'mm/dd/yyyy', icon: true },
      { label: 'DATE TO', field: 'dateTo', kbd: 'default', ph: 'mm/dd/yyyy', icon: true },
    ],
    [
      { label: 'MIN AMOUNT', field: 'amtMin', kbd: 'decimal-pad', ph: '0.00' },
      { label: 'MAX AMOUNT', field: 'amtMax', kbd: 'decimal-pad', ph: '0.00' },
    ],
  ];

  return (
    <>
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.overlay, zIndex: 100 }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={fs.sheet}>
        <View style={fs.dragHandle} />
        <View style={fs.sheetHeader}>
          <Text style={fs.sheetTitle}>Filter Transactions</Text>
          <TouchableOpacity onPress={onClose} style={fs.closeBtn} activeOpacity={0.8}>
            <X size={16} color={C.mid} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={fs.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={fs.groupLabel}>STATUS</Text>
          <View style={fs.chips}>
            {[
              { label: 'Success', value: 'success' },
              { label: 'Failed', value: 'failed' },
            ].map(({ label, value }) => (
              <Chip key={value} label={label} field="status" value={value} />
            ))}
          </View>

          <Text style={fs.groupLabel}>SERVICE TYPE</Text>
          <View style={fs.chips}>
            {(['airtime', 'data', 'fibre', 'bulk', 'momo'] as SvcType[]).map(t => (
              <Chip key={t} label={SVC_LABELS[t]} field="svcType" value={t} />
            ))}
          </View>

          {/* Full-width fields */}
          {fullFields.map(f => (
            <View key={f.field} style={{ marginBottom: 12 }}>
              <Text style={fs.groupLabel}>{f.label}</Text>
              <TextInput
                value={local[f.field]}
                onChangeText={v => set(f.field, v)}
                keyboardType={f.kbd}
                placeholder={f.ph}
                placeholderTextColor={C.pale}
                style={fs.input}
              />
            </View>
          ))}

          {/* Paired fields (side by side) */}
          {pairedFields.map((pair, gi) => (
            <View key={gi} style={{ flexDirection: 'row', gap: 10 }}>
              {pair.map(f => (
                <View key={f.field} style={{ flex: 1, marginBottom: 12 }}>
                  <Text style={fs.groupLabel}>{f.label}</Text>
                  {'icon' in f && f.icon ? (
                    <View style={fs.inputRow}>
                      <TextInput
                        value={local[f.field]}
                        onChangeText={v => set(f.field, v)}
                        keyboardType={f.kbd}
                        placeholder={f.ph}
                        placeholderTextColor={C.pale}
                        style={fs.inputInner}
                      />
                      <Calendar size={14} color={C.pale} />
                    </View>
                  ) : (
                    <TextInput
                      value={local[f.field]}
                      onChangeText={v => set(f.field, v)}
                      keyboardType={f.kbd}
                      placeholder={f.ph}
                      placeholderTextColor={C.pale}
                      style={fs.input}
                    />
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={fs.footer}>
          <TouchableOpacity
            onPress={() => {
              setLocal(EMPTY_FILTER);
              setFilter(EMPTY_FILTER);
            }}
            style={fs.clearBtn}
            activeOpacity={0.8}
          >
            <Text style={fs.clearText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setFilter(local); onApply(); onClose(); }}
            activeOpacity={0.85}
            style={fs.applyBtn}
          >
            <LinearGradient
              colors={G.wallet.colors}
              start={G.wallet.start}
              end={G.wallet.end}
              style={fs.applyGrad}
            >
              <Text style={fs.applyText}>Apply Filters</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const fs = StyleSheet.create({
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 101, backgroundColor: C.white, borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '82%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.divider },
  sheetTitle: { fontSize: 15, fontFamily: F.extrabold, color: C.navy },
  closeBtn: { width: 30, height: 30, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  sheetContent: { padding: 20, paddingTop: 14, paddingBottom: 8 },
  groupLabel: { fontSize: 11, fontFamily: F.semibold, color: C.mid, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 16 },
  chip: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  chipActive: { borderColor: C.blue, backgroundColor: 'rgba(24,120,206,0.08)' },
  chipText: { fontSize: 11, fontFamily: F.medium, color: C.muted, textTransform: 'capitalize' },
  chipTextActive: { color: C.blue, fontFamily: F.bold },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 10, fontSize: 13, fontFamily: F.medium, color: C.navy, backgroundColor: C.bg },
  inputRow: { borderWidth: 1.5, borderColor: C.border, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bg },
  inputInner: { flex: 1, fontSize: 13, fontFamily: F.medium, color: C.navy, padding: 0 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.divider, alignSelf: 'center', marginTop: 10, marginBottom: 2 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.divider },
  clearBtn: { flex: 1, paddingVertical: 13, borderRadius: 13, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 13, fontFamily: F.bold, color: C.muted },
  applyBtn: { flex: 2, borderRadius: 13, overflow: 'hidden' },
  applyGrad: { paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  applyText: { fontSize: 14, fontFamily: F.extrabold, color: '#fff' },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main HistoryScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function HistoryScreen() {
  const [selected, setSelected] = useState<TxRecord | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return TXNS.filter(tx => {
      if (filter.status && tx.status !== filter.status) return false;
      if (filter.svcType && tx.type !== filter.svcType) return false;
      if (filter.phone && !tx.phone.includes(filter.phone)) return false;
      if (filter.ref && !tx.ref.toLowerCase().includes(filter.ref.toLowerCase())) return false;
      if (filter.amtMin && tx.amount < parseFloat(filter.amtMin)) return false;
      if (filter.amtMax && tx.amount > parseFloat(filter.amtMax)) return false;
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

  const activeFilterCount = Object.values(filter).filter(Boolean).length;
  const paged = filtered.slice(0, page * PAGE_SIZE);
  const groups = groupByDate(paged);

  const stats = useMemo(() => ({
    total: filtered.length,
    success: filtered.filter(t => t.status === 'success').length,
    failed: filtered.filter(t => t.status === 'failed').length,
    amount: filtered.reduce((s, t) => s + t.amount, 0),
  }), [filtered]);

  const exportCsv = async () => {
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
      Alert.alert('Export Failed', 'Could not export transactions. Please try again.');
    }
  };

  if (selected) {
    return <TxDetail tx={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Transactions" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Stats strip ── */}
        <View style={hs.statsStrip}>
          {[
            { label: 'Total', value: `${stats.total}`, color: C.blue },
            { label: 'Success', value: `${stats.success}`, color: C.green },
            { label: 'Failed', value: `${stats.failed}`, color: C.red },
            { label: 'Amount', value: `GH\u20B5${stats.amount.toFixed(0)}`, color: C.purple },
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

        {/* ── Transaction groups ── */}
        <View style={hs.listContent}>
          {groups.length === 0 ? (
            <View style={hs.empty}>
              <View style={hs.emptyIconWrap}>
                <Search size={28} color={C.pale} />
              </View>
              <Text style={hs.emptyTitle}>No transactions found</Text>
              <Text style={hs.emptySub}>
                Try adjusting your search or clearing filters.
              </Text>
              {(query || activeFilterCount > 0) && (
                <TouchableOpacity
                  onPress={() => { setQuery(''); setFilter(EMPTY_FILTER); }}
                  style={hs.emptyResetBtn}
                  activeOpacity={0.85}
                >
                  <Text style={hs.emptyResetText}>Reset Search</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            groups.map(group => (
              <View key={group.label} style={{ marginBottom: 16 }}>
                <View style={hs.dateLabelRow}>
                  <Calendar size={12} color={C.muted} strokeWidth={2} />
                  <Text style={hs.dateLabel}>{group.label}</Text>
                  <View style={hs.dateLabelLine} />
                  <Text style={hs.dateCount}>{group.items.length} txns</Text>
                </View>

                <View style={hs.txCard}>
                  {group.items.map((tx, i) => {
                    const net = NETWORKS.find(n => n.id === tx.network);
                    const statusColor = STATUS_COLORS[tx.status] ?? C.mid;
                    const isLast = i === group.items.length - 1;
                    const IconComp = SVC_ICON[tx.type] ?? Phone;
                    const iconColor = SVC_ICON_COLOR[tx.type] ?? C.blue;
                    const iconBg = SVC_ICON_BG[tx.type] ?? 'rgba(24,120,206,0.13)';
                    const title = getTxTitle(tx);
                    const tag = getTxTag(tx);
                    const StatusBadgeIcon = tx.status === 'failed' ? XCircle : CheckCircle2;
                    const statusLabel = tx.status === 'success' ? 'Success'
                      : tx.status === 'failed' ? 'Failed'
                        : 'Pending';

                    return (
                      <TouchableOpacity
                        key={tx.id}
                        onPress={() => setSelected(tx)}
                        activeOpacity={0.85}
                        style={[hs.txRow, !isLast && hs.txRowBorder]}
                      >
                        {/* Service icon + network badge */}
                        <View style={hs.iconWrap}>
                          <View style={[hs.iconCircle, { backgroundColor: iconBg }]}>
                            <IconComp size={18} color={iconColor} strokeWidth={1.8} />
                          </View>
                          <View style={[hs.netDot, { backgroundColor: net?.color ?? C.pale }]}>
                            <Text style={hs.netDotLetter}>
                              {tx.network[0]?.toUpperCase() ?? '?'}
                            </Text>
                          </View>
                        </View>

                        {/* Info */}
                        <View style={{ flex: 1, gap: 1 }}>
                          <Text style={hs.txTitle} numberOfLines={1}>{title}</Text>
                          <Text style={hs.txPhone}>{tx.phone}</Text>
                          {tag && (
                            <View style={hs.tagPill}>
                              <Text style={hs.tagText}>{tag}</Text>
                            </View>
                          )}
                        </View>

                        {/* Amount + status */}
                        <View style={{ alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                          <Text style={hs.txAmount}>GH\u20B5{tx.amount.toFixed(2)}</Text>
                          <View style={[hs.statusBadge, { backgroundColor: statusColor + '15' }]}>
                            <StatusBadgeIcon size={9} color={statusColor} strokeWidth={2.2} />
                            <Text style={[hs.statusText, { color: statusColor }]}>
                              {statusLabel}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}

          {paged.length < filtered.length && (
            <TouchableOpacity
              onPress={() => setPage(p => p + 1)}
              style={hs.loadMoreBtn}
              activeOpacity={0.85}
            >
              <Text style={hs.loadMoreText}>
                Load more · {filtered.length - paged.length} remaining
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      {filterOpen && (
        <FilterSheet
          filter={filter}
          setFilter={f => { setFilter(f); setPage(1); }}
          onApply={() => setPage(1)}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
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
  loadMoreText: { fontSize: 12, fontFamily: F.semibold, color: C.mid },
});
