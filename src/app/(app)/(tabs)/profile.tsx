import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BadgeCheck, ChevronRight, LogOut, Pencil } from "lucide-react-native";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { MOCK_PROFILE_SECTIONS } from "@/mocks/services";
import { useAuth } from "@/store/auth.store";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <SafeAreaView style={PS.root} edges={["top"]}>
      <ScrollView style={PS.scroll} contentContainerStyle={PS.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Gradient header */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
          locations={[0, 0.46, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.15 }}
          style={PS.gradHeader}
        >
          <Text
            style={PS.gradTitle}
          >
            My Profile
          </Text>
          {/* Avatar + details */}
          <View style={PS.avatarRow}>
            <View style={PS.avatarWrap}>
              <View style={PS.avatarCircle}>
                <Text style={PS.avatarInitials}>{initials}</Text>
              </View>
              <View style={PS.editBadge}>
                <Pencil size={11} color="#fff" strokeWidth={2.5} />
              </View>
            </View>
            {/* Details */}
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text
                  style={{ ...T.headingMD, color: "#fff", fontFamily: "Urbanist_800ExtraBold" }}
                >
                  {user?.name ?? "User"}
                </Text>
                <BadgeCheck size={17} color={Colors.orange} />
              </View>
              <Text style={{ ...T.bodyMD, fontFamily: "Urbanist_600SemiBold", color: "rgba(255,255,255,0.85)" }}>
                {user?.phone ?? "+233 00 000 0000"}
              </Text>
              <Text style={{ ...T.bodySM, color: "rgba(255,255,255,0.65)" }}>
                {user?.email ?? "user@mpay.com"}
              </Text>
            </View>
          </View>
          {/* Stats row */}
          <View style={PS.statsRow}>
            {[
              { label: "Total Spent", value: "GHS340.00" },
              { label: "Transactions", value: "47" },
              { label: "Member Since", value: "Jan 2023" },
            ].map((stat, i) => (
              <View
                key={stat.label}
                style={[PS.statItem, i < 2 && PS.statBorder]}
              >
                <Text style={PS.statValue}>{stat.value}</Text>
                <Text style={PS.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Sections */}
        <View style={PS.sectionsArea}>
          {MOCK_PROFILE_SECTIONS.map((section) => (
            <View key={section.title}>
              <Text style={PS.sectionTitle}>{section.title.toUpperCase()}</Text>
              <View style={[PS.sectionCard, Shadows.subtle]}>
                {section.items.map((item, i) => (
                  <View key={item.label}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      style={PS.itemRow}
                    >
                      <View style={[PS.itemIcon, { backgroundColor: item.bg }]}>
                        <Icon name={item.iconName} size={17} color={item.color} />
                      </View>
                      <Text style={PS.itemLabel}>{item.label}</Text>
                      {item.badge ? (
                        <View style={[
                          PS.badge,
                          { backgroundColor: item.badge === "Verified" ? Colors.successBg : item.badge === "On" ? Colors.primaryLight : Colors.surfaceRaised },
                        ]}>
                          <Text style={[PS.badgeText, {
                            color: item.badge === "Verified" ? Colors.green : item.badge === "On" ? Colors.primary : Colors.textMuted,
                          }]}>{item.badge}</Text>
                        </View>
                      ) : (
                        <ChevronRight size={15} color={Colors.textDisabled} />
                      )}
                    </TouchableOpacity>
                    {i < section.items.length - 1 && (
                      <View style={PS.itemDivider} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Sign out */}
          <TouchableOpacity onPress={handleLogout} accessibilityRole="button"
            accessibilityLabel="Sign out" style={PS.signOutBtn}>
            <LogOut size={17} color={Colors.error} />
            <Text style={PS.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={PS.versionText}>M-Pay v1.0.0 · © 2025 M-Pay Inc.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PS = StyleSheet.create({
  root:        { flex: 1, backgroundColor: Colors.bg },
  scroll:      { flex: 1 },
  scrollContent: { paddingBottom: Spacing["3xl"] },
  gradHeader:  { overflow: "hidden", paddingBottom: Spacing["3xl"], paddingTop: Spacing.xl },
  gradTitle:   { ...T.headingMD, color: "#fff", fontFamily: "Urbanist_800ExtraBold", marginBottom: Spacing.xl, paddingHorizontal: Spacing["2xl"] },
  avatarRow:   { flexDirection: "row", alignItems: "center", gap: Spacing.lg, paddingHorizontal: Spacing["2xl"] },
  avatarWrap:  { position: "relative" },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "rgba(255,255,255,0.45)", backgroundColor: "rgba(255,255,255,0.2)",
  },
  avatarInitials: { fontSize: 26, fontFamily: "Urbanist_800ExtraBold", color: "#fff" },
  editBadge:   {
    position: "absolute", bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    backgroundColor: Colors.orange, borderWidth: 2, borderColor: "#fff",
  },
  statsRow:    {
    flexDirection: "row", marginHorizontal: Spacing["2xl"], marginTop: Spacing["2xl"],
    borderRadius: Radius.xl, overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.14)",
  },
  statItem:    { flex: 1, alignItems: "center", paddingVertical: 14 },
  statBorder:  { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.1)" },
  statValue:   { fontSize: 16, fontFamily: "Urbanist_800ExtraBold", color: "#fff" },
  statLabel:   { fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 3, textAlign: "center" },

  sectionsArea: { marginTop: Spacing.xl, gap: Spacing.xl, paddingHorizontal: Spacing.xl },
  sectionTitle: { ...T.label, color: Colors.textLight, marginBottom: Spacing.sm },
  sectionCard:  {
    borderRadius: Radius.lg, overflow: "hidden",
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  itemRow:     { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  itemIcon:    { width: 36, height: 36, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  itemLabel:   { flex: 1, ...T.bodyMD, fontFamily: "Urbanist_600SemiBold", color: Colors.textPrimary },
  itemDivider: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.lg },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  badgeText:   { ...T.caption, fontFamily: "Urbanist_700Bold" },

  signOutBtn:  {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, borderRadius: Radius.xl, borderWidth: 1.5,
    borderColor: Colors.errorBg, backgroundColor: Colors.errorBg, paddingVertical: Spacing.lg,
    marginTop: Spacing.xs,
  },
  signOutText: { ...T.bodyMD, fontFamily: "Urbanist_700Bold", color: Colors.error },
  versionText: { ...T.caption, color: Colors.textDisabled, textAlign: "center", marginTop: Spacing.xs },
});
