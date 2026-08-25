import { apiPurchaseData } from "@/api";
import { ContactPickerSheet } from "@/components/contacts/ContactPickerSheet";
import { SaveFavoriteRow } from "@/components/contacts/SaveFavoriteRow";
import { NetworkLogo } from "@/components/svg/NetworkLogo";
import { GradientButton } from "@/components/ui/GradientButton";
import { ReceiptRows } from "@/components/ui/ReceiptRows";
import { BUNDLE_DURATIONS, DATA_BUNDLES } from "@/constants/bundles";
import { NETWORKS } from "@/constants/networks";
import { useContactPicker } from "@/features/contacts/hooks";
import { QK, useResellerProducts } from "@/hooks/useAppQueries";
import { useAuth } from "@/store/auth.store";
import { useToast } from "@/store/toast.store";
import { Colors, Shadows, T } from "@/theme";
import type { Bundle, BundleDuration } from "@/types";
import { formatGHS } from "@/utils/format";
import { ghanaPhoneSchema } from "@/utils/phone";
import { pollTransactionStatus } from "@/utils/pollStatus";
import { genMsRef } from "@/utils/ref";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Check, UserRound, Wifi } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "form" | "confirm" | "processing" | "success";
type Recipient = "self" | "other";

export default function DataBundleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isAssistant = user?.accountType?.toLowerCase() === 'assistant';
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: products = [] } = useResellerProducts();
  const [step, setStep] = useState<Step>("form");
  const [isProcessing, setIsProcessing] = useState(false);
  const [txRef, setTxRef] = useState(genMsRef);
  const network = NETWORKS[0];
  const [recipient, setRecipient] = useState<Recipient>("self");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [duration, setDuration] = useState<BundleDuration>("Daily");
  const [selected, setSelected] = useState<Bundle | null>(null);
  const { state: contactState, openPicker: openContactPicker, dismiss: dismissContacts, showPermissionAlert } = useContactPicker();

  const handleContactPress = useCallback(() => {
    if (contactState.phase === 'denied') {
      showPermissionAlert();
    } else {
      openContactPicker();
    }
  }, [contactState.phase, openContactPicker, showPermissionAlert]);

  // Prefer real API bundles; fall back to local constants if products not loaded yet
  const apiProduct = products.find(
    p => p.network.toUpperCase() === network.id.toUpperCase() && p.Type === 'Data'
  );
  const sanitize = (v: string | null | undefined) =>
    v && v !== 'undefined' && v !== 'null' ? v : '';

  const bundles: Bundle[] = apiProduct?.bundles?.length
    ? apiProduct.bundles.map(b => ({
      id: b.BundleCode,
      size: sanitize(b.BundleName),
      validity: sanitize(b.Validity),
      price: b.Amount ?? 0,
      bundleCode: b.BundleCode,
      bundleType: b.BundleType,
      prodCode: apiProduct.prodCode,
    }))
    : (DATA_BUNDLES[duration] ?? []);
  const canProceed = network && ghanaPhoneSchema.safeParse(phone.trim()).success && selected !== null;

  const receiptRows = selected
    ? [
      { label: "Network", value: network.label },
      { label: "Phone Number", value: `+233 ${phone}` },
      { label: "Bundle", value: `${selected.size} – ${selected.validity}` },
      { label: "Price", value: formatGHS(selected.price), green: true },
    ]
    : [];

  const handleConfirmActivation = async () => {
    if (isProcessing || !selected) return;
    setIsProcessing(true);
    const prodCode = selected.prodCode ?? apiProduct?.prodCode ?? `${network.id.toUpperCase()}DATA`;
    try {
      await apiPurchaseData({
        amount: selected.price,
        phoneNumber: phone,
        product: prodCode,
        bundleType: selected.bundleType ?? 'data_bundle',
        bundleCode: selected.bundleCode ?? selected.id,
        referenceId: txRef,
        transactionDescription: `Data bundle for ${prodCode}`,
        ...(isAssistant && user?.accountId && {
          reselleraccountId: user.accountId,
          resellerAccountId: user.accountId,
          resellerId: user.accountId,
          resellerid: user.accountId,
        }),
      });
      setStep("processing");
      await pollTransactionStatus(txRef);
      setStep("success");
      queryClient.invalidateQueries({ queryKey: QK.walletBalances });
      queryClient.invalidateQueries({ queryKey: QK.transactions });
      queryClient.invalidateQueries({ queryKey: QK.recentTransactions(5) });
    } catch (err: any) {
      setTxRef(genMsRef());
      setStep('confirm');
      toast.show(err?.message ?? 'Data bundle purchase failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
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

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}>
              <NetworkLogo id={network.id} size={32} />
              <View>
                <Text style={{ fontSize: 15, fontWeight: "800", fontFamily: "Urbanist_800ExtraBold", color: Colors.white }}>
                  {network.label}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: "Urbanist_400Regular", color: "rgba(255,255,255,0.65)" }}>
                  Data bundles available
                </Text>
              </View>
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
                marginBottom: 8,
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
              <TouchableOpacity
                onPress={handleContactPress}
                activeOpacity={0.7}
                style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', marginRight: 6 }}
                accessibilityRole="button"
                accessibilityLabel="Choose from contacts"
              >
                {contactState.phase === 'loading'
                  ? <ActivityIndicator size="small" color={Colors.primary} />
                  : <UserRound size={20} color={Colors.primary} />}
              </TouchableOpacity>
            </View>
            {phoneError ? <Text style={{ color: "#E8334A", fontSize: 12, marginBottom: 4, marginLeft: 4 }}>{phoneError}</Text> : null}
            {ghanaPhoneSchema.safeParse(phone.trim()).success && recipient === "other" && (
              <View style={{ marginBottom: 14 }}>
                <SaveFavoriteRow phoneNumber={phone.trim()} />
              </View>
            )}
            {!ghanaPhoneSchema.safeParse(phone.trim()).success && <View style={{ marginBottom: 14 }} />}

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
              accessibilityHint="Confirms and activates the selected data bundle"
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

        {step === "processing" && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <ActivityIndicator size="large" color={Colors.gradientStart} />
            <Text style={{ ...T.bodyMD, color: Colors.textMuted, fontFamily: 'Urbanist_600SemiBold' }}>
              Processing transaction…
            </Text>
            <Text style={{ ...T.bodySM, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 32 }}>
              Please keep the app open. This may take up to 2 minutes.
            </Text>
          </View>
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
      <ContactPickerSheet
        visible={contactState.phase === 'ready'}
        contacts={contactState.phase === 'ready' ? contactState.contacts : []}
        onSelect={(num) => { setPhone(num); setPhoneError(''); dismissContacts(); }}
        onClose={dismissContacts}
      />
    </SafeAreaView>
  );
}
