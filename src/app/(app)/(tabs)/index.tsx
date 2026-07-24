import { TransactionSheet } from "@/components/feedback/TransactionSheet";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TransactionRow } from "@/components/ui/TransactionRow";
import { MOCK_QUICK_ACTIONS, MOCK_SALES_CARDS } from "@/mocks/services";
import { MOCK_TRANSACTIONS } from "@/mocks/transactions";
import { MOCK_WALLET_CARDS, MOCK_WALLETS } from "@/mocks/wallets";
import { useAuth } from "@/store/auth.store";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";
import type { Transaction } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bell, Eye, EyeOff } from "lucide-react-native";
import { useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [activeWallet, setActiveWallet] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const cardScrollRef = useRef<ScrollView>(null);

  const displayName = user?.name.split(" ")[0] ?? "there";
  const initials = displayName[0]?.toUpperCase() ?? "U";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning,";
    if (h < 17) return "Good afternoon,";
    return "Good evening,";
  };

  return (
    <SafeAreaView style={S.root} edges={["top"]}>
      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.greeting}>{getGreeting()}</Text>
            <Text style={S.name}>{displayName} 👋</Text>
          </View>
          <View style={S.headerRight}>
            {/* Bell */}
            <TouchableOpacity style={S.bellBtn} accessibilityRole="button" accessibilityLabel="Notifications">
              <Bell size={19} color={Colors.textMuted} />
              <View style={S.bellDot} />
            </TouchableOpacity>
            {/* Avatar */}
            <Avatar initials={initials} size={44} />
          </View>
        </View>

        {/* Wallet Card Carousel */}
        <ScrollView
          ref={cardScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          style={{ marginBottom: Spacing["2xl"] }}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveWallet(idx);
          }}
        >
          {MOCK_WALLETS.map((wallet, i) => (
            <View key={wallet.id} style={{ width: SCREEN_WIDTH, paddingHorizontal: Spacing["2xl"] }}>
              <LinearGradient
                colors={MOCK_WALLET_CARDS[i].colors}
                locations={[0, 0.42, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={S.walletCard}
              >
                {/* Decorative rings */}
                <View style={S.ring1} />
                <View style={S.ring2} />

                <View style={S.walletTop}>
                  <Text style={S.walletLabel}>{wallet.label}</Text>
                  <TouchableOpacity onPress={() => setBalanceHidden((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={balanceHidden ? "Show balance" : "Hide balance"}
                    style={S.hideBtn}>
                    {balanceHidden ? <EyeOff size={14} color="rgba(255,255,255,0.7)" /> : <Eye size={14} color="rgba(255,255,255,0.7)" />}
                    <Text style={S.hideText}>{balanceHidden ? "Show" : "Hide"}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={S.balanceAmount}>
                  {balanceHidden ? "••••••" : wallet.amount}
                </Text>
                <Text style={S.balanceSub}>{wallet.sub}</Text>

                {/* Pagination */}
                <View style={S.pagination}>
                  {MOCK_WALLETS.map((_, j) => (
                    <TouchableOpacity key={j}
                      onPress={() => {
                        cardScrollRef.current?.scrollTo({ x: j * SCREEN_WIDTH, animated: true });
                        setActiveWallet(j);
                      }}
                      accessibilityRole="radio" accessibilityState={{ selected: activeWallet === j }}
                      style={[S.pageDot, activeWallet === j && S.pageDotActive]} />
                  ))}
                  <Text style={S.pageCount}>{activeWallet + 1}/{MOCK_WALLETS.length}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={S.cardWrap}>
          <View style={[S.actionsCard, Shadows.subtle]}>
            <View style={S.actionsRow}>
              {MOCK_QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  onPress={() => {
                    if (action.label === "Airtime") router.push("/(app)/airtime");
                    else if (action.label === "Data Bundle") router.push("/(app)/data-bundle");
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  style={[S.actionItem, { backgroundColor: action.bg }]}
                >
                  <Icon name={action.iconName} size={22} color={action.color} />
                  <Text style={S.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Today's Sales */}
        <View style={S.section}>
          <SectionHeader title="Today's Sales" actionLabel="View all" />
          <View style={S.salesRow}>
            {MOCK_SALES_CARDS.map((card) => (
              <View key={card.label} style={[S.salesCard, Shadows.subtle]}>
                <View style={[S.salesIcon, { backgroundColor: card.bg }]}>
                  <Icon name={card.iconName} size={22} color={card.color} />
                </View>
                <Text style={S.salesCardLabel}>{card.label}</Text>
                <Text style={S.salesAmount}>{card.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={S.section}>
          <SectionHeader title="Recent Transactions" actionLabel="See all" />
          <View style={[S.txCard, Shadows.subtle]}>
            {MOCK_TRANSACTIONS.slice(0, 4).map((tx, i, arr) => (
              <View key={tx.id}>
                <TransactionRow transaction={tx} onPress={() => setSelectedTx(tx)} showRelativeTime />
                {i < arr.length - 1 && <View style={S.txDivider} />}
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

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing["3xl"] },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  greeting: { fontSize: 12, fontFamily: "Urbanist_500Medium", color: Colors.textMuted },
  name: { fontSize: 16, fontFamily: "Urbanist_700Bold", color: Colors.textPrimary },
  headerRight: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    ...Shadows.subtle,
  },
  bellDot: {
    position: "absolute", top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.orange, borderWidth: 1.5, borderColor: Colors.bg,
  },

  // Wallet Card
  cardWrap: { paddingHorizontal: Spacing["2xl"], marginBottom: Spacing["2xl"] },
  walletCard: {
    borderRadius: Radius["3xl"],
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    overflow: "hidden",
    minHeight: 188,
  },
  ring1: {
    position: "absolute", top: 30, right: 14,
    width: 96, height: 34, borderRadius: 34,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.15)",
    transform: [{ rotate: "-20deg" }], backgroundColor: "transparent",
  },
  ring2: {
    position: "absolute", top: 20, right: 30,
    width: 34, height: 18, borderRadius: 17,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.14)",
    transform: [{ rotate: "-20deg" }], backgroundColor: "transparent",
  },
  walletTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.xs },
  walletLabel: { fontSize: 12, fontFamily: "Urbanist_600SemiBold", color: "rgba(255,255,255,0.75)" },
  hideBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  hideText: { ...T.caption, fontFamily: "Urbanist_600SemiBold", color: "rgba(255,255,255,0.7)" },
  balanceAmount: { fontSize: 30, fontFamily: "Urbanist_800ExtraBold", color: "#fff", marginBottom: Spacing.xs },
  balanceSub: { fontSize: 12, fontFamily: "Urbanist_400Regular", color: "rgba(255,255,255,0.5)", marginBottom: Spacing["2xl"] },
  pagination: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  pageDot: { height: 8, width: 8, borderRadius: Radius.pill, backgroundColor: "rgba(255,255,255,0.3)" },
  pageDotActive: { width: 28, backgroundColor: "#fff" },
  pageCount: { marginLeft: "auto", fontSize: 12, fontFamily: "Urbanist_600SemiBold", color: "rgba(255,255,255,0.5)" },

  // Quick Actions
  actionsCard: {
    borderRadius: Radius["2xl"],
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionsRow: { flexDirection: "row", gap: Spacing.sm },
  actionItem: {
    flex: 1,
    alignItems: "center",
    gap: 9,
    borderRadius: Radius.xl,
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  actionLabel: { fontSize: 10, fontFamily: "Urbanist_600SemiBold", color: Colors.textSecondary, textAlign: "center" },

  // Sales
  section: { marginBottom: Spacing["2xl"] },
  salesRow: { flexDirection: "row", gap: Spacing.md, paddingHorizontal: Spacing["2xl"] },
  salesCard: {
    flex: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  salesIcon: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  salesCardLabel: { fontSize: 10, fontFamily: "Urbanist_500Medium", color: Colors.textMuted },
  salesAmount: { fontSize: 14, fontFamily: "Urbanist_700Bold", color: Colors.textPrimary, marginTop: 4 },

  // Transactions
  txCard: {
    borderRadius: Radius.xl,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing["2xl"],
  },
  txDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 74,
    marginRight: Spacing.lg,
  },
});
