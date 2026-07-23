import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";
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
      {/* Gradient top wash */}
      <LinearGradient
        colors={["#D6E8FF", "#EBF3FF", "#F4F8FF"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={S.topWash}
        pointerEvents="none"
      />

      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Branding */}
        <View style={S.brandingArea}>
          <View style={[S.logoWrap, Shadows.strong]}>
            <Image source={appLogo} resizeMode="cover" style={S.logo} />
          </View>
          <Text style={S.appName}>M-PAY</Text>
          <Text style={S.tagline}>Sell airtime, data, fiber and SMS bundles</Text>
          <View style={S.rule}>
            <View style={S.ruleLine} />
            <View style={S.ruleDot} />
            <View style={S.ruleLine} />
          </View>
        </View>

        {/* Form card */}
        <View style={[S.card, Shadows.medium]}>
          <Text style={S.cardTitle}>Welcome back</Text>
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
                    placeholderTextColor={Colors.textDisabled} value={value}
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
                    placeholderTextColor={Colors.textDisabled} value={value}
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
            style={({ pressed }) => [{ opacity: pressed || isSubmitting ? 0.85 : 1 }]}>
            <LinearGradient colors={["#1565C0","#1976D2","#0D47A1"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[S.ctaBtn, Shadows.medium]}>
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
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
            <LinearGradient colors={["#3B82D6","#2A6FC4","#1B57A8"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[S.ctaBtn, Shadows.medium]}>
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
  root:          { flex: 1, backgroundColor: "#F4F8FF" },
  topWash:       { ...StyleSheet.absoluteFill, height: 340, borderBottomLeftRadius: 48, borderBottomRightRadius: 48 },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: Spacing["3xl"] },

  // Branding
  brandingArea:  { alignItems: "center", paddingHorizontal: Spacing["2xl"], paddingTop: Spacing["4xl"], paddingBottom: Spacing["2xl"] },
  logoWrap:      { width: 84, height: 84, borderRadius: Radius["2xl"], overflow: "hidden", marginBottom: Spacing.lg },
  logo:          { width: 84, height: 84 },
  appName:       { fontSize: 30, fontFamily: "Urbanist_800ExtraBold", color: Colors.textPrimary, letterSpacing: -0.8 },
  tagline:       { fontSize: 14, fontFamily: "Urbanist_600SemiBold", color: Colors.textMuted, letterSpacing: 0.1, textAlign: "center", marginTop: Spacing.sm },
  rule:          { flexDirection: "row", alignItems: "center", width: 240, gap: Spacing.sm, marginTop: Spacing.xl },
  ruleLine:      { flex: 1, height: 1.5, backgroundColor: Colors.border },
  ruleDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, opacity: 0.65 },

  // Form card
  card:          { marginHorizontal: Spacing.xl, borderRadius: Radius["3xl"], backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, padding: Spacing["2xl"] },
  cardTitle:     { fontSize: 22, fontFamily: "Urbanist_800ExtraBold", color: Colors.textPrimary, letterSpacing: -0.4, marginBottom: Spacing.xs },
  cardSubtitle:  { ...T.bodyMD, color: Colors.textMuted, marginBottom: Spacing["2xl"] },
  fieldGroup:    { marginBottom: Spacing.md },
  inputLabel:    { ...T.label, color: Colors.textMuted, marginBottom: Spacing.sm },
  inputRow:      { flexDirection: "row", alignItems: "center", height: 54, borderRadius: Radius.lg, borderWidth: 1.5, paddingHorizontal: Spacing.lg, gap: Spacing.md },
  inputDivider:  { width: 1, height: 18, backgroundColor: Colors.divider },
  textInput:     { flex: 1, ...T.bodyMD, color: Colors.textPrimary, paddingVertical: 0 },
  errorText:     { ...T.caption, color: Colors.error, marginTop: 5 },
  forgotRow:     { alignItems: "flex-end", marginTop: Spacing.sm, marginBottom: Spacing["2xl"] },
  forgotText:    { ...T.bodySM, fontFamily: "Urbanist_700Bold", color: Colors.primaryDark },
  ctaBtn:        { height: 54, borderRadius: Radius.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm },
  ctaBtnText:    { fontSize: 16, fontFamily: "Urbanist_800ExtraBold", color: "#fff", letterSpacing: -0.2 },
  dividerRow:    { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginVertical: Spacing.xl },
  dividerLine:   { flex: 1, height: 1, backgroundColor: Colors.divider },
  dividerText:   { ...T.caption, fontFamily: "Urbanist_600SemiBold", color: Colors.textLight },

  // Footer
  footer:        { alignItems: "center", marginTop: Spacing["2xl"], paddingHorizontal: Spacing.xl },
  footerRow:     { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  footerText:    { ...T.bodyMD, color: Colors.textMuted },
  footerLink:    { ...T.bodyMD, fontFamily: "Urbanist_700Bold", color: Colors.primaryDark },
  version:       { ...T.caption, color: Colors.textLight, marginTop: Spacing.md },
});
