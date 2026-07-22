import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Search, X } from "lucide-react-native";

import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import {
  MOCK_FEATURED_OFFERS,
  MOCK_SERVICE_CATEGORIES,
} from "@/mocks/services";
import { Colors } from "@/theme/colors";
import { shadowStyle } from "@/theme/shadows";

export default function ServicesScreen() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const allServices = MOCK_SERVICE_CATEGORIES.flatMap((c) =>
    c.services.map((s) => ({ ...s, cat: c.title }))
  );
  const results =
    query.length > 0
      ? allServices.filter((s) =>
          s.label.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.bg }} edges={["top"]}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="overflow-hidden px-6 pb-6 pt-5"
      >
        <View
          className="absolute -right-8 -top-6 h-[140px] w-[140px] rounded-full bg-white/10"
        />
        <Text className="mb-0.5 text-xs font-semibold text-white/60">
          M-PAY
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 16,
            fontFamily: "Urbanist_800ExtraBold",
          }}
        >
          Services
        </Text>
        <View
          className="h-[46px] flex-row items-center gap-2.5 rounded-2xl border-[1.5px] border-white/20 bg-white/15 px-4"
        >
          <Search size={15} color="rgba(255,255,255,0.7)" />
          <TextInput
            className="flex-1 text-sm text-white"
            placeholder="Search services…"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search services"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <X size={14} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {query.length > 0 ? (
          <View
            style={{
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: Colors.white,
              borderWidth: 1,
              borderColor: "rgba(24,120,206,0.08)",
              ...shadowStyle(0.06, 12),
            }}
          >
            {results.length === 0 ? (
              <View
                className="items-center justify-center gap-2 py-10"
              >
                <Search size={22} color={Colors.pale} />
                <Text className="text-xs font-semibold" style={{ color: Colors.light }}>
                  No services found
                </Text>
              </View>
            ) : (
              results.map((s, i) => (
                <View key={s.label}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={s.label}
                    className="flex-row items-center gap-3 px-4 py-3.5"
                  >
                    <View
                      className="h-9 w-9 items-center justify-center rounded-xl"
                      style={{ backgroundColor: s.bg }}
                    >
                      <Icon name={s.iconName} size={18} color={s.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold" style={{ color: Colors.navy }}>
                        {s.label}
                      </Text>
                      <Text className="text-[10px]" style={{ color: Colors.light }}>{s.cat}</Text>
                    </View>
                    <ChevronRight size={14} color={Colors.pale} />
                  </TouchableOpacity>
                  {i < results.length - 1 && (
                    <View className="mx-4 h-px" style={{ backgroundColor: Colors.divider }} />
                  )}
                </View>
              ))
            )}
          </View>
        ) : (
          <>
            {/* Featured Offers */}
            <View className="mb-5">
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  color: Colors.light,
                  marginBottom: 12,
                }}
              >
                FEATURED OFFERS
              </Text>
              <View className="flex-row gap-3">
                {MOCK_FEATURED_OFFERS.map((offer) => (
                  <TouchableOpacity
                    key={offer.label}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={offer.label}
                    style={{
                      flex: 1,
                      borderRadius: 16,
                      padding: 16,
                      backgroundColor: `${offer.color}0D`,
                      borderWidth: 1,
                      borderColor: `${offer.color}22`,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        backgroundColor: `${offer.color}18`,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                      }}
                    >
                      <Icon name={offer.iconName} size={20} color={offer.color} />
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "800",
                        color: Colors.navy,
                        marginBottom: 4,
                      }}
                    >
                      {offer.label}
                    </Text>
                    <Text style={{ fontSize: 10, color: Colors.muted, lineHeight: 14 }}>
                      {offer.sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Service Categories */}
            {MOCK_SERVICE_CATEGORIES.map((cat) => (
              <View key={cat.title} className="mb-5">
                <View
                  className="mb-3 flex-row items-center gap-2"
                >
                  <View className="h-4 w-1 rounded" style={{ backgroundColor: cat.color }} />
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 1.2,
                      color: Colors.navy,
                    }}
                  >
                    {cat.title.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {cat.services.map((svc) => (
                    <TouchableOpacity
                      key={svc.label}
                      onPress={() => {
                        if (svc.label === "Airtime Top-Up") router.push("/(app)/airtime");
                        else if (svc.label === "Data Bundle") router.push("/(app)/data-bundle");
                      }}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={svc.label}
                      style={{
                        width: "48%",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        backgroundColor: Colors.white,
                        borderWidth: 1,
                        borderColor: "rgba(24,120,206,0.08)",
                        ...shadowStyle(0.04, 8),
                      }}
                    >
                      {svc.badge && (
                        <View
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -4,
                            borderRadius: 99,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            backgroundColor: svc.badge === "New" ? Colors.blue : Colors.orange,
                          }}
                        >
                          <Text style={{ fontSize: 8, fontWeight: "700", color: "#fff" }}>
                            {svc.badge}
                          </Text>
                        </View>
                      )}
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          backgroundColor: svc.bg,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name={svc.iconName} size={18} color={svc.color} />
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 12,
                          fontWeight: "700",
                          color: Colors.navy,
                        }}
                        numberOfLines={2}
                      >
                        {svc.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
