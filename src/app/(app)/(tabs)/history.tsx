import { ArrowDownLeft, ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionSheet } from "@/components/feedback/TransactionSheet";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { MOCK_TRANSACTIONS } from "@/mocks/transactions";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";
import type { Transaction, TransactionCategory } from "@/types";

function groupByDate(txs: Transaction[]): { date: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const key = tx.date.split(" · ")[0]?.trim() ?? tx.date;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

export default function HistoryScreen() {
  const [filter] = useState<TransactionCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchCat = filter === "all" || tx.category === filter;
      const matchQ =
        query.length === 0 ||
        tx.label.toLowerCase().includes(query.toLowerCase()) ||
        tx.recipient.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [filter, query]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const totalIn = MOCK_TRANSACTIONS.filter((t) => t.amount > 0).reduce(
    (s, t) => s + t.amount,
    0
  );
  const totalOut = MOCK_TRANSACTIONS.filter((t) => t.amount < 0).reduce(
    (s, t) => s + Math.abs(t.amount),
    0
  );

  return (
    <SafeAreaView style={HS.root} edges={["top"]}>
      {/* Header */}
      <View style={HS.headerArea}>
        <Text style={HS.headerEyebrow}>OVERVIEW</Text>
        <Text style={HS.headerTitle}>Transaction History</Text>
        {/* Stats */}
        <View style={HS.statsRow}>
          {[
            { label: "Total In",  amount: totalIn,  color: Colors.success, bg: Colors.successBg, Icon: ArrowDownLeft },
            { label: "Total Out", amount: totalOut, color: Colors.error,   bg: Colors.errorBg,   Icon: ArrowUpRight },
          ].map((stat) => (
            <View key={stat.label} style={[HS.statCard, { backgroundColor: stat.bg }]}>
              <View style={HS.statTop}>
                <Text style={[HS.statLabel, { color: stat.color }]}>{stat.label}</Text>
                <View style={HS.statIconWrap}>
                  <stat.Icon size={15} color={stat.color} />
                </View>
              </View>
              <Text style={[HS.statAmount, { color: stat.color }]}>
                {stat.label === "Total In" ? "+" : "−"}GHS{stat.amount.toFixed(2)}
              </Text>
              <Text style={HS.statPeriod}>This month</Text>
            </View>
          ))}
        </View>
        {/* Search */}
        <View style={[HS.searchBar, Shadows.subtle]}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={HS.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={Colors.textDisabled}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search transactions"
          />
          <View style={HS.searchAction}>
            {query.length > 0 ? (
              <TouchableOpacity
                onPress={() => setQuery("")}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <X size={16} color={Colors.primary} />
              </TouchableOpacity>
            ) : (
              <SlidersHorizontal size={16} color={Colors.primary} />
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={HS.scroll}
        contentContainerStyle={HS.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 ? (
          <View style={HS.emptyState}>
            <Search size={28} color={Colors.textDisabled} />
            <Text style={HS.emptyText}>No transactions found</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.date} style={HS.group}>
              <Text style={HS.groupDate}>{group.date}</Text>
              <View style={[HS.groupCard, Shadows.subtle]}>
                {group.items.map((tx, i, arr) => (
                    <View key={tx.id}>
                    <TransactionRow transaction={tx} onPress={() => setSelectedTx(tx)} />
                    {i < arr.length - 1 && (
                      <View style={HS.txDivider} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {selectedTx && (
        <TransactionSheet transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </SafeAreaView>
  );
}

const HS = StyleSheet.create({
  root:          { flex: 1, backgroundColor: Colors.bg },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing["2xl"] },

  headerArea:    { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  headerEyebrow: { fontSize: 10, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textLight, letterSpacing: 1.5, marginBottom: 6 },
  headerTitle:   { fontSize: 18, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: Colors.textPrimary, marginBottom: Spacing.lg },

  // Stats
  statsRow:     { flexDirection: "row", gap: 14, marginBottom: Spacing.lg },
  statCard:     { flex: 1, borderRadius: Radius["2xl"], padding: Spacing.lg },
  statTop:      { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  statLabel:    { fontSize: 11, fontWeight: "600", fontFamily: "Urbanist_600SemiBold" },
  statIconWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.45)", alignItems: "center", justifyContent: "center" },
  statAmount:   { fontSize: 16, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", marginBottom: 5 },
  statPeriod:   { fontSize: 10, fontFamily: "Urbanist_400Regular", color: Colors.textMuted },

  // Search
  searchBar:    {
    flexDirection: "row", alignItems: "center",
    borderRadius: Radius.xl, paddingHorizontal: Spacing.lg,
    height: 54, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput:  { ...T.bodyMD, flex: 1, color: Colors.textPrimary, marginLeft: Spacing.sm },
  searchAction: {
    marginLeft: Spacing.sm, width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight, alignItems: "center", justifyContent: "center",
  },

  // Groups
  group:     { marginBottom: Spacing.xl },
  groupDate: { fontSize: 12, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textLight, marginBottom: Spacing.sm },
  groupCard: {
    borderRadius: Radius["2xl"], overflow: "hidden",
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  txDivider: { height: 1, backgroundColor: Colors.divider, marginLeft: 80, marginRight: 18 },

  // Empty
  emptyState: { alignItems: "center", gap: 8, paddingTop: 60 },
  emptyText:  { fontSize: 14, fontWeight: "600", fontFamily: "Urbanist_600SemiBold", color: Colors.textLight },
});
