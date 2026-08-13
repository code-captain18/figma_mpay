import { Icon } from "@/components/ui/Icon";
import { useDashboardData, useWalletBalances } from "@/hooks/useAppQueries";
import { useAuth } from "@/store/auth.store";
import { Colors, shadowStyle } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { RefreshCw } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = Colors;
const sd = (radius: number, _color: string, opacity: number) =>
  shadowStyle(opacity, radius, 1);

const getMonthRange = () => {
  const now = new Date();
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const end = now.toISOString().slice(0, 10);
  return { start, end };
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const insets = useSafeAreaInsets();

  const [{ start: startDate, end: endDate }, setRange] = useState(getMonthRange);

  const { data: dash, isLoading: loading, refetch: fetchDash } = useDashboardData(startDate, endDate);
  const { data: balancesData, refetch: fetchBalances } = useWalletBalances();
  const balances = balancesData ?? { topup: 0, momo: 0 };

  // Recompute today's date and refetch every time the tab is focused
  useFocusEffect(useCallback(() => {
    setRange(getMonthRange());
    fetchDash();
    fetchBalances();
  }, [fetchDash, fetchBalances]));

  const displayName = user?.name?.split(" ")[0] ?? user?.username?.split('@')[0] ?? "there";
  const initials = displayName[0]?.toUpperCase() ?? "U";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning,";
    if (h < 17) return "Good afternoon,";
    return "Good evening,";
  };

  const num = (v: unknown): number => Number(v) || 0;

  const totalSales = num(dash?.databundleSales) + num(dash?.airtimeSales) + num(dash?.mobileMoneyTransfers);
  const tx = dash?.todayTransactions;
  const totalSuccess =
    num(tx?.airtime.successful) + num(tx?.data.successful) +
    num(tx?.mobileMoneyCredit.successful) + num(tx?.mobileMoneyDebit.successful);
  const totalFailed =
    num(tx?.airtime.failed) + num(tx?.data.failed) +
    num(tx?.mobileMoneyCredit.failed) + num(tx?.mobileMoneyDebit.failed);

  const salesMax = Math.max(num(dash?.databundleSales), num(dash?.airtimeSales), num(dash?.mobileMoneyTransfers), 1);
  const channelTotal = num(dash?.webSales) + num(dash?.apiSales) + num(dash?.mobileAppSales);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: C.bg }}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 24 }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 18 }}>
          <View>
            <Text style={{ fontSize: 11, color: C.muted, fontFamily: "Urbanist_400Regular" }}>
              {getGreeting()}
            </Text>
            <Text style={{ fontSize: 17, color: C.navy, fontFamily: "Urbanist_700Bold" }}>
              {displayName} 👋
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
                alignItems: "center", justifyContent: "center",
                ...sd(4, C.navy, 0.06),
              }}
            >
              <Icon name="bell" size={16} color={C.muted} />
              <View style={{
                position: "absolute", top: 7, right: 7,
                width: 7, height: 7, borderRadius: 4,
                backgroundColor: C.orange,
                borderWidth: 1.5, borderColor: C.bg,
              }} />
            </TouchableOpacity>
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              alignItems: "center", justifyContent: "center",
              backgroundColor: C.blue,
            }}>
              <Text style={{ fontSize: 13, fontFamily: "Urbanist_700Bold", color: "#fff" }}>{initials}</Text>
            </View>
          </View>
        </View>

        {/* ── Balance hero card ───────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <LinearGradient
            colors={[C.sky, C.blue, C.deep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 20, overflow: "hidden" }}
          >
            <View style={{ position: "absolute", top: -32, right: -32, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.08)" }} />
            <View style={{ position: "absolute", bottom: -24, left: -16, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(233,145,10,0.10)" }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "Urbanist_600SemiBold" }}>
                  Today's Total Sales
                </Text>
                {loading && <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />}
              </View>
              <TouchableOpacity
                onPress={() => setHidden(!hidden)}
                accessibilityRole="button"
                accessibilityLabel={hidden ? "Show balance" : "Hide balance"}
                style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 99, paddingVertical: 4, paddingHorizontal: 10 }}
              >
                <Icon name={hidden ? "eye-off" : "eye"} size={12} color="rgba(255,255,255,0.7)" />
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Urbanist_600SemiBold" }}>
                  {hidden ? "Show" : "Hide"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 36, color: "#fff", fontFamily: "Urbanist_800ExtraBold", letterSpacing: -0.5, marginBottom: 16 }}>
              {hidden ? "••••••" : `GHS ${totalSales.toFixed(2)}`}
            </Text>

            <View style={{ height: 0.6, backgroundColor: "rgba(255,255,255,0.18)", marginBottom: 14 }} />

            {/* Wallet balance sub-items */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.13)", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="smartphone" size={14} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontFamily: "Urbanist_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" }}>E-Top-Up</Text>
                  <Text style={{ fontSize: 13, color: "#fff", fontFamily: "Urbanist_700Bold", marginTop: 1 }}>
                    {hidden ? "••••" : `GHS ${balances.topup.toFixed(2)}`}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.13)", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,165,0,0.28)", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="banknote" size={14} color="#FFD580" />
                </View>
                <View>
                  <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontFamily: "Urbanist_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" }}>MoMo</Text>
                  <Text style={{ fontSize: 13, color: "#fff", fontFamily: "Urbanist_700Bold", marginTop: 1 }}>
                    {hidden ? "••••" : `GHS ${balances.momo.toFixed(2)}`}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── Buy: Quick actions ──────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ marginBottom: 13 }}>
            <Text style={{ fontSize: 15, color: C.navy, fontFamily: "Urbanist_700Bold" }}>Buy</Text>
            <Text style={{ fontSize: 11, color: C.muted, fontFamily: "Urbanist_400Regular", marginTop: 1 }}>Quick top-up &amp; transfers</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {([
              { id: "airtime", label: "Airtime", icon: "smartphone", iconColor: C.blue, iconBg: "rgba(24,120,206,0.10)" },
              { id: "data", label: "Data Bundle", icon: "wifi", iconColor: C.green, iconBg: "rgba(13,168,112,0.10)" },
              { id: "momo", label: "Mobile Money", icon: "banknote", iconColor: C.orange, iconBg: "rgba(233,145,10,0.10)" },
              { id: "more", label: "More", icon: "layers", iconColor: C.blue, iconBg: "rgba(24,120,206,0.07)" },
            ] as const).map(link => (
              <TouchableOpacity
                key={link.id}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel={link.label}
                onPress={() =>
                  link.id === 'more'
                    ? router.push('/(app)/(tabs)/services')
                    : router.push({ pathname: '/(app)/(tabs)/services', params: { open: link.id } })
                }
                style={{
                  flex: 1, alignItems: "center", gap: 8,
                  backgroundColor: C.white,
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 6,
                  borderWidth: 1,
                  borderColor: C.border,
                  ...sd(6, C.navy, 0.04),
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: link.iconBg, alignItems: "center", justifyContent: "center" }}>
                  <Icon name={link.icon} size={20} color={link.iconColor} />
                </View>
                <Text style={{ fontSize: 11, fontFamily: "Urbanist_600SemiBold", color: C.navy, textAlign: "center" }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Sales breakdown cards ──────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 15, color: C.navy, fontFamily: "Urbanist_700Bold" }}>Sales Breakdown</Text>
            <TouchableOpacity
              onPress={() => { fetchDash(); }}
              disabled={loading}
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              accessibilityRole="button"
              accessibilityLabel="Refresh dashboard"
            >
              {loading
                ? <ActivityIndicator size="small" color={C.blue} />
                : <RefreshCw size={12} color={C.blue} />}
              <Text style={{ fontSize: 11, color: loading ? C.pale : C.blue, fontFamily: "Urbanist_600SemiBold" }}>
                This Month
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 4 }}
          >
            {[
              { label: "Airtime", icon: "phone", color: C.blue, bg: "rgba(24,120,206,0.1)", amount: num(dash?.airtimeSales), last: num(dash?.airtimeLastMonth), trend: num(dash?.airtimeTrend) },
              { label: "Data", icon: "wifi", color: C.green, bg: "rgba(13,168,112,0.1)", amount: num(dash?.databundleSales), last: num(dash?.databundleLastMonth), trend: num(dash?.databundleTrend) },
              { label: "MoMo", icon: "smartphone", color: C.orange, bg: "rgba(233,145,10,0.1)", amount: num(dash?.mobileMoneyTransfers), last: num(dash?.mobileMoneyLastMonth), trend: num(dash?.mobileMoneyTrend) },
            ].map((s) => {
              const hasData = s.amount > 0;
              const pct = salesMax > 0 ? (s.amount / salesMax) * 100 : 0;
              return (
                <View key={s.label} style={{
                  width: 140, borderRadius: 20, padding: 16,
                  backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
                  ...sd(4, C.navy, 0.05),
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: s.bg, alignItems: "center", justifyContent: "center" }}>
                      <Icon name={s.icon} size={16} color={s.color} />
                    </View>
                    {hasData ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 99, paddingVertical: 3, paddingHorizontal: 7, backgroundColor: s.trend > 0 ? "rgba(13,168,112,0.1)" : "rgba(232,51,74,0.1)" }}>
                        <Icon name={s.trend > 0 ? "trending-up" : "trending-down"} size={10} color={s.trend > 0 ? C.green : C.red} />
                        <Text style={{ fontSize: 10, fontFamily: "Urbanist_700Bold", color: s.trend > 0 ? C.green : C.red }}>{s.trend > 0 ? '+' : ''}{s.trend.toFixed(1)}%</Text>
                      </View>
                    ) : (
                      <View style={{ borderRadius: 99, paddingVertical: 3, paddingHorizontal: 7, backgroundColor: "rgba(24,120,206,0.07)" }}>
                        <Text style={{ fontSize: 10, fontFamily: "Urbanist_700Bold", color: C.muted }}>—</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 18, fontFamily: "Urbanist_800ExtraBold", color: hasData ? C.navy : C.pale, marginBottom: 2 }}>
                    {hasData ? `GHS ${s.amount.toFixed(2)}` : "GHS 0.00"}
                  </Text>
                  <Text style={{ fontSize: 11, fontFamily: "Urbanist_600SemiBold", color: C.muted, marginBottom: 10 }}>{s.label}</Text>
                  <View style={{ height: 4, borderRadius: 99, backgroundColor: "rgba(24,120,206,0.08)", overflow: "hidden" }}>
                    <View style={{ width: `${pct}%`, height: 4, borderRadius: 99, backgroundColor: s.color }} />
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
                    <Text style={{ fontSize: 10, color: C.pale, fontFamily: "Urbanist_500Medium" }}>Last month</Text>
                    <Text style={{ fontSize: 10, fontFamily: "Urbanist_700Bold", color: C.light }}>GHS {s.last.toFixed(2)}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Today's transactions ───────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 15, color: C.navy, fontFamily: "Urbanist_700Bold" }}>{"Today's Transactions"}</Text>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
              accessibilityRole="button" accessibilityLabel="View all transactions">
              <Text style={{ fontSize: 11, color: C.blue, fontFamily: "Urbanist_600SemiBold" }}>View all</Text>
              <Icon name="chevron-right" size={13} color={C.blue} />
            </TouchableOpacity>
          </View>
          <View style={{ borderRadius: 20, overflow: "hidden", backgroundColor: C.white, borderWidth: 1, borderColor: C.border, ...sd(6, C.navy, 0.05) }}>
            {[
              { label: "Airtime", icon: "phone", color: C.blue, bg: "rgba(24,120,206,0.1)", tx: tx?.airtime ?? { successful: 0, failed: 0 } },
              { label: "Data Bundle", icon: "wifi", color: C.green, bg: "rgba(13,168,112,0.1)", tx: tx?.data ?? { successful: 0, failed: 0 } },
              { label: "MoMo Credit", icon: "arrow-down-left", color: C.green, bg: "rgba(13,168,112,0.1)", tx: tx?.mobileMoneyCredit ?? { successful: 0, failed: 0 } },
              { label: "MoMo Debit", icon: "arrow-up-right", color: C.orange, bg: "rgba(233,145,10,0.1)", tx: tx?.mobileMoneyDebit ?? { successful: 0, failed: 0 } },
            ].map((row, i, arr) => {
              const total = row.tx.successful + row.tx.failed;
              const hasActivity = total > 0;
              return (
                <View key={row.label}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: row.bg, alignItems: "center", justifyContent: "center" }}>
                      <Icon name={row.icon} size={15} color={row.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontFamily: "Urbanist_600SemiBold", color: C.navy, marginBottom: hasActivity ? 5 : 0 }}>{row.label}</Text>
                      {hasActivity ? (
                        <View style={{ height: 4, borderRadius: 99, backgroundColor: "rgba(24,120,206,0.08)", overflow: "hidden" }}>
                          <View style={{ width: `${(row.tx.successful / total) * 100}%`, height: 4, borderRadius: 99, backgroundColor: C.green }} />
                        </View>
                      ) : (
                        <Text style={{ fontSize: 10, color: C.pale, fontFamily: "Urbanist_500Medium" }}>No transactions today</Text>
                      )}
                    </View>
                    {hasActivity ? (
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Icon name="check-circle-2" size={10} color={C.green} />
                          <Text style={{ fontSize: 11, fontFamily: "Urbanist_700Bold", color: C.green }}>{row.tx.successful}</Text>
                        </View>
                        {row.tx.failed > 0 && (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Icon name="x-circle" size={10} color={C.red} />
                            <Text style={{ fontSize: 11, fontFamily: "Urbanist_700Bold", color: C.red }}>{row.tx.failed}</Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text style={{ fontSize: 11, fontFamily: "Urbanist_600SemiBold", color: C.pale }}>—</Text>
                    )}
                  </View>
                  {i < arr.length - 1 && <View style={{ marginLeft: 16, height: 1, backgroundColor: C.divider }} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Sales by channel ───────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 15, color: C.navy, fontFamily: "Urbanist_700Bold" }}>Sales by Channel</Text>
            <Text style={{ fontSize: 11, color: C.muted, fontFamily: "Urbanist_600SemiBold" }}>
              GHS {channelTotal.toFixed(1)} total
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { label: "Web", icon: "globe", color: C.blue, bg: "rgba(24,120,206,0.1)", amount: num(dash?.webSales) },
              { label: "API", icon: "code-2", color: C.purple, bg: "rgba(124,92,252,0.1)", amount: num(dash?.apiSales) },
              { label: "Mobile App", icon: "layers", color: C.orange, bg: "rgba(233,145,10,0.1)", amount: num(dash?.mobileAppSales) },
            ].map((ch) => {
              const pct = channelTotal > 0 ? Math.round((ch.amount / channelTotal) * 100) : 0;
              return (
                <View key={ch.label} style={{ flex: 1, borderRadius: 16, padding: 14, backgroundColor: C.white, borderWidth: 1, borderColor: C.border }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: ch.bg, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <Icon name={ch.icon} size={15} color={ch.color} />
                  </View>
                  <Text style={{ fontSize: 14, fontFamily: "Urbanist_800ExtraBold", color: ch.amount > 0 ? C.navy : C.pale, marginBottom: 1 }}>
                    {ch.amount > 0 ? `GHS ${ch.amount.toFixed(2)}` : "—"}
                  </Text>
                  <Text style={{ fontSize: 11, fontFamily: "Urbanist_600SemiBold", color: C.muted, marginBottom: 8 }}>{ch.label}</Text>
                  <View style={{ height: 3, borderRadius: 99, backgroundColor: C.divider, overflow: "hidden" }}>
                    <View style={{ width: `${pct}%`, height: 3, borderRadius: 99, backgroundColor: ch.color }} />
                  </View>
                  <Text style={{ fontSize: 10, fontFamily: "Urbanist_700Bold", color: C.light, marginTop: 4 }}>
                    {pct}% of total
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

