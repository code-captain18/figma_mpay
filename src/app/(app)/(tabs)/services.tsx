import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ChevronRight, Search, X } from "lucide-react-native";

import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import {
  MOCK_FEATURED_OFFERS,
  MOCK_SERVICE_CATEGORIES,
} from "@/mocks/services";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";

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
    <SafeAreaView style={SS.root} edges={["top"]}>
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
        <Text style={{ fontSize: 12, fontWeight: "600", fontFamily: "Urbanist_600SemiBold", color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>
          M-PAY
        </Text>
        <Text
          style={{ fontSize: 20, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: "#fff", marginBottom: Spacing.lg }}
        >
          Services
        </Text>
        <View
          className="h-[46px] flex-row items-center gap-2.5 rounded-2xl border-[1.5px] border-white/20 bg-white/15 px-4"
        >
          <Search size={15} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={{ flex: 1, fontSize: 14, fontFamily: "Urbanist_400Regular", color: "#fff" }}
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
        style={SS.scroll}
        contentContainerStyle={SS.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {query.length > 0 ? (
          <View style={[SS.searchResultsCard, Shadows.subtle]}>
            {results.length === 0 ? (
              <View style={SS.emptySearch}>
                <Search size={22} color={Colors.textDisabled} />
                <Text style={SS.emptySearchText}>No services found</Text>
              </View>
            ) : (
              results.map((s, i) => (
                <View key={s.label}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={s.label}
                      style={SS.searchResultItem}
                    >
                      <View style={[SS.searchResultIcon, { backgroundColor: s.bg }]}>
                        <Icon name={s.iconName} size={18} color={s.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={SS.searchResultLabel}>{s.label}</Text>
                        <Text style={SS.searchResultCat}>{s.cat}</Text>
                      </View>
                      <ChevronRight size={14} color={Colors.textDisabled} />
                    </TouchableOpacity>
                    {i < results.length - 1 && <View style={SS.resultDivider} />}
                </View>
              ))
            )}
          </View>
        ) : (
          <>
            {/* Featured Offers */}
            <View style={SS.featuredSection}>
              <Text style={SS.categoryHeader}>FEATURED OFFERS</Text>
              <View style={SS.featuredRow}>
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
                      style={{ fontSize: 12, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: Colors.textPrimary, marginBottom: 4 }}
                    >
                      {offer.label}
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: "Urbanist_400Regular", color: Colors.textMuted, lineHeight: 14 }}>
                      {offer.sub}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Service Categories */}
            {MOCK_SERVICE_CATEGORIES.map((cat) => (
              <View key={cat.title} style={SS.catSection}>
                <View style={SS.catTitleRow}>
                  <View style={[SS.catBar, { backgroundColor: cat.color }]} />
                  <Text style={SS.catTitle}>{cat.title.toUpperCase()}</Text>
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
                      style={[SS.svcCard, Shadows.subtle]}
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
                            backgroundColor: svc.badge === "New" ? Colors.primary : Colors.orange,
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
                          fontFamily: "Urbanist_700Bold",
                          color: Colors.textPrimary,
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

const SS = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing["2xl"] },

  // Search results
  searchResultsCard: {
    borderRadius: Radius.lg, overflow: "hidden",
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  emptySearch: { alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: Spacing["3xl"] },
  emptySearchText: { ...T.bodySM, fontFamily: "Urbanist_600SemiBold", color: Colors.textLight },
  searchResultItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  searchResultIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  searchResultLabel: { ...T.bodyMD, fontFamily: "Urbanist_600SemiBold", color: Colors.textPrimary },
  searchResultCat:   { ...T.caption, color: Colors.textLight },
  resultDivider:     { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.lg },

  // Featured
  featuredSection: { marginBottom: Spacing.xl },
  categoryHeader:  { fontSize: 10, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textLight, letterSpacing: 1.5, marginBottom: Spacing.md },
  featuredRow:     { flexDirection: "row", gap: 12 },

  // Categories
  catSection: { marginBottom: Spacing.xl },
  catTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  catBar:      { width: 4, height: 16, borderRadius: 2 },
  catTitle:    { fontSize: 10, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textPrimary, letterSpacing: 1.2 },

  // Service card (2-col grid)
  svcCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
