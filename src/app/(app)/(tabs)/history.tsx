import { ArrowDownLeft, ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionSheet } from "@/components/feedback/TransactionSheet";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { MOCK_TRANSACTIONS } from "@/mocks/transactions";
import { Colors } from "@/theme/colors";
import { shadowStyle } from "@/theme/shadows";
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.bg }} edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 1.8,
            color: "#8EA4C8",
            marginBottom: 6,
          }}
        >
          OVERVIEW
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: Colors.navy,
            marginBottom: 18,
            fontFamily: "Urbanist_800ExtraBold",
          }}
        >
          Transaction History
        </Text>
        {/* Stats */}
        <View className="mb-[18px] flex-row gap-3.5">
          {[
            {
              label: "Total In",
              amount: totalIn,
              color: "#05A56F",
              bg: "#E3F1F2",
              border: "#B6E3DA",
              Icon: ArrowDownLeft,
            },
            {
              label: "Total Out",
              amount: totalOut,
              color: "#FF3651",
              bg: "#FCEEF3",
              border: "#F5CFD8",
              Icon: ArrowUpRight,
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                borderRadius: 22,
                padding: 18,
                backgroundColor: stat.bg,
                borderWidth: 1,
                borderColor: stat.border,
              }}
            >
              <View className="mb-3.5 flex-row justify-between">
                <Text className="text-[15px] font-bold" style={{ color: stat.color }}>{stat.label}</Text>
                <View
                  className="h-[30px] w-[30px] items-center justify-center rounded-full bg-white/45"
                >
                  <stat.Icon size={15} color={stat.color} />
                </View>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: stat.color,
                  fontFamily: "Urbanist_800ExtraBold",
                  marginBottom: 5,
                }}
              >
                {stat.label === "Total In" ? "+" : "−"}GHS{stat.amount.toFixed(2)}
              </Text>
              <Text className="text-[13px] text-[#889ABD]">This month</Text>
            </View>
          ))}
        </View>
        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 20,
            paddingHorizontal: 18,
            height: 54,
            backgroundColor: Colors.white,
            borderWidth: 1,
            borderColor: "#EAF1FA",
            ...shadowStyle(0.04, 8),
          }}
        >
          <Search size={20} color="#9BAFCD" />
          <TextInput
            className="ml-2.5 flex-1 text-base"
            style={{ color: Colors.navy }}
            placeholder="Search transactions..."
            placeholderTextColor="#8FA4C4"
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search transactions"
          />
          <View className="ml-2.5 h-9 w-9 items-center justify-center rounded-full bg-[#EDF3FF]">
            {query.length > 0 ? (
              <TouchableOpacity
                onPress={() => setQuery("")}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <X size={16} color="#6091EE" />
              </TouchableOpacity>
            ) : (
              <SlidersHorizontal size={16} color="#6091EE" />
            )}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 ? (
          <View className="items-center gap-2 pt-[60px]">
            <Search size={28} color={Colors.pale} />
            <Text className="text-sm font-semibold" style={{ color: Colors.light }}>
              No transactions found
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.date} className="mb-5">
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#8EA4C8",
                  marginBottom: 10,
                }}
              >
                {group.date}
              </Text>
              <View
                style={{
                  borderRadius: 22,
                  overflow: "hidden",
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: "#EAF1FA",
                  ...shadowStyle(0.04, 10),
                }}
              >
                {group.items.map((tx, i, arr) => (
                  <View key={tx.id}>
                    <TransactionRow transaction={tx} onPress={() => setSelectedTx(tx)} />
                    {i < arr.length - 1 && (
                      <View className="ml-20 mr-[18px] h-px" style={{ backgroundColor: Colors.divider }} />
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
