import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/store/auth.store";
import { Colors, shadowStyle } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = Colors;
const sd = (radius: number, _color: string, opacity: number) =>
  shadowStyle(opacity, radius, 1);

const DASH = {
  databundleSales: 9.3,
  airtimeSales: 23,
  mobileMoneyTransfers: 0,
  databundleLastMonth: 4,
  airtimeLastMonth: 7,
  mobileMoneyLastMonth: 0,
  databundleTrend: 5.3,
  airtimeTrend: 16,
  mobileMoneyTrend: 0,
  webSales: 19.5,
  apiSales: 12.8,
  mobileAppSales: 0,
  todayTransactions: {
    airtime: { successful: 23, failed: 3 },
    data: { successful: 11, failed: 0 },
    mobileMoneyCredit: { successful: 0, failed: 0 },
    mobileMoneyDebit: { successful: 2, failed: 1 },
  },
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const insets = useSafeAreaInsets();

  const displayName = user?.name.split(" ")[0] ?? "there";
  const initials = displayName[0]?.toUpperCase() ?? "U";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning,";
    if (h < 17) return "Good afternoon,";
    return "Good evening,";
  };

  const totalSales =
    DASH.databundleSales + DASH.airtimeSales + DASH.mobileMoneyTransfers;
  const totalSuccess =
    DASH.todayTransactions.airtime.successful +
    DASH.todayTransactions.data.successful +
    DASH.todayTransactions.mobileMoneyCredit.successful +
    DASH.todayTransactions.mobileMoneyDebit.successful;
  const totalFailed =
    DASH.todayTransactions.airtime.failed +
    DASH.todayTransactions.data.failed +
    DASH.todayTransactions.mobileMoneyCredit.failed +
    DASH.todayTransactions.mobileMoneyDebit.failed;

  const salesMax = Math.max(
    DASH.databundleSales, DASH.airtimeSales, DASH.mobileMoneyTransfers, 1
  );
  const channelTotal = DASH.webSales + DASH.apiSales + DASH.mobileAppSales;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 24 }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 18 }}>
        <View>
          <Text style={{ fontSize: 12, color: C.muted, fontFamily: "Urbanist_500Medium" }}>
            {getGreeting()}
          </Text>
          <Text style={{ fontSize: 17, color: C.navy, fontFamily: "Urbanist_800ExtraBold" }}>
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
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "Urbanist_600SemiBold" }}>
              {"Today's Total Sales"}
            </Text>
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

          <Text style={{ fontSize: 32, color: "#fff", fontFamily: "Urbanist_800ExtraBold", letterSpacing: -0.5, marginBottom: 2 }}>
            {hidden ? "••••••" : `GH₵${totalSales.toFixed(2)}`}
          </Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 20, fontFamily: "Urbanist_500Medium" }}>
            Airtime · Data Bundle · Mobile Money
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 99, paddingVertical: 5, paddingHorizontal: 10 }}>
              <Icon name="check-circle-2" size={11} color={C.green} />
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontFamily: "Urbanist_700Bold" }}>
                {totalSuccess} successful
              </Text>
            </View>
            {totalFailed > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(232,51,74,0.18)", borderRadius: 99, paddingVertical: 5, paddingHorizontal: 10 }}>
                <Icon name="x-circle" size={11} color="#FF7A8A" />
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontFamily: "Urbanist_700Bold" }}>
                  {totalFailed} failed
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* ── Buy: Quick actions ──────────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 13 }}>
          <View>
            <Text style={{ fontSize: 15, color: C.navy, fontFamily: "Urbanist_800ExtraBold" }}>Buy</Text>
            <Text style={{ fontSize: 10, color: C.muted, fontFamily: "Urbanist_500Medium", marginTop: 1 }}>Quick top-up &amp; transfers</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="See all services"
            style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(24,120,206,0.08)", borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: "rgba(24,120,206,0.14)" }}
          >
            <Text style={{ fontSize: 11, fontFamily: "Urbanist_600SemiBold", color: C.blue }}>See all</Text>
            <Icon name="arrow-right" size={11} color={C.blue} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {([
            { id: "airtime", label: "Airtime", sub: "All networks", icon: "smartphone", colors: [C.sky, C.blue, C.deep] as [string, string, string] },
            { id: "data", label: "Data Bundle", sub: "6 plans", icon: "wifi", colors: ["#0DA870", "#0A7A52", "#064A30"] as [string, string, string] },
            { id: "momo", label: "Mobile Money", sub: "Send · Cash", icon: "zap", colors: [C.orange, "#C47800", "#7A4B00"] as [string, string, string] },
            { id: "more", label: "More", sub: "All services", icon: "more-horizontal", colors: [C.purple, "#5B3ECC", "#3D2090"] as [string, string, string] },
          ] as const).map(link => (
            <TouchableOpacity
              key={link.id}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel={link.label}
              style={{ flex: 1, alignItems: "center", gap: 7 }}
            >
              <View style={{ shadowColor: "#071830", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 8, elevation: 4 }}>
                <LinearGradient
                  colors={link.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                >
                  <View style={{ position: "absolute", top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.18)" }} />
                  <Icon name={link.icon} size={20} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={{ fontSize: 11, fontFamily: "Urbanist_700Bold", color: C.navy, textAlign: "center" }} numberOfLines={1}>
                {link.label}
              </Text>
              <Text style={{ fontSize: 9, fontFamily: "Urbanist_500Medium", color: C.muted, textAlign: "center", lineHeight: 12 }} numberOfLines={1}>
                {link.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Sales breakdown cards ──────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: C.navy, fontFamily: "Urbanist_700Bold" }}>Sales Breakdown</Text>
          <Text style={{ fontSize: 11, color: C.blue, fontFamily: "Urbanist_600SemiBold" }}>Today</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingRight: 4 }}
        >
          {[
            { label: "Airtime", icon: "phone", color: C.blue, bg: "rgba(24,120,206,0.1)", amount: DASH.airtimeSales, last: DASH.airtimeLastMonth, trend: DASH.airtimeTrend },
            { label: "Data", icon: "wifi", color: C.green, bg: "rgba(13,168,112,0.1)", amount: DASH.databundleSales, last: DASH.databundleLastMonth, trend: DASH.databundleTrend },
            { label: "MoMo", icon: "smartphone", color: C.orange, bg: "rgba(233,145,10,0.1)", amount: DASH.mobileMoneyTransfers, last: DASH.mobileMoneyLastMonth, trend: DASH.mobileMoneyTrend },
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
                      <Icon name={s.trend > 0 ? "trending-up" : "trending-down"} size={9} color={s.trend > 0 ? C.green : C.red} />
                      <Text style={{ fontSize: 9, fontFamily: "Urbanist_700Bold", color: s.trend > 0 ? C.green : C.red }}>+{s.trend}</Text>
                    </View>
                  ) : (
                    <View style={{ borderRadius: 99, paddingVertical: 3, paddingHorizontal: 7, backgroundColor: "rgba(24,120,206,0.07)" }}>
                      <Text style={{ fontSize: 9, fontFamily: "Urbanist_700Bold", color: C.muted }}>—</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 18, fontFamily: "Urbanist_800ExtraBold", color: hasData ? C.navy : C.pale, marginBottom: 2 }}>
                  {hasData ? `GH₵${s.amount}` : "GH₵0"}
                </Text>
                <Text style={{ fontSize: 9, fontFamily: "Urbanist_600SemiBold", color: C.muted, marginBottom: 10 }}>{s.label}</Text>
                <View style={{ height: 4, borderRadius: 99, backgroundColor: "rgba(24,120,206,0.08)", overflow: "hidden" }}>
                  <View style={{ width: `${pct}%`, height: 4, borderRadius: 99, backgroundColor: s.color }} />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
                  <Text style={{ fontSize: 8, color: C.pale, fontFamily: "Urbanist_500Medium" }}>Last month</Text>
                  <Text style={{ fontSize: 8, fontFamily: "Urbanist_700Bold", color: C.light }}>GH₵{s.last}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Today's transactions ───────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: C.navy, fontFamily: "Urbanist_700Bold" }}>{"Today's Transactions"}</Text>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            accessibilityRole="button" accessibilityLabel="View all transactions">
            <Text style={{ fontSize: 11, color: C.blue, fontFamily: "Urbanist_600SemiBold" }}>View all</Text>
            <Icon name="chevron-right" size={13} color={C.blue} />
          </TouchableOpacity>
        </View>
        <View style={{ borderRadius: 20, overflow: "hidden", backgroundColor: C.white, borderWidth: 1, borderColor: C.border, ...sd(6, C.navy, 0.05) }}>
          {[
            { label: "Airtime", icon: "phone", color: C.blue, bg: "rgba(24,120,206,0.1)", tx: DASH.todayTransactions.airtime },
            { label: "Data Bundle", icon: "wifi", color: C.green, bg: "rgba(13,168,112,0.1)", tx: DASH.todayTransactions.data },
            { label: "MoMo Credit", icon: "arrow-down-left", color: C.green, bg: "rgba(13,168,112,0.1)", tx: DASH.todayTransactions.mobileMoneyCredit },
            { label: "MoMo Debit", icon: "arrow-up-right", color: C.orange, bg: "rgba(233,145,10,0.1)", tx: DASH.todayTransactions.mobileMoneyDebit },
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
                    <Text style={{ fontSize: 12, fontFamily: "Urbanist_600SemiBold", color: C.navy, marginBottom: hasActivity ? 5 : 0 }}>{row.label}</Text>
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
          <Text style={{ fontSize: 13, color: C.navy, fontFamily: "Urbanist_700Bold" }}>Sales by Channel</Text>
          <Text style={{ fontSize: 11, color: C.muted, fontFamily: "Urbanist_600SemiBold" }}>
            GH₵{channelTotal.toFixed(1)} total
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { label: "Web", icon: "globe", color: C.blue, bg: "rgba(24,120,206,0.1)", amount: DASH.webSales },
            { label: "API", icon: "code-2", color: C.purple, bg: "rgba(124,92,252,0.1)", amount: DASH.apiSales },
            { label: "Mobile App", icon: "layers", color: C.orange, bg: "rgba(233,145,10,0.1)", amount: DASH.mobileAppSales },
          ].map((ch) => {
            const pct = channelTotal > 0 ? Math.round((ch.amount / channelTotal) * 100) : 0;
            return (
              <View key={ch.label} style={{ flex: 1, borderRadius: 16, padding: 14, backgroundColor: C.white, borderWidth: 1, borderColor: C.border }}>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: ch.bg, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  <Icon name={ch.icon} size={15} color={ch.color} />
                </View>
                <Text style={{ fontSize: 14, fontFamily: "Urbanist_800ExtraBold", color: ch.amount > 0 ? C.navy : C.pale, marginBottom: 1 }}>
                  {ch.amount > 0 ? `GH₵${ch.amount}` : "—"}
                </Text>
                <Text style={{ fontSize: 9, fontFamily: "Urbanist_600SemiBold", color: C.muted, marginBottom: 8 }}>{ch.label}</Text>
                <View style={{ height: 3, borderRadius: 99, backgroundColor: C.divider, overflow: "hidden" }}>
                  <View style={{ width: `${pct}%`, height: 3, borderRadius: 99, backgroundColor: ch.color }} />
                </View>
                <Text style={{ fontSize: 8, fontFamily: "Urbanist_700Bold", color: C.light, marginTop: 4 }}>
                  {pct}% of total
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

