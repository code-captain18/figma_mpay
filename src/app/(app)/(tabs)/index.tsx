import { TransactionSheet } from "@/components/feedback/TransactionSheet";
import { Icon } from "@/components/ui/Icon";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { MOCK_QUICK_ACTIONS, MOCK_SALES_CARDS } from "@/mocks/services";
import { MOCK_TRANSACTIONS } from "@/mocks/transactions";
import { MOCK_WALLETS } from "@/mocks/wallets";
import { useAuth } from "@/store/auth.store";
import { Colors } from "@/theme/colors";
import { shadowStyle } from "@/theme/shadows";
import type { Transaction } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bell, ChevronRight, Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeWallet, setActiveWallet] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const displayName = user?.name.split(" ")[0] ?? "there";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingBottom: 14, paddingTop: 10 }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: "500", color: "#7E95B7" }}>
              Good afternoon,
            </Text>
            <Text style={{ fontSize: 37 / 2, fontWeight: "800", color: Colors.navy, fontFamily: "Urbanist_800ExtraBold" }}>
              {displayName} 👋
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: Colors.border,
                alignItems: "center",
                justifyContent: "center",
                ...shadowStyle(),
              }}
            >
              <Bell size={19} color={Colors.muted} />
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: Colors.orange,
                  borderWidth: 1.5,
                  borderColor: Colors.bg,
                }}
              />
            </TouchableOpacity>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: 48, width: 48, alignItems: "center", justifyContent: "center", borderRadius: 999 }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>
                {displayName[0].toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Balance Card */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 30, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 18, overflow: "hidden", minHeight: 188 }}
          >
            <View
              style={{
                position: "absolute",
                top: 30,
                right: 14,
                width: 96,
                height: 34,
                borderRadius: 34,
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.15)",
                transform: [{ rotate: "-20deg" }],
                backgroundColor: "transparent",
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 20,
                right: 30,
                width: 34,
                height: 18,
                borderRadius: 17,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.14)",
                transform: [{ rotate: "-20deg" }],
                backgroundColor: "transparent",
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 36 / 3, fontWeight: "700", color: "rgba(255,255,255,0.8)" }}>
                {MOCK_WALLETS[activeWallet].label}
              </Text>
              <TouchableOpacity
                onPress={() => setBalanceHidden((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={balanceHidden ? "Show balance" : "Hide balance"}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                {balanceHidden ? (
                  <EyeOff size={15} color="rgba(255,255,255,0.68)" />
                ) : (
                  <Eye size={15} color="rgba(255,255,255,0.68)" />
                )}
                <Text style={{ fontSize: 17 / 2, fontWeight: "600", color: "rgba(255,255,255,0.68)" }}>
                  {balanceHidden ? "Show" : "Hide"}
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 54 / 2,
                fontWeight: "800",
                color: "#fff",
                letterSpacing: -0.5,
                marginBottom: 4,
                fontFamily: "Urbanist_800ExtraBold",
              }}
            >
              {balanceHidden ? "••••••" : MOCK_WALLETS[activeWallet].amount.replace("GHS", "GHS")}
            </Text>
            <Text style={{ fontSize: 16 / 2, color: "rgba(255,255,255,0.58)", marginBottom: 26 }}>
              {MOCK_WALLETS[activeWallet].sub}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {MOCK_WALLETS.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActiveWallet(i)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: activeWallet === i }}
                  style={{
                    height: 8,
                    width: activeWallet === i ? 30 : 8,
                    borderRadius: 99,
                    backgroundColor: activeWallet === i ? "#fff" : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
              <Text
                style={{ marginLeft: "auto", fontSize: 32 / 3, fontWeight: "700", color: "rgba(255,255,255,0.55)" }}
              >
                {activeWallet + 1}/{MOCK_WALLETS.length}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              borderRadius: 24,
              padding: 18,
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: "rgba(24,120,206,0.08)",
              ...shadowStyle(0.04, 12),
            }}
          >
            <View style={{ flexDirection: "row", gap: 10 }}>
              {MOCK_QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  onPress={() => {
                    if (action.label === "Airtime") router.push("/(app)/airtime");
                    else if (action.label === "Data Bundle") router.push("/(app)/data-bundle");
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  style={{ flex: 1, alignItems: "center", gap: 9, borderRadius: 16, paddingVertical: 14, backgroundColor: action.bg }}
                >
                  <Icon name={action.iconName} size={22} color={action.color} />
                  <Text style={{ textAlign: "center", fontSize: 11, fontWeight: "600", color: Colors.mid }}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Today's Sales */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 34 / 2, fontWeight: "700", color: Colors.navy }}>
              {"Today's Sales"}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="View all sales"
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text style={{ fontSize: 14 / 1.2, fontWeight: "600", color: Colors.blue }}>View all</Text>
              <ChevronRight size={15} color={Colors.blue} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {MOCK_SALES_CARDS.map((card) => (
              <View
                key={card.label}
                style={{
                  flex: 1,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingTop: 14,
                  paddingBottom: 16,
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: "rgba(24,120,206,0.07)",
                  ...shadowStyle(0.04, 8),
                }}
              >
                <View style={{ marginBottom: 10, height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: card.bg }}>
                  <Icon name={card.iconName} size={18} color={card.color} />
                </View>
                <Text style={{ fontSize: 13 / 1.2, color: Colors.muted, fontWeight: "500" }}>
                  {card.label}
                </Text>
                <Text style={{ fontSize: 34 / 2, fontWeight: "700", color: Colors.navy, marginTop: 4, fontFamily: "Urbanist_700Bold" }}>
                  {card.amount.replace("GHS", "GHS")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 34 / 2, fontWeight: "700", color: Colors.navy }}>
              Recent Transactions
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="See all transactions"
              style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
            >
              <Text style={{ fontSize: 14 / 1.2, fontWeight: "600", color: Colors.blue }}>See all</Text>
              <ChevronRight size={15} color={Colors.blue} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: "rgba(24,120,206,0.07)",
              ...shadowStyle(0.04, 12),
            }}
          >
            {MOCK_TRANSACTIONS.slice(0, 4).map((tx, i, arr) => (
              <View key={tx.id}>
                <TransactionRow
                  transaction={tx}
                  onPress={() => setSelectedTx(tx)}
                  showRelativeTime
                />
                {i < arr.length - 1 && (
                  <View style={{ marginLeft: 74, marginRight: 16, height: 1, backgroundColor: Colors.divider }} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {selectedTx && (
        <TransactionSheet
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </SafeAreaView>
  );
}
