import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BadgeCheck, ChevronRight, LogOut, Pencil } from "lucide-react-native";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { MOCK_PROFILE_SECTIONS } from "@/mocks/services";
import { useAuth } from "@/store/auth.store";
import { Colors } from "@/theme/colors";
import { shadowStyle } from "@/theme/shadows";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient header */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
          locations={[0, 0.46, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.15 }}
          style={{ overflow: "hidden", paddingBottom: 40, paddingTop: 20 }}
        >
          <Text
            style={{ marginBottom: 20, paddingHorizontal: 24, textAlign: "left", fontSize: 16, fontWeight: "800", color: "#fff", fontFamily: "Urbanist_800ExtraBold" }}
          >
            My Profile
          </Text>
          {/* Avatar */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 24 }}>
            {/* Avatar */}
            <View style={{ position: "relative" }}>
              <View style={{ height: 72, width: 72, alignItems: "center", justifyContent: "center", borderRadius: 999, borderWidth: 3, borderColor: "rgba(255,255,255,0.45)", backgroundColor: "rgba(255,255,255,0.2)" }}>
                <Text
                  style={{ fontSize: 26, fontWeight: "800", color: "#fff", fontFamily: "Urbanist_800ExtraBold" }}
                >
                  {initials}
                </Text>
              </View>
              {/* Edit button */}
              <View style={{ position: "absolute", bottom: 0, right: 0, height: 24, width: 24, alignItems: "center", justifyContent: "center", borderRadius: 999, borderWidth: 2, borderColor: "#fff", backgroundColor: Colors.orange }}>
                <Pencil size={11} color="#fff" strokeWidth={2.5} />
              </View>
            </View>
            {/* Details */}
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "800", color: "#fff", fontFamily: "Urbanist_800ExtraBold" }}
                >
                  {user?.name ?? "User"}
                </Text>
                <BadgeCheck size={17} color={Colors.orange} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.85)" }}>
                {user?.phone ?? "+233 00 000 0000"}
              </Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                {user?.email ?? "user@mpay.com"}
              </Text>
            </View>
          </View>
          {/* Stats row */}
          <View
            style={{
              flexDirection: "row",
              marginHorizontal: 24,
              marginTop: 24,
              borderRadius: 18,
              overflow: "hidden",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.14)",
            }}
          >
            {[
              { label: "Total Spent", value: "GHS340.00" },
              { label: "Transactions", value: "47" },
              { label: "Member Since", value: "Jan 2023" },
            ].map((stat, i) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 14,
                  borderRightWidth: i < 2 ? 1 : 0,
                  borderRightColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: "#fff",
                    fontFamily: "Urbanist_800ExtraBold",
                  }}
                >
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 3, textAlign: "center" }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Sections */}
        <View style={{ marginTop: 20, gap: 20, paddingHorizontal: 20 }}>
          {MOCK_PROFILE_SECTIONS.map((section) => (
            <View key={section.title}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  color: Colors.light,
                  marginBottom: 10,
                }}
              >
                {section.title.toUpperCase()}
              </Text>
              <View
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: "rgba(24,120,206,0.08)",
                  ...shadowStyle(0.04, 10),
                }}
              >
                {section.items.map((item, i) => (
                  <View key={item.label}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
                    >
                      <View style={{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: item.bg }}>
                        <Icon name={item.iconName} size={17} color={item.color} />
                      </View>
                      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: Colors.navy }}>
                        {item.label}
                      </Text>
                      {item.badge ? (
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 99,
                            backgroundColor:
                              item.badge === "Verified"
                                ? "rgba(13,168,112,0.12)"
                                : item.badge === "On"
                                ? "rgba(24,120,206,0.12)"
                                : "rgba(92,122,158,0.1)",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color:
                                item.badge === "Verified"
                                  ? Colors.green
                                  : item.badge === "On"
                                  ? Colors.blue
                                  : Colors.muted,
                            }}
                          >
                            {item.badge}
                          </Text>
                        </View>
                      ) : (
                        <ChevronRight size={15} color={Colors.pale} />
                      )}
                    </TouchableOpacity>
                    {i < section.items.length - 1 && (
                      <View style={{ marginHorizontal: 16, height: 1, backgroundColor: Colors.divider }} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Sign out */}
          <TouchableOpacity
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            style={{ marginTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, borderWidth: 1.5, borderColor: "#E8334A24", backgroundColor: "#E8334A12", paddingVertical: 16 }}
          >
            <LogOut size={17} color={Colors.red} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.red }}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={{ marginTop: 4, textAlign: "center", fontSize: 10, color: Colors.pale }}>
            M-Pay v1.0.0 · © 2025 M-Pay Inc.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
