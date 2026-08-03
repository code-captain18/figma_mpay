import { NetworkLogo } from "@/components/svg/NetworkLogo";
import { GradientButton } from "@/components/ui/GradientButton";
import { ReceiptRows } from "@/components/ui/ReceiptRows";
import { NETWORKS, PRESET_AMOUNTS } from "@/constants/networks";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, PhoneCall } from "lucide-react-native";
import { useState } from "react";
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

type Step = "form" | "confirm" | "success";
type Recipient = "self" | "other";

export default function AirtimeScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [isProcessing, setIsProcessing] = useState(false);
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [recipient, setRecipient] = useState<Recipient>("self");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  const parsed = parseFloat(amount) || 0;
  const fee = parseFloat((parsed * 0.01).toFixed(2));
  const total = parseFloat((parsed + fee).toFixed(2));
  const canProceed = network && phone.trim().length >= 9 && parsed > 0;

  const receiptRows = [
    { label: "Network", value: network.label },
    { label: "Phone Number", value: `+233 ${phone}` },
    { label: "Amount", value: `GHS${parsed.toFixed(2)}` },
    { label: "Fee (1%)", value: `GHS${fee.toFixed(2)}` },
    { label: "Total", value: `GHS${total.toFixed(2)}`, green: true },
  ];

  const handleConfirmPurchase = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    // Simulate processing window to prevent accidental duplicate submissions.
    setTimeout(() => {
      setStep("success");
      setIsProcessing(false);
    }, 900);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.bg }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        {step === "form" ? (
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
            locations={[0, 0.42, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="px-5 pb-[18px] pt-3.5"
          >
            <View className="mb-[18px] flex-row items-center gap-3">
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
                  Airtime Top-Up
                </Text>
              </View>
            </View>

            <View className="flex-row gap-2.5">
              {NETWORKS.map((n) => {
                const active = network.id === n.id;
                return (
                  <TouchableOpacity
                    key={n.id}
                    onPress={() => setNetwork(n)}
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
                      {n.id === "airteltigo" ? "AT" : n.label}
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
            <View className="flex-1">
              <Text style={{ fontSize: 16, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: "#fff" }}>
                Airtime Top-Up
              </Text>
              <Text style={{ ...T.caption, color: "rgba(255,255,255,0.75)" }}>
                {step === "confirm" ? "Step 2 of 3" : "Done"}
              </Text>
            </View>
            <View className="flex-row gap-[5px]">
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
            className="flex-1"
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
                      backgroundColor: active ? "transparent" : "transparent",
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

            {/* Phone input */}
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
                onChangeText={setPhone}
                accessibilityLabel="Phone number"
              />
            </View>

            {/* Amount */}
            <Text style={{ fontSize: 12, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textSecondary, marginBottom: 12 }}>
              Select Amount (GHS)
            </Text>
            <View className="mb-4 flex-row flex-wrap gap-2.5">
              {PRESET_AMOUNTS.map((a) => {
                const active = amount === String(a);
                return (
                  <TouchableOpacity
                    key={a}
                    onPress={() => setAmount(String(a))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${a.toFixed(2)}`}
                    style={{
                      width: "31%",
                      alignItems: "center",
                      paddingVertical: 16,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: active ? Colors.blue : "#E7EEF9",
                      backgroundColor: active ? "transparent" : Colors.white,
                      overflow: "hidden",
                      ...(active ? Shadows.subtle : Shadows.subtle),
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
                        }}
                      />
                    ) : null}
                    <Text
                      style={{ fontSize: 14, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: active ? Colors.white : Colors.textPrimary }}
                    >
                      {a.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E7EEF9",
                backgroundColor: Colors.white,
                paddingHorizontal: 16,
                height: 52,
                gap: 8,
                marginBottom: 22,
                ...Shadows.subtle,
              }}
            >
              <Text style={{ ...T.bodyLG, fontFamily: "Urbanist_700Bold", color: Colors.textMuted }}>GHS</Text>
              <TextInput
                style={{ flex: 1, fontSize: 14, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: Colors.textPrimary }}
                placeholder="Custom amount"
                placeholderTextColor={Colors.pale}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                accessibilityLabel="Custom amount"
              />
            </View>
            {parsed > 0 && (
              <Text style={{ fontSize: 11, fontWeight: "600", fontFamily: "Urbanist_600SemiBold", color: Colors.primary, marginBottom: 20 }}>
                Fee: GHS{fee.toFixed(2)} · Total: GHS{total.toFixed(2)}
              </Text>
            )}

            <View style={{ marginTop: 6 }}>
              <GradientButton
                label="Continue to Review"
                disabled={!canProceed}
                onPress={() => setStep("confirm")}
              />
            </View>
          </ScrollView>
        )}

        {step === "confirm" && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Summary card */}
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
                <PhoneCall size={24} color="#fff" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: "600", fontFamily: "Urbanist_600SemiBold", color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
                You are topping up
              </Text>
              <Text style={{ fontSize: 32, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: "#fff" }}>
                GHS{parsed.toFixed(2)}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "700", fontFamily: "Urbanist_700Bold", color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
                {network.label} · +233 {phone}
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
              label={isProcessing ? "Processing..." : "Confirm & Buy"}
              disabled={isProcessing}
              onPress={handleConfirmPurchase}
            />
            <TouchableOpacity
              onPress={() => setStep("form")}
              accessibilityRole="button"
              accessibilityLabel="Edit details"
              className="mt-3.5 items-center"
            >
              <Text style={{ ...T.bodyMD, fontFamily: "Urbanist_600SemiBold", color: Colors.textMuted }}>Edit Details</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {step === "success" && (
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
            {/* Success icon */}
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
              Top-Up Successful!
            </Text>
            <Text style={{ fontSize: 14, fontFamily: "Urbanist_400Regular", color: Colors.textMuted, marginBottom: 32, textAlign: "center" }}>
              GHS{parsed.toFixed(2)} airtime sent to {network.label} +233 {phone}
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
            <View className="self-stretch gap-2.5">
              <GradientButton label="Done" onPress={() => router.back()} />
              <TouchableOpacity
                onPress={() => {
                  setStep("form");
                  setPhone("");
                  setAmount("");
                }}
                accessibilityRole="button"
                accessibilityLabel="Buy Again"
                style={{
                  alignItems: "center",
                  paddingVertical: 14,
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: Colors.border,
                  backgroundColor: Colors.white,
                }}
              >
                <Text style={{ ...T.bodyMD, fontFamily: "Urbanist_700Bold", color: Colors.textPrimary }}>Buy Again</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
