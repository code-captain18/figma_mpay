import { GradHdr } from '@/components/services/GradHdr';
import { GRADIENTS } from '@/constants/services';
import { NETWORKS, fmtAgo } from '@/data';
import { useRecentTransactions } from '@/hooks/useAppQueries';
import { Colors } from '@/theme';
import type { SvcType, TxRecord } from '@/types';
import { formatGHS } from '@/utils/format';
import { Check, ChevronRight, Clock, CreditCard, Globe, Layers, Smartphone, Wifi, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable as RNPressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { F } from './ServiceFormPrimitives';

const C = Colors;
const G = GRADIENTS;

type RecentDisplayItem = {
  label: string; acct: string; time: string; value: string; status: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconBg: string; iconColor: string;
};

const SVC_TILES: {
  id: SvcType;
  label: string;
  sub: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconColor: string;
  iconBg: string;
  grad: typeof G.wallet;
  full: boolean;
}[] = [
    { id: 'airtime', label: 'Airtime Top-Up', sub: 'All networks', Icon: Smartphone, iconColor: C.blue, iconBg: 'rgba(24,120,206,0.1)', grad: G.wallet, full: false },
    { id: 'data', label: 'Data Bundle', sub: 'All networks', Icon: Wifi, iconColor: C.green, iconBg: 'rgba(13,168,112,0.1)', grad: G.green, full: false },
    { id: 'fibre', label: 'Fibre Bundle', sub: 'Home & office', Icon: Globe, iconColor: C.purple, iconBg: 'rgba(124,92,252,0.1)', grad: G.purple, full: false },
    { id: 'bulk', label: 'Bulk Top-Up', sub: 'Multiple numbers', Icon: Layers, iconColor: C.orange, iconBg: 'rgba(233,145,10,0.1)', grad: G.orange, full: false },
    { id: 'momo', label: 'Disburse Cash', sub: 'Deposit to any wallet', Icon: CreditCard, iconColor: C.green, iconBg: 'rgba(13,168,112,0.12)', grad: G.momo, full: true },
  ];

const TX_ICON_MAP: Record<string, { Icon: RecentDisplayItem['Icon']; iconBg: string; iconColor: string }> = {
  airtime: { Icon: Smartphone, iconBg: 'rgba(24,120,206,0.1)', iconColor: C.blue },
  data: { Icon: Wifi, iconBg: 'rgba(13,168,112,0.1)', iconColor: C.green },
  fibre: { Icon: Globe, iconBg: 'rgba(124,92,252,0.1)', iconColor: C.purple },
  bulk: { Icon: Layers, iconBg: 'rgba(233,145,10,0.1)', iconColor: C.orange },
  momo: { Icon: CreditCard, iconBg: 'rgba(13,168,112,0.12)', iconColor: C.green },
};

const SVC_LABELS: Record<string, string> = {
  airtime: 'Airtime', data: 'Data Bundle', fibre: 'Fibre', bulk: 'Bulk', momo: 'MoMo',
};

const STATUS_META: Record<string, { Icon: RecentDisplayItem['Icon']; color: string; badgeBg: string; label: string }> = {
  success: { Icon: Check, color: C.green, badgeBg: 'rgba(13,168,112,0.12)', label: 'Success' },
  pending: { Icon: Clock, color: C.warning, badgeBg: C.warningBg, label: 'Pending' },
  failed: { Icon: X, color: C.red, badgeBg: 'rgba(232,51,74,0.12)', label: 'Failed' },
};

function DetailStatusIcon({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.failed;
  return <m.Icon size={11} color={m.color} strokeWidth={3} />;
}

function toRecentItem(tx: TxRecord): RecentDisplayItem {
  const net = NETWORKS.find(n => n.id === tx.network)?.name ?? tx.network;
  const tile = TX_ICON_MAP[tx.type] ?? TX_ICON_MAP.airtime;
  return {
    label: tx.bundle ? `${net} ${tx.bundle}` : `${net} ${SVC_LABELS[tx.type] ?? tx.type}`,
    acct: tx.phone,
    time: fmtAgo(tx.createdAt),
    value: formatGHS(tx.amount),
    status: tx.status,
    Icon: tile.Icon,
    iconBg: tile.iconBg,
    iconColor: tile.iconColor,
  };
}

export function ServicesHome({ onOpen, momoEnabled = true }: { onOpen: (id: SvcType) => void; momoEnabled?: boolean }) {
  const gridTiles = SVC_TILES.filter(t => !t.full);
  const momoTile = SVC_TILES.find(t => t.full)!;
  const [selectedRecent, setSelectedRecent] = useState<RecentDisplayItem | null>(null);
  const { data: recentPage, isFetching: recentLoading } = useRecentTransactions(5);
  const recentItems = useMemo(() => (recentPage?.data ?? []).map(toRecentItem), [recentPage]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Services" />
      <ScrollView contentContainerStyle={grd.content} showsVerticalScrollIndicator={false}>
        <Text style={grd.sectionTitle}>Quick Actions</Text>
        <View style={grd.grid}>
          {gridTiles.map(tile => (
            <TouchableOpacity
              key={tile.id}
              onPress={() => onOpen(tile.id)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
              style={grd.halfCard}
            >
              <View style={[grd.iconBg, { backgroundColor: tile.iconBg }]}>
                <tile.Icon size={24} color={tile.iconColor} strokeWidth={1.8} />
              </View>
              <Text style={grd.cardLabel}>{tile.label}</Text>
              <Text style={grd.cardSub}>{tile.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {momoEnabled && (
          <TouchableOpacity
            onPress={() => onOpen(momoTile.id)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={momoTile.label}
            style={grd.momoCard}
          >
            <View style={[grd.iconBg, { backgroundColor: momoTile.iconBg }]}>
              <momoTile.Icon size={24} color={momoTile.iconColor} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={grd.cardLabel}>{momoTile.label}</Text>
              <Text style={grd.cardSub}>{momoTile.sub}</Text>
            </View>
            <ChevronRight size={16} color={C.pale} />
          </TouchableOpacity>
        )}

        <Text style={[grd.sectionTitle, { marginTop: 24 }]}>Recent Activity</Text>
        {recentLoading && !recentItems.length ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={C.blue} />
          </View>
        ) : recentItems.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: C.muted, fontFamily: F.medium }}>No recent transactions</Text>
          </View>
        ) : (
          <View style={grd.recentCard}>
            {recentItems.map((item, i) => {
              const statusMeta = STATUS_META[item.status] ?? STATUS_META.failed;
              return (
                <View key={i}>
                  <TouchableOpacity
                    onPress={() => setSelectedRecent(item)}
                    activeOpacity={0.75}
                    style={grd.recentRow}
                  >
                    <View style={[grd.recentIcon, { backgroundColor: item.iconBg }]}>
                      <item.Icon size={16} color={item.iconColor} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={grd.recentLabel}>{item.label}</Text>
                      <Text style={grd.recentSub}>{item.acct} · {item.time}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={grd.recentAmount}>{item.value}</Text>
                      <View style={grd.statusBadge}>
                        <statusMeta.Icon size={9} color={statusMeta.color} strokeWidth={3} />
                        <Text style={[grd.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  {i < recentItems.length - 1 && <View style={grd.recentDivider} />}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {selectedRecent && (
        <Modal transparent animationType="slide" onRequestClose={() => setSelectedRecent(null)}>
          <RNPressable
            style={{ flex: 1, backgroundColor: 'rgba(7,24,48,0.5)', justifyContent: 'flex-end' }}
            onPress={() => setSelectedRecent(null)}
          >
            <RNPressable onPress={e => e.stopPropagation()}>
              <View style={grd.dtSheet}>
                <View style={grd.dtHandle} />
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={[grd.dtIconWrap, { backgroundColor: selectedRecent.iconBg }]}>
                    <selectedRecent.Icon size={26} color={selectedRecent.iconColor} strokeWidth={1.8} />
                  </View>
                  <Text style={grd.dtAmt}>{selectedRecent.value}</Text>
                  <Text style={grd.dtName}>{selectedRecent.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                  <View style={[grd.dtBadge, { backgroundColor: (STATUS_META[selectedRecent.status] ?? STATUS_META.failed).badgeBg }]}>
                    <DetailStatusIcon status={selectedRecent.status} />
                    <Text style={[grd.dtBadgeText, { color: (STATUS_META[selectedRecent.status] ?? STATUS_META.failed).color }]}>
                      {(STATUS_META[selectedRecent.status] ?? STATUS_META.failed).label}
                    </Text>
                  </View>
                </View>
                <View style={grd.dtRows}>
                  <View style={grd.dtRow}>
                    <Text style={grd.dtRowLbl}>Account</Text>
                    <Text style={grd.dtRowVal}>{selectedRecent.acct}</Text>
                  </View>
                  <View style={[grd.dtRow, { borderBottomWidth: 0 }]}>
                    <Text style={grd.dtRowLbl}>Time</Text>
                    <Text style={grd.dtRowVal}>{selectedRecent.time}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedRecent(null)} style={grd.dtCloseBtn} activeOpacity={0.85}>
                  <Text style={grd.dtCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </RNPressable>
          </RNPressable>
        </Modal>
      )}
    </View>
  );
}

const grd = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  sectionTitle: { fontSize: 13, fontFamily: F.extrabold, color: C.navy, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  halfCard: { width: '47.4%', backgroundColor: C.white, borderRadius: 18, padding: 18, alignItems: 'center', shadowColor: '#071830', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  iconBg: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardLabel: { fontSize: 13, fontFamily: F.bold, color: C.navy, marginBottom: 3, textAlign: 'center' },
  cardSub: { fontSize: 11, fontFamily: F.medium, color: C.muted, textAlign: 'center' },
  momoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 18, padding: 16, shadowColor: '#071830', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  recentCard: { backgroundColor: C.white, borderRadius: 18, shadowColor: '#071830', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3, overflow: 'hidden' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  recentDivider: { height: 1, backgroundColor: C.divider, marginHorizontal: 14 },
  recentIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  recentLabel: { fontSize: 13, fontFamily: F.bold, color: C.navy, marginBottom: 2 },
  recentSub: { fontSize: 11, fontFamily: F.medium, color: C.muted },
  recentAmount: { fontSize: 13, fontFamily: F.extrabold, color: C.navy, marginBottom: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statusText: { fontSize: 11, fontFamily: F.semibold },
  dtSheet: { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44 },
  dtHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.pale, alignSelf: 'center', marginBottom: 20 },
  dtIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  dtAmt: { fontSize: 26, fontFamily: F.extrabold, color: C.navy, letterSpacing: -0.5 },
  dtName: { fontSize: 13, fontFamily: F.semibold, color: C.mid, marginTop: 4 },
  dtBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 16, borderRadius: 99 },
  dtBadgeText: { fontSize: 12, fontFamily: F.semibold },
  dtRows: { backgroundColor: C.bg, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  dtRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.divider },
  dtRowLbl: { fontSize: 11, fontFamily: F.medium, color: C.muted },
  dtRowVal: { fontSize: 13, fontFamily: F.bold, color: C.navy },
  dtCloseBtn: { backgroundColor: C.bg, borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  dtCloseText: { fontSize: 14, fontFamily: F.bold, color: C.mid },
});
