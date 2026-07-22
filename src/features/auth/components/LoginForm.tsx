import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema";
import { shadowStyle } from "@/theme/shadows";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Eye, EyeOff, Fingerprint, Lock, User } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateSignup: () => void;
}

const L = {
  bg: "#F4F7FF",
  bgTop: "#EAF0FF",
  card: "#FFFFFF",
  border: "#E4EAF6",
  focus: "#1565C0",
  blue: "#1565C0",
  text: "#0C1A3A",
  mid: "#5A6A8A",
  dim: "#9BAAC4",
  inputBg: "#F8FAFF",
};

const cardShadow = (color: string, opacity: number, radius: number, elevation: number) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  });

export function LoginForm({ onSuccess, onNavigateSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [credFocus, setCredFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (_values: LoginFormValues) => {
    // Auth handled by parent via useAuth
    onSuccess();
  };

  const appLogo = require("../../../../assets/logo.png");

  return (
    <View style={{ flex: 1, backgroundColor: L.bg }}>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            height: 320,
            backgroundColor: L.bgTop,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
          },
        ]}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 24, paddingTop: 12 }}>

        </View>

        <View style={{ alignItems: "center", paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32 }}>
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 22,
                overflow: "hidden",
                marginBottom: 12,
                ...cardShadow(L.blue, 0.28, 16, 10),
              }}
            >
              <Image source={appLogo} resizeMode="cover" style={{ width: 80, height: 80 }} />
            </View>

            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: L.text,
                letterSpacing: -0.8,
                fontFamily: "Urbanist_800ExtraBold",
              }}
            >
              M-PAY
            </Text>

            <Text
              style={{
                fontSize: 12.5,
                color: L.mid,
                fontWeight: "500",
                letterSpacing: 0.1,
                textAlign: "center",
                marginTop: 6,
              }}
            >
              Sell airtime, data, fiber and SMS bundles
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", width: 200, gap: 8 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: L.border }} />
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: L.blue, opacity: 0.4 }} />
            <View style={{ flex: 1, height: 1, backgroundColor: L.border }} />
          </View>
        </View>

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 4,
            borderRadius: 24,
            backgroundColor: L.card,
            borderWidth: 1,
            borderColor: L.border,
            padding: 24,
            ...cardShadow(L.blue, 0.09, 16, 6),
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: L.text,
              letterSpacing: -0.5,
              marginBottom: 4,
              fontFamily: "Urbanist_800ExtraBold",
            }}
          >
            Welcome back 👋
          </Text>
          <Text style={{ fontSize: 13, color: L.mid, fontWeight: "500", marginBottom: 24 }}>
            Use your login credentials to sign in.
          </Text>

          <View style={{ marginBottom: 14 }}>
            <Text style={styles.label}>Email or Phone</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputWrap,
                    {
                      borderColor: errors.email ? "#F87171" : credFocus ? L.focus : L.border,
                      backgroundColor: credFocus ? L.card : L.inputBg,
                    },
                    !credFocus && styles.inputShadow,
                  ]}
                >
                  <User size={16} color={credFocus ? L.blue : L.dim} />
                  <View style={styles.inputDivider} />
                  <TextInput
                    style={{ flex: 1, color: L.text, height: 54, fontSize: 14, fontWeight: "500" }}
                    placeholder="you@example.com"
                    placeholderTextColor={L.dim}
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      setCredFocus(false);
                      onBlur();
                    }}
                    onFocus={() => setCredFocus(true)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    accessibilityLabel="Email or phone"
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text style={{ color: "#F87171", fontSize: 11, marginTop: 6 }}>
                {errors.email.message}
              </Text>
            )}
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputWrap,
                    {
                      borderColor: errors.password ? "#F87171" : passFocus ? L.focus : L.border,
                      backgroundColor: passFocus ? L.card : L.inputBg,
                    },
                    !passFocus && styles.inputShadow,
                  ]}
                >
                  <Lock size={16} color={passFocus ? L.blue : L.dim} />
                  <View style={styles.inputDivider} />
                  <TextInput
                    style={{ flex: 1, color: L.text, height: 54, fontSize: 14, fontWeight: "500" }}
                    placeholder="Enter your password"
                    placeholderTextColor={L.dim}
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                      setPassFocus(false);
                      onBlur();
                    }}
                    onFocus={() => setPassFocus(true)}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    accessibilityLabel="Password"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye size={17} color={L.dim} /> : <EyeOff size={17} color={L.dim} />}
                  </Pressable>
                </View>
              )}
            />
            {errors.password && (
              <Text style={{ color: "#F87171", fontSize: 11, marginTop: 6 }}>
                {errors.password.message}
              </Text>
            )}
          </View>

          <View style={{ alignItems: "flex-end", marginTop: 8, marginBottom: 24 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Forgot password" hitSlop={8}>
              <Text style={{ fontSize: 12.5, fontWeight: "700", color: L.blue }}>
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityState={{ disabled: isSubmitting }}
            style={({ pressed }) => [{ opacity: pressed || isSubmitting ? 0.92 : 1 }]}
          >
            <LinearGradient
              colors={["#1565C0", "#1976D2", "#0D47A1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                {
                  height: 54,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                },
                shadowStyle(0.22, 12),
              ]}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "800",
                  letterSpacing: -0.2,
                  fontFamily: "Urbanist_800ExtraBold",
                }}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Text>
              {!isSubmitting ? <ArrowRight size={15} color="#fff" /> : null}
            </LinearGradient>
          </Pressable>

          <View style={{ marginVertical: 20, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: "#D8EAF6" }} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: L.dim }}>
              or continue with
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#D8EAF6" }} />
          </View>

          <Pressable
            onPress={onSuccess}
            accessibilityRole="button"
            accessibilityLabel="Use biometric login"
            style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
          >
            <LinearGradient
              colors={["#3B82D6", "#2A6FC4", "#1B57A8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                {
                  height: 54,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                },
                shadowStyle(0.22, 12),
              ]}
            >
              <Fingerprint size={17} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "800",
                  letterSpacing: -0.2,
                  fontFamily: "Urbanist_800ExtraBold",
                }}
              >
                Use Biometric Login
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={{ alignItems: "center", marginTop: 20, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            <Text style={{ fontSize: 13, color: L.mid, fontWeight: "500" }}>Need access? </Text>
            <Pressable
              onPress={onNavigateSignup}
              accessibilityRole="button"
              accessibilityLabel="Contact administrator"
              hitSlop={8}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: L.blue }}>
                Contact your administrator
              </Text>
            </Pressable>
          </View>
          <Text style={{ marginTop: 12, fontSize: 11, fontWeight: "400", color: L.dim }}>v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: L.dim,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 7,
    fontFamily: "Urbanist_700Bold",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    gap: 10,
  },
  inputDivider: {
    width: 1,
    height: 18,
    backgroundColor: L.border,
  },
  inputShadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
    android: { elevation: 1 },
    default: {},
  }),
});
