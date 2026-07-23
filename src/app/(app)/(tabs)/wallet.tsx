import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionSheet } from "@/components/feedback/TransactionSheet";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { CardChip } from "@/components/svg/CardChip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MOCK_TRANSACTIONS } from "@/mocks/transactions";
import { MOCK_WALLET_CARDS } from "@/mocks/wallets";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";
import type { Transaction } from "@/types";

const WALLET_ACTIONS = [
  { label: "Add Money", icon: "↓", color: Colors.primary,  bg: Colors.primaryLight },
  { label: "Send",     icon: "↑", color: Colors.green,   bg: Colors.greenBg },
  { label: "Withdraw", icon: "⬡", color: Colors.orange,  bg: Colors.orangeBg },
  { label: "Transfer", icon: "⇄", color: Colors.purple,  bg: Colors.purpleBg },
];

export default function WalletScreen() {
  const [activeCard, setActiveCard] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const card = MOCK_WALLET_CARDS[activeCard];
  const totalBalance = MOCK_WALLET_CARDS.reduce((s, w) => s + w.balance, 0);

  return (
    <SafeAreaView style={WS.root} edges={["top"]}>
      <ScrollView style={WS.scroll} contentContainerStyle={WS.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={WS.header}>
          <View>
            <Text style={WS.headerSub}>My Wallets</Text>
            <Text style={WS.headerTitle}>M-PAY Wallet</Text>
          </View>
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show balance" : "Hide balance"}
            style={WS.hideToggle}
          >
            {hidden ? <EyeOff size={13} color={Colors.textMuted} /> : <Eye size={13} color={Colors.textMuted} />}
            <Text style={WS.hideToggleText}>{hidden ? "Show" : "Hide"}</Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        <View style={WS.padSection}>
          <View style={[WS.totalCard, Shadows.subtle, {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
            }]}
          >
            <View>
              <Text style={WS.totalLabel}>Total Balance</Text>
              <Text style={WS.totalAmount}>
                {hidden ? "GHS ••••••" : `GHS ${totalBalance.toFixed(2)}`}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              {[{ color: Colors.primary, label: "eTop-Up" }, { color: Colors.navy, label: "MoMo" }].map((item) => (
                <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                  <Text style={WS.legendLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Card Carousel */}
        <View style={WS.padSection}>
          <LinearGradient
            colors={card.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={WS.walletCard}
          >
            <View
              style={{
                position: "absolute",
                top: -32,
                right: -32,
                width: 150,
                height: 150,
                borderRadius: 75,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    style={{ fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.65)", marginBottom: 4 }}
                  >
                    {card.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      color: "#fff",
                      fontFamily: "Urbanist_800ExtraBold",
                    }}
                  >
                    {hidden ? "••••••" : `GHS ${card.balance.toFixed(2)}`}
                  </Text>
                </View>
                <CardChip />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 24,
                }}
              >
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: 2 }}>
                  {card.number}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "800",
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "Urbanist_800ExtraBold",
                  }}
                >
                  M-PAY
                </Text>
              </View>
            </View>
          </LinearGradient>
          <View style={WS.cardPagination}>
            {MOCK_WALLET_CARDS.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveCard(i)}
                accessibilityRole="radio"
                accessibilityState={{ selected: activeCard === i }}
                style={[WS.cardDot, activeCard === i && WS.cardDotActive]}
              />
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={WS.padSection}>
          <View style={[WS.actionsCard, Shadows.subtle]}>
            {WALLET_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                style={[WS.actionItem, { backgroundColor: a.bg }]}
              >
                <Text style={[WS.actionIcon, { color: a.color }]}>{a.icon}</Text>
                <Text style={WS.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* This Month Spending */}
        <View style={WS.padSection}>
          <Text style={WS.sectionTitle}>This Month</Text>
          <View style={[WS.spendCard, Shadows.subtle]}>
            <View style={WS.spendHeader}>
              <Text style={WS.spendLabel}>Spent</Text>
              <Text style={WS.spendValue}>GHS62.00 / GHS150.00</Text>
            </View>
            <View
              style={{
                width: "100%",
                height: 6,
                borderRadius: 99,
                backgroundColor: "#E0EDF8",
                marginBottom: 20,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={[Colors.gradientStart, Colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: "41%", height: "100%", borderRadius: 99 }}
              />
            </View>
            {[{ label: "Airtime", pct: 56, amount: "GHS12.00", color: Colors.primary },
              { label: "Data Bundle", pct: 79, amount: "GHS30.00", color: Colors.green },
              { label: "Mobile Money", pct: 26, amount: "GHS20.00", color: Colors.orange },
            ].map((cat) => (
              <View key={cat.label} style={WS.catRow}>
                <View style={WS.catHeader}>
                  <Text style={WS.catLabel}>{cat.label}</Text>
                  <Text style={WS.catAmount}>{cat.amount}</Text>
                </View>
                <View style={WS.catBarBg}>
                  <View style={[WS.catBarFill, { width: `${cat.pct}%` as any, backgroundColor: cat.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={WS.padSection}>
          <SectionHeader title="Recent Activity" actionLabel="See all" />
          <View style={[WS.txCard, Shadows.subtle]}>
            {MOCK_TRANSACTIONS.slice(0, 4).map((tx, i, arr) => (
              <View key={tx.id}>
                <TransactionRow transaction={tx} onPress={() => setSelectedTx(tx)} />
                {i < arr.length - 1 && (
                  <View style={WS.txDivider} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {selectedTx && (
        <TransactionSheet transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </SafeAreaView>
  );
}

const WS = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing["3xl"] },
  padSection: { paddingHorizontal: Spacing["2xl"], marginBottom: Spacing.xl },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: Spacing["2xl"], paddingTop: Spacing.xl, paddingBottom: Spacing.md,
  },
  headerSub:  { ...T.caption, fontFamily: "Urbanist_600SemiBold", color: Colors.textMuted },
  headerTitle: { ...T.headingMD, color: Colors.textPrimary, fontFamily: "Urbanist_800ExtraBold" },
  hideToggle: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    ...Shadows.subtle,
  },
  hideToggleText: { ...T.caption, fontFamily: "Urbanist_700Bold", color: Colors.textMuted },

  // Total card
  totalCard: {
    borderRadius: Radius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  totalLabel:  { ...T.caption, fontFamily: "Urbanist_600SemiBold", color: Colors.textMuted, marginBottom: 2 },
  totalAmount: { ...T.headingXL, color: Colors.textPrimary, fontFamily: "Urbanist_800ExtraBold" },
  legendLabel: { ...T.caption, fontFamily: "Urbanist_600SemiBold", color: Colors.textMuted },

  // Wallet card
  walletCard:  { borderRadius: Radius["2xl"], padding: Spacing["2xl"], minHeight: 180, overflow: "hidden" },
  cardPagination: { marginTop: 12, flexDirection: "row", justifyContent: "center", gap: 8 },
  cardDot:     { height: 5, width: 6, borderRadius: Radius.pill, backgroundColor: Colors.pale },
  cardDotActive: { width: 24, backgroundColor: Colors.primary },

  // Actions
  actionsCard: {
    borderRadius: Radius["2xl"], padding: Spacing.lg,
    flexDirection: "row", gap: Spacing.sm,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  actionItem:  { flex: 1, alignItems: "center", gap: 9, borderRadius: Radius.xl, paddingVertical: 18, paddingHorizontal: 8 },
  actionIcon:  { fontSize: 20, fontFamily: "Urbanist_700Bold" },
  actionLabel: { fontSize: 13, fontFamily: "Urbanist_700Bold", color: Colors.textSecondary, textAlign: "center" },

  // This Month
  sectionTitle: { ...T.headingSM, color: Colors.textPrimary, marginBottom: Spacing.md },
  spendCard: {
    borderRadius: Radius.lg, padding: Spacing.xl,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  spendHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.sm },
  spendLabel:  { ...T.bodySM, fontFamily: "Urbanist_600SemiBold", color: Colors.textMuted },
  spendValue:  { ...T.bodySM, fontFamily: "Urbanist_700Bold", color: Colors.textPrimary },
  catRow:    { marginBottom: 12 },
  catHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  catLabel:  { ...T.caption, fontFamily: "Urbanist_600SemiBold", color: Colors.textMuted },
  catAmount: { ...T.caption, fontFamily: "Urbanist_700Bold", color: Colors.textPrimary },
  catBarBg:  { width: "100%", height: 5, borderRadius: Radius.pill, backgroundColor: Colors.divider, overflow: "hidden" },
  catBarFill: { height: "100%", borderRadius: Radius.pill },

  // Transactions
  txCard:    { borderRadius: Radius.xl, overflow: "hidden", backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  txDivider: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.lg },
});
