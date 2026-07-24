import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema";
import { Colors, Radius, Shadows, Spacing } from "@/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Eye, EyeOff, Fingerprint, Lock, User } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateSignup: () => void;
}

export function LoginForm({ onSuccess, onNavigateSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [credFocus, setCredFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (_values: LoginFormValues) => { onSuccess(); };
  const appLogo = require("../../../../assets/logo.png");

  return (
    <View style={S.root}>
      {/* Page background gradient */}
      <LinearGradient
        colors={["#DCE8FF", "#EAF1FF", "#E4EEFF"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.06, y: 0 }}
        end={{ x: 0.94, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Login header wash */}
      <LinearGradient
        colors={["#EAF0FF", "#F4F7FF"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={S.topWash}
        pointerEvents="none"
      />

      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Branding */}
        <View style={S.brandingArea}>
          <View style={S.logoGlow}>
            <View style={S.logoWrap}>
              <Image source={appLogo} resizeMode="cover" style={S.logo} />
            </View>
          </View>
          <Text style={S.appName}>M-PAY</Text>
          <Text style={S.tagline}>Sell airtime, data, fiber and SMS bundles</Text>
          <View style={S.rule}>
            <LinearGradient
              colors={["transparent", "rgba(21,101,192,0.27)"]}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={S.ruleLine}
            />
            <View style={S.ruleDot} />
            <LinearGradient
              colors={["rgba(21,101,192,0.27)", "transparent"]}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={S.ruleLine}
            />
          </View>
        </View>

        {/* Form card */}
        <View style={[S.card, Shadows.medium]}>
          <Text style={S.cardTitle}>Welcome back 👋</Text>
          <Text style={S.cardSubtitle}>Use your login credentials to sign in.</Text>

          {/* Email */}
          <View style={S.fieldGroup}>
            <Text style={S.inputLabel}>EMAIL OR PHONE</Text>
            <Controller control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[S.inputRow, {
                  borderColor: errors.email ? Colors.borderError : credFocus ? Colors.borderFocus : Colors.border,
                  backgroundColor: credFocus ? Colors.surface : Colors.surfaceRaised,
                }]}>
                  <User size={16} color={credFocus ? Colors.primary : Colors.textLight} />
                  <View style={S.inputDivider} />
                  <TextInput style={S.textInput} placeholder="you@example.com"
                    placeholderTextColor="#9BAAC4" value={value}
                    onChangeText={onChange}
                    onBlur={() => { setCredFocus(false); onBlur(); }}
                    onFocus={() => setCredFocus(true)}
                    keyboardType="email-address" autoCapitalize="none"
                    autoComplete="email" accessibilityLabel="Email or phone" />
                </View>
              )} />
            {errors.email && <Text style={S.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Password */}
          <View style={S.fieldGroup}>
            <Text style={S.inputLabel}>PASSWORD</Text>
            <Controller control={control} name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[S.inputRow, {
                  borderColor: errors.password ? Colors.borderError : passFocus ? Colors.borderFocus : Colors.border,
                  backgroundColor: passFocus ? Colors.surface : Colors.surfaceRaised,
                }]}>
                  <Lock size={16} color={passFocus ? Colors.primary : Colors.textLight} />
                  <View style={S.inputDivider} />
                  <TextInput style={S.textInput} placeholder="Enter your password"
                    placeholderTextColor="#9BAAC4" value={value}
                    onChangeText={onChange}
                    onBlur={() => { setPassFocus(false); onBlur(); }}
                    onFocus={() => setPassFocus(true)}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    accessibilityLabel="Password" onSubmitEditing={handleSubmit(onSubmit)} />
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
                    {showPassword
                      ? <Eye size={17} color={Colors.textLight} />
                      : <EyeOff size={17} color={Colors.textLight} />}
                  </Pressable>
                </View>
              )} />
            {errors.password && <Text style={S.errorText}>{errors.password.message}</Text>}
          </View>

          <View style={S.forgotRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Forgot password" hitSlop={8}>
              <Text style={S.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* Sign In */}
          <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}
            accessibilityRole="button" accessibilityLabel="Sign in"
            accessibilityState={{ disabled: isSubmitting }}
            style={({ pressed }) => [{ transform: [{ scale: pressed || isSubmitting ? 0.98 : 1 }], opacity: isSubmitting ? 0.8 : 1 }]}>
            <LinearGradient colors={["#1565C0", "#1976D2", "#0D47A1"]}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[S.ctaBtn, S.ctaBtnShadow]}>
              <Text style={S.ctaBtnText}>{isSubmitting ? "Signing in..." : "Sign In"}</Text>
              {!isSubmitting && <ArrowRight size={16} color="#fff" />}
            </LinearGradient>
          </Pressable>

          <View style={S.dividerRow}>
            <View style={S.dividerLine} />
            <Text style={S.dividerText}>or continue with</Text>
            <View style={S.dividerLine} />
          </View>

          {/* Biometric */}
          <Pressable onPress={onSuccess} accessibilityRole="button" accessibilityLabel="Use biometric login"
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
            <LinearGradient colors={["#1565C0", "#1976D2", "#0D47A1"]}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[S.ctaBtn, S.ctaBtnShadow]}>
              <Fingerprint size={17} color="#fff" />
              <Text style={S.ctaBtnText}>Use Biometric Login</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={S.footer}>
          <View style={S.footerRow}>
            <Text style={S.footerText}>Need access? </Text>
            <Pressable onPress={onNavigateSignup} accessibilityRole="button"
              accessibilityLabel="Contact administrator" hitSlop={8}>
              <Text style={S.footerLink}>Contact your administrator</Text>
            </Pressable>
          </View>
          <Text style={S.version}>v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root:          { flex: 1 },
  topWash:       { ...StyleSheet.absoluteFill, height: 340, borderBottomLeftRadius: 48, borderBottomRightRadius: 48 },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: Spacing["3xl"] },

  // Branding
  brandingArea:  { alignItems: "center", paddingHorizontal: Spacing["2xl"], paddingTop: Spacing["4xl"], paddingBottom: Spacing["2xl"] },
  logoGlow:      { shadowColor: "#1565C0", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 3, marginBottom: Spacing.lg },
  logoWrap:      { width: 84, height: 84, borderRadius: Radius["2xl"], overflow: "hidden" },
  logo:          { width: 84, height: 84 },
  appName:       { fontSize: 28, fontFamily: "PlusJakartaSans_800ExtraBold", color: "#0C1A3A", letterSpacing: -0.8 },
  tagline:       { fontSize: 12.5, fontFamily: "PlusJakartaSans_500Medium", color: "#5A6A8A", letterSpacing: 0.1, textAlign: "center", marginTop: Spacing.sm },
  rule:          { flexDirection: "row", alignItems: "center", width: 240, gap: Spacing.sm, marginTop: Spacing.xl },
  ruleLine:      { flex: 1, height: 1.5 },
  ruleDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(21,101,192,0.4)" },

  // Form card
  card:          { marginHorizontal: Spacing.xl, borderRadius: Radius["3xl"], backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, padding: Spacing["2xl"] },
  cardTitle:     { fontSize: 20, fontFamily: "PlusJakartaSans_800ExtraBold", color: "#0C1A3A", letterSpacing: -0.5, marginBottom: Spacing.xs },
  cardSubtitle:  { fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: "#5A6A8A", marginBottom: Spacing["2xl"] },
  fieldGroup:    { marginBottom: Spacing.md },
  inputLabel:    { fontSize: 11, fontFamily: "PlusJakartaSans_700Bold", color: "#9BAAC4", letterSpacing: 0.7, marginBottom: Spacing.sm },
  inputRow:      { flexDirection: "row", alignItems: "center", height: 54, borderRadius: Radius.lg, borderWidth: 1.5, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  inputDivider:  { width: 1, height: 18, backgroundColor: Colors.divider },
  textInput:     { flex: 1, fontSize: 14, fontFamily: "PlusJakartaSans_500Medium", color: "#0C1A3A", paddingVertical: 0 },
  errorText:     { fontSize: 11, fontFamily: "PlusJakartaSans_400Regular", color: Colors.error, marginTop: 5 },
  forgotRow:     { alignItems: "flex-end", marginTop: Spacing.sm, marginBottom: Spacing["2xl"] },
  forgotText:    { fontSize: 12.5, fontFamily: "PlusJakartaSans_700Bold", color: "#1565C0" },
  ctaBtn:        { height: 54, borderRadius: Radius.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm },
  ctaBtnShadow:  { shadowColor: "#1565C0", shadowOpacity: 0.38, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  ctaBtnText:    { fontSize: 15, fontFamily: "PlusJakartaSans_800ExtraBold", color: "#fff", letterSpacing: -0.2 },
  dividerRow:    { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginVertical: Spacing.xl },
  dividerLine:   { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText:   { fontSize: 11, fontFamily: "PlusJakartaSans_500Medium", color: Colors.textLight },

  // Footer
  footer:        { alignItems: "center", marginTop: Spacing["2xl"], paddingHorizontal: Spacing.xl },
  footerRow:     { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  footerText:    { fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: "#5A6A8A" },
  footerLink:    { fontSize: 13, fontFamily: "PlusJakartaSans_700Bold", color: "#1565C0" },
  version:       { fontSize: 11, fontFamily: "PlusJakartaSans_400Regular", color: "#9BAAC4", marginTop: Spacing.md },
});
