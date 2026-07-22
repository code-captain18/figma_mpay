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
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.bg }} edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient header */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
          locations={[0, 0.46, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.15 }}
          className="overflow-hidden pb-10 pt-5"
        >
          <Text
            className="mb-5 px-6 text-left text-base font-extrabold text-white"
            style={{ fontFamily: "Urbanist_800ExtraBold" }}
          >
            My Profile
          </Text>
          {/* Avatar */}
          <View className="flex-row items-center gap-4 px-6">
            {/* Avatar */}
            <View className="relative">
              <View
                className="h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white/45 bg-white/20"
              >
                <Text
                  className="text-[26px] font-extrabold text-white"
                  style={{ fontFamily: "Urbanist_800ExtraBold" }}
                >
                  {initials}
                </Text>
              </View>
              {/* Edit button */}
              <View
                className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full border-2 border-white"
                style={{ backgroundColor: Colors.orange }}
              >
                <Pencil size={11} color="#fff" strokeWidth={2.5} />
              </View>
            </View>
            {/* Details */}
            <View className="flex-1 gap-0.5">
              <View className="flex-row items-center gap-1.5">
                <Text
                  className="text-lg font-extrabold text-white"
                  style={{ fontFamily: "Urbanist_800ExtraBold" }}
                >
                  {user?.name ?? "User"}
                </Text>
                <BadgeCheck size={17} color={Colors.orange} />
              </View>
              <Text className="text-[13px] font-semibold text-white/85">
                {user?.phone ?? "+233 00 000 0000"}
              </Text>
              <Text className="text-xs text-white/65">
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
        <View className="mt-5 gap-5 px-5">
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
                      className="flex-row items-center gap-3 px-4 py-3.5"
                    >
                      <View
                        className="h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: item.bg }}
                      >
                        <Icon name={item.iconName} size={17} color={item.color} />
                      </View>
                      <Text className="flex-1 text-sm font-semibold" style={{ color: Colors.navy }}>
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
                      <View className="mx-4 h-px" style={{ backgroundColor: Colors.divider }} />
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
            className="mt-1 flex-row items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-[#E8334A24] bg-[#E8334A12] py-4"
          >
            <LogOut size={17} color={Colors.red} />
            <Text className="text-sm font-bold" style={{ color: Colors.red }}>Sign Out</Text>
          </TouchableOpacity>

          <Text className="mt-1 text-center text-[10px]" style={{ color: Colors.pale }}>
            M-Pay v1.0.0 · © 2025 M-Pay Inc.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
