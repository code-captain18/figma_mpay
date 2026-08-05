import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, CheckCircle2, ChevronLeft, Clock, Copy, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, G } from '@/theme';
import type { TxRecord } from '@/types';
import { fmtAgo, fmtDateTime, NETWORKS, USER } from '@/data';
import { formatGHS } from '@/utils/format';

const SVC_LABELS: Record<string, string> = {
  airtime: 'Airtime',
  data: 'Data Bundle',
  fibre: 'Fibre',
  bulk: 'Bulk',
  momo: 'MoMo',
};

const STATUS_COLORS: Record<string, string> = {
  success: C.green,
  pending: C.orange,
  failed: C.red,
};


// ─────────────────────────────────────────────────────────────────────────────
// TxDetail — full transaction detail view
// ─────────────────────────────────────────────────────────────────────────────
export function TxDetail({ tx, onBack }: { tx: TxRecord; onBack: () => void }) {
  const [refCopied, setRefCopied] = useState(false);
  const insets = useSafeAreaInsets();

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
        { label: 'Amount', value: formatGHS(tx.amount), mono: false },
        { label: 'Fee', value: formatGHS(tx.fee), mono: false },
        { label: 'Net Amount', value: formatGHS(tx.amount - tx.fee), mono: false },
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
        style={[det.hdr, { paddingTop: insets.top + 16 }]}
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
            {formatGHS(tx.amount)}
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
  hdr: { flexDirection: 'row', alignItems: 'center', paddingBottom: 16, paddingHorizontal: 20 },
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
