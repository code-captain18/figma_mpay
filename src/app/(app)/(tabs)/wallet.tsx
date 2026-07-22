import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionSheet } from "@/components/feedback/TransactionSheet";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { CardChip } from "@/components/svg/CardChip";
import { MOCK_TRANSACTIONS } from "@/mocks/transactions";
import { MOCK_WALLET_CARDS } from "@/mocks/wallets";
import { Colors } from "@/theme/colors";
import { shadowStyle } from "@/theme/shadows";
import type { Transaction } from "@/types";

const WALLET_ACTIONS = [
  { label: "Add Money", icon: "↓", color: Colors.blue, bg: "rgba(24,120,206,0.1)" },
  { label: "Send", icon: "↑", color: Colors.green, bg: "rgba(13,168,112,0.1)" },
  { label: "Withdraw", icon: "⬡", color: Colors.orange, bg: "rgba(233,145,10,0.1)" },
  { label: "Transfer", icon: "⇄", color: Colors.purple, bg: "rgba(124,92,252,0.1)" },
];

export default function WalletScreen() {
  const [activeCard, setActiveCard] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const card = MOCK_WALLET_CARDS[activeCard];
  const totalBalance = MOCK_WALLET_CARDS.reduce((s, w) => s + w.balance, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingBottom: 12, paddingTop: 20 }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.muted }}>My Wallets</Text>
            <Text
              style={{ fontSize: 18, fontWeight: "800", color: Colors.navy, fontFamily: "Urbanist_800ExtraBold" }}
            >
              M-PAY Wallet
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show balance" : "Hide balance"}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderRadius: 99,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: Colors.border,
              ...shadowStyle(),
            }}
          >
            {hidden ? <EyeOff size={13} color={Colors.muted} /> : <Eye size={13} color={Colors.muted} />}
            <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.muted }}>
              {hidden ? "Show" : "Hide"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <View
            style={{
              borderRadius: 16,
              paddingHorizontal: 20,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: "rgba(24,120,206,0.08)",
              ...shadowStyle(0.04, 10),
            }}
          >
            <View>
              <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.muted, marginBottom: 2 }}>
                Total Balance
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: Colors.navy,
                  fontFamily: "Urbanist_800ExtraBold",
                }}
              >
                {hidden ? "GHS ••••••" : `GHS ${totalBalance.toFixed(2)}`}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              {[{ color: Colors.blue, label: "eTop-Up" }, { color: Colors.deep, label: "MoMo" }].map((item) => (
                <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ height: 8, width: 8, borderRadius: 999, backgroundColor: item.color }} />
                  <Text style={{ fontSize: 10, fontWeight: "600", color: Colors.muted }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Card Carousel */}
        <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
          <LinearGradient
            colors={card.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24, minHeight: 180, overflow: "hidden" }}
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
          <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "center", gap: 8 }}>
            {MOCK_WALLET_CARDS.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveCard(i)}
                accessibilityRole="radio"
                accessibilityState={{ selected: activeCard === i }}
                style={{
                  height: 5,
                  width: activeCard === i ? 24 : 6,
                  borderRadius: 99,
                  backgroundColor: activeCard === i ? Colors.blue : Colors.pale,
                }}
              />
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
          <View
            style={{
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: "rgba(24,120,206,0.08)",
              ...shadowStyle(0.04, 10),
            }}
          >
            {WALLET_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                style={{ flex: 1, alignItems: "center", gap: 8, borderRadius: 12, paddingVertical: 12, backgroundColor: a.bg }}
              >
                <Text style={{ fontSize: 18, fontWeight: "700", color: a.color }}>{a.icon}</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", textAlign: "center", color: Colors.mid }}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* This Month Spending */}
        <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.navy, marginBottom: 12 }}>
            This Month
          </Text>
          <View
            style={{
              borderRadius: 16,
              padding: 20,
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: "rgba(24,120,206,0.08)",
              ...shadowStyle(0.04, 10),
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.muted }}>Spent</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.navy }}>
                GHS62.00 / GHS150.00
              </Text>
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
            {[
              { label: "Airtime", pct: 56, amount: "GHS12.00", color: Colors.blue },
              { label: "Data Bundle", pct: 79, amount: "GHS30.00", color: Colors.green },
              { label: "Mobile Money", pct: 26, amount: "GHS20.00", color: Colors.orange },
            ].map((cat) => (
              <View key={cat.label} style={{ marginBottom: 12 }}>
                <View style={{ marginBottom: 6, flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.muted }}>{cat.label}</Text>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.navy }}>{cat.amount}</Text>
                </View>
                <View
                  style={{
                    width: "100%",
                    height: 5,
                    borderRadius: 99,
                    backgroundColor: "#EAF1FA",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${cat.pct}%`,
                      height: "100%",
                      borderRadius: 99,
                      backgroundColor: cat.color,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.navy }}>
              Recent Activity
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="See all transactions"
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: Colors.blue }}>See all</Text>
              <ChevronRight size={13} color={Colors.blue} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: "rgba(24,120,206,0.07)",
              ...shadowStyle(0.04, 10),
            }}
          >
            {MOCK_TRANSACTIONS.slice(0, 4).map((tx, i, arr) => (
              <View key={tx.id}>
                <TransactionRow transaction={tx} onPress={() => setSelectedTx(tx)} />
                {i < arr.length - 1 && (
                  <View style={{ marginHorizontal: 16, height: 1, backgroundColor: Colors.divider }} />
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
