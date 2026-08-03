import { formatGHS } from "@/utils/format";
import { ghanaPhoneSchema } from "@/utils/phone";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Wifi } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientButton } from "@/components/ui/GradientButton";
import { ReceiptRows } from "@/components/ui/ReceiptRows";
import { NetworkLogo } from "@/components/svg/NetworkLogo";
import { BUNDLE_DURATIONS, DATA_BUNDLES } from "@/constants/bundles";
import { NETWORKS } from "@/constants/networks";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";
import type { Bundle, BundleDuration } from "@/types";

type Step = "form" | "confirm" | "success";
type Recipient = "self" | "other";

export default function DataBundleScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [isProcessing, setIsProcessing] = useState(false);
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [recipient, setRecipient] = useState<Recipient>("self");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [duration, setDuration] = useState<BundleDuration>("Daily");
  const [selected, setSelected] = useState<Bundle | null>(null);

  const bundles = DATA_BUNDLES[duration] ?? [];
  const canProceed = network && ghanaPhoneSchema.safeParse(phone.trim()).success && selected !== null;

  const receiptRows = selected
    ? [
        { label: "Network", value: network.label },
        { label: "Phone Number", value: `+233 ${phone}` },
        { label: "Bundle", value: `${selected.size} – ${selected.validity}` },
        { label: "Price", value: formatGHS(selected.price), green: true },
      ]
    : [];

  const handleConfirmActivation = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    // Simulate processing window to prevent accidental duplicate submissions.
    setTimeout(() => {
      setStep("success");
      setIsProcessing(false);
    }, 900);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        {step === "form" ? (
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
            locations={[0, 0.42, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                <ArrowLeft size={18} color="#fff" />
              </TouchableOpacity>
              <View>
                <Text style={{ fontSize: 12, fontWeight: "600", fontFamily: "Urbanist_600SemiBold", color: "rgba(255,255,255,0.6)" }}>
                  Services
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: "#fff" }}>
                  Data Bundle
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              {NETWORKS.map((n) => {
                const active = network.id === n.id;
                return (
                  <TouchableOpacity
                    key={n.id}
                    onPress={() => {
                      setNetwork(n);
                      setSelected(null);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={n.label}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      paddingVertical: 14,
                      borderRadius: 18,
                      borderWidth: active ? 2 : 0,
                      borderColor: active ? Colors.orange : "transparent",
                      backgroundColor: active ? Colors.white : "rgba(255,255,255,0.14)",
                    }}
                  >
                    <NetworkLogo id={n.id} size={26} />
                    <Text style={{ fontSize: 11, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: active ? Colors.navy : "rgba(255,255,255,0.8)" }}>
                      {n.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
            locations={[0, 0.42, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => setStep("form")}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.12)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <ArrowLeft size={16} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: "#fff" }}>
                Data Bundle
              </Text>
              <Text style={{ ...T.caption, color: "rgba(255,255,255,0.75)" }}>
                {step === "confirm" ? "Step 2 of 3" : "Done"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 5 }}>
              {(["form", "confirm", "success"] as Step[]).map((s) => (
                <View
                  key={s}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      step === s ||
                      (s === "form" && ["confirm", "success"].includes(step)) ||
                      (s === "confirm" && step === "success")
                        ? "#fff"
                        : "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </View>
          </LinearGradient>
        )}

        {step === "form" && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Recipient toggle */}
            <View
              style={{
                flexDirection: "row",
                borderRadius: 18,
                padding: 4,
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: "#E7EEF9",
                marginBottom: 24,
                ...Shadows.subtle,
              }}
            >
              {(["self", "other"] as Recipient[]).map((r) => {
                const active = recipient === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRecipient(r)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={r === "self" ? "For Myself" : "For Others"}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 15,
                      alignItems: "center",
                      backgroundColor: "transparent",
                      overflow: "hidden",
                    }}
                  >
                    {active ? (
                      <LinearGradient
                        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                        locations={[0, 0.42, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 13,
                        }}
                      />
                    ) : null}
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        fontFamily: "Urbanist_700Bold",
                        color: active ? Colors.white : Colors.textLight,
                      }}
                    >
                      {r === "self" ? "For Myself" : "For Others"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Phone */}
            <Text style={{ fontSize: 12, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textSecondary, marginBottom: 12 }}>
              Phone Number
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E7EEF9",
                backgroundColor: Colors.white,
                overflow: "hidden",
                marginBottom: 26,
                ...Shadows.subtle,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 16,
                  borderRightWidth: 1,
                  borderRightColor: Colors.divider,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textPrimary }}>GH</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textPrimary }}>+233</Text>
              </View>
              <TextInput
                style={{ flex: 1, paddingHorizontal: 14, fontSize: 14, fontFamily: "Urbanist_400Regular", color: Colors.textPrimary }}
                placeholder="24 000 0000"
                placeholderTextColor={Colors.pale}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(v) => { setPhone(v); if (phoneError) setPhoneError(""); }}
                onBlur={() => { const r = ghanaPhoneSchema.safeParse(phone.trim()); if (!r.success) setPhoneError(r.error.errors[0].message); }}
                accessibilityLabel="Phone number"
              />
            </View>
            {phoneError ? <Text style={{ color: "#E8334A", fontSize: 12, marginTop: 4, marginLeft: 4 }}>{phoneError}</Text> : null}

            {/* Duration tabs */}
            <Text style={{ fontSize: 12, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textSecondary, marginBottom: 12 }}>
              Validity
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
              {BUNDLE_DURATIONS.map((d) => {
                const active = duration === d;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => {
                      setDuration(d);
                      setSelected(null);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={d}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      alignItems: "center",
                      borderWidth: active ? 0 : 1,
                      borderColor: active ? "transparent" : "#E7EEF9",
                      backgroundColor: active ? "transparent" : Colors.white,
                      overflow: "hidden",
                    }}
                  >
                    {active ? (
                      <LinearGradient
                        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
                        locations={[0, 0.42, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 14,
                        }}
                      />
                    ) : null}
                    <Text
                      style={{ ...T.bodySM, fontFamily: "Urbanist_700Bold", color: active ? Colors.white : Colors.textMuted }}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bundle grid */}
            <Text style={{ fontSize: 12, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textSecondary, marginBottom: 10 }}>
              Choose Bundle
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
              {bundles.map((b) => {
                const active = selected?.id === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setSelected(b)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${b.size} for GHS${b.price}`}
                    style={{
                      width: "48%",
                      borderRadius: 18,
                      paddingHorizontal: 14,
                      paddingTop: 14,
                      paddingBottom: 16,
                      borderWidth: 1,
                      borderColor: active ? Colors.blue : "#E7EEF9",
                      backgroundColor: active ? "#EEF4FF" : Colors.white,
                      ...Shadows.subtle,
                    }}
                  >
                    {b.tag ? (
                      <View
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -2,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 99,
                          backgroundColor: Colors.orange,
                        }}
                      >
                        <Text style={{ fontSize: 9, fontWeight: "700", color: "#fff" }}>{b.tag}</Text>
                      </View>
                    ) : null}

                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "rgba(13,168,112,0.12)",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                      }}
                    >
                      <Wifi size={16} color={Colors.green} />
                    </View>
                    <Text
                      style={{ fontSize: 16, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: active ? "#fff" : Colors.textPrimary }}
                    >
                      {b.size}
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: "600", fontFamily: "Urbanist_600SemiBold", color: active ? "rgba(255,255,255,0.65)" : Colors.textLight, marginTop: 3 }}>
                      {b.validity}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: active ? "#fff" : Colors.blue, marginTop: 8 }}>
                      {formatGHS(b.price)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ marginTop: 6 }}>
              <GradientButton
                label={selected ? "Continue to Review" : "Select a Bundle"}
                disabled={!canProceed}
                onPress={() => setStep("confirm")}
              />
            </View>
          </ScrollView>
        )}

        {step === "confirm" && selected && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
              locations={[0, 0.42, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 24 }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Wifi size={26} color="#fff" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: "600", fontFamily: "Urbanist_600SemiBold", color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
                Activating bundle
              </Text>
              <Text style={{ fontSize: 32, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: "#fff" }}>
                {selected.size}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
                {network.label} · +233 {phone} · {selected.validity}
              </Text>
            </LinearGradient>
            <View
              style={{
                borderRadius: 16,
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: "rgba(24,120,206,0.08)",
                padding: 20,
                marginBottom: 24,
                ...Shadows.subtle,
              }}
            >
              <ReceiptRows rows={receiptRows} />
            </View>
            <GradientButton
              label={isProcessing ? "Processing..." : "Confirm & Activate"}
              disabled={isProcessing}
              onPress={handleConfirmActivation}
            />
            <TouchableOpacity
              onPress={() => setStep("form")}
              accessibilityRole="button"
              accessibilityLabel="Edit details"
              style={{ alignItems: "center", marginTop: 14 }}
            >
              <Text style={{ ...T.bodyMD, fontFamily: "Urbanist_600SemiBold", color: Colors.textMuted }}>Edit Details</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {step === "success" && selected && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 40,
              paddingBottom: 40,
              alignItems: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "rgba(13,168,112,0.12)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                borderWidth: 3,
                borderColor: "rgba(13,168,112,0.25)",
              }}
            >
              <Check size={42} color={Colors.green} strokeWidth={2.5} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: Colors.textPrimary, marginBottom: 6 }}>
              Bundle Activated!
            </Text>
            <Text style={{ fontSize: 14, fontFamily: "Urbanist_400Regular", color: Colors.textMuted, marginBottom: 32, textAlign: "center" }}>
              {selected.size} data activated on {network.label} +233 {phone}
            </Text>
            <View
              style={{
                alignSelf: "stretch",
                borderRadius: 16,
                backgroundColor: Colors.white,
                borderWidth: 1,
                borderColor: "rgba(24,120,206,0.08)",
                padding: 20,
                marginBottom: 28,
                ...Shadows.subtle,
              }}
            >
              <ReceiptRows rows={receiptRows} />
            </View>
            <View style={{ alignSelf: "stretch", gap: 10 }}>
              <GradientButton label="Done" onPress={() => router.back()} />
              <TouchableOpacity
                onPress={() => {
                  setStep("form");
                  setPhone("");
                  setSelected(null);
                }}
                accessibilityRole="button"
                accessibilityLabel="Buy Another Bundle"
                style={{
                  alignItems: "center",
                  paddingVertical: 14,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: Colors.border,
                  backgroundColor: Colors.white,
                }}
              >
                <Text style={{ ...T.bodyMD, fontFamily: "Urbanist_700Bold", color: Colors.textPrimary }}>
                  Buy Another Bundle
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
