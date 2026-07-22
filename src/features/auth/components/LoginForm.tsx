import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Eye, EyeOff, Fingerprint, Lock, User } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/auth.schema";
import { Colors } from "@/theme/colors";
import { shadowStyle } from "@/theme/shadows";

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateSignup: () => void;
}

export function LoginForm({ onSuccess, onNavigateSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

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
    <LinearGradient
      colors={["#EAF1FF", "#F8FBFF"]}
      locations={[0, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-3.5 pt-2.5">
          <View className="items-center mb-5.5">
            <View
              className="w-[84px] h-[84px] rounded-[22px] overflow-hidden mb-3.5"
              style={{
                ...shadowStyle(0.12, 18),
              }}
            >
              <Image
                source={appLogo}
                resizeMode="cover"
                style={{
                  width: 124,
                  height: 124,
                  marginLeft: -20,
                  marginTop: -20,
                }}
              />
            </View>
            <Text
              className="text-[24px] font-extrabold tracking-[-0.4px]"
              style={{
                color: "#0E2B5C",
                fontFamily: "Urbanist_800ExtraBold",
              }}
            >
              M-PAY
            </Text>
            <Text className="text-[15.5px] mt-2" style={{ color: "#4A6A99" }}>
              Sell airtime, data, fiber and SMS bundles
            </Text>

            <View className="flex-row items-center gap-[10px] mt-3">
              <View className="h-px w-[58px] bg-[#C2D6F5]" />
              <View className="h-1.5 w-1.5 rounded-full bg-[#77A7ED]" />
              <View className="h-px w-[58px] bg-[#C2D6F5]" />
            </View>
          </View>
        </View>

        <View
          className="mx-3 mt-1 rounded-[26px] bg-white border px-5 pt-6 pb-6"
          style={{
            borderColor: "#DAE7FA",
            ...shadowStyle(0.08, 16),
          }}
        >
          <Text
            className="text-[17px] font-extrabold"
            style={{
              color: "#0A2B60",
              fontFamily: "Urbanist_800ExtraBold",
            }}
          >
            Welcome back 👋
          </Text>
          <Text className="text-[15px] mt-1.5 mb-[18px]" style={{ color: "#5E7CA8" }}>
            Use your login credentials to sign in.
          </Text>

          <View className="mb-3.5">
            <Text
              className="text-xs font-extrabold tracking-[0.5px] mb-[9px]"
              style={{
                color: "#9BB2D6",
                fontFamily: "Urbanist_800ExtraBold",
              }}
            >
              EMAIL OR PHONE
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className="flex-row items-center h-[54px] rounded-2xl border px-3.5"
                  style={{
                    borderColor: errors.email ? Colors.red : "#D7E3F5",
                    backgroundColor: "#F8FBFF",
                  }}
                >
                  <User size={16} color="#96AFD4" />
                  <View className="mx-3 h-[18px] w-px bg-[#D4E1F4]" />
                  <TextInput
                    className="flex-1 text-[15px]"
                    style={{ color: Colors.navy }}
                    placeholder="you@example.com"
                    placeholderTextColor="#90A8CC"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    accessibilityLabel="Email or phone"
                  />
                </View>
              )}
            />
            {errors.email && <Text className="text-[11px] mt-[5px]" style={{ color: Colors.red }}>{errors.email.message}</Text>}
          </View>

          <View className="mb-2">
            <Text
              className="text-xs font-extrabold tracking-[0.5px] mb-[9px]"
              style={{
                color: "#9BB2D6",
                fontFamily: "Urbanist_800ExtraBold",
              }}
            >
              PASSWORD
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className="flex-row items-center h-[54px] rounded-2xl border px-3.5"
                  style={{
                    borderColor: errors.password ? Colors.red : "#D7E3F5",
                    backgroundColor: "#F8FBFF",
                  }}
                >
                  <Lock size={16} color="#96AFD4" />
                  <View className="mx-3 h-[18px] w-px bg-[#D4E1F4]" />
                  <TextInput
                    className="flex-1 text-[15px]"
                    style={{ color: Colors.navy }}
                    placeholder="Enter your password"
                    placeholderTextColor="#90A8CC"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    accessibilityLabel="Password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((p) => !p)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye size={17} color="#96AFD4" /> : <EyeOff size={17} color="#96AFD4" />}
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text className="text-[11px] mt-[5px]" style={{ color: Colors.red }}>{errors.password.message}</Text>}
          </View>

          <View className="items-end mt-2 mb-[18px]">
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Forgot password">
              <Text className="text-[14px] font-bold" style={{ color: "#0F58B8" }}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={["#2F76C9", "#1E63BA", "#1552AA"]}
            locations={[0, 0.52, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            className="rounded-2xl"
          >
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              accessibilityState={{ disabled: isSubmitting }}
              className="h-14 rounded-2xl items-center justify-center flex-row gap-[10px]"
              style={{
                opacity: isSubmitting ? 0.75 : 1,
              }}
              disabled={isSubmitting}
            >
              <Text className="text-[16px] font-extrabold" style={{ color: "#fff", fontFamily: "Urbanist_800ExtraBold" }}>
                {isSubmitting ? "Signing In" : "Sign In"}
              </Text>
              <ArrowRight size={17} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <View className="my-5 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-[#D8EAF6]" />
            <Text className="text-xs font-semibold" style={{ color: Colors.pale }}>
              or continue with
            </Text>
            <View className="h-px flex-1 bg-[#D8EAF6]" />
          </View>

          <TouchableOpacity
            onPress={onSuccess}
            accessibilityRole="button"
            accessibilityLabel="Use biometric login"
            className="flex-row items-center justify-center gap-2.5 rounded-2xl border-[1.5px] bg-white py-3.5"
            style={{
              borderColor: Colors.border,
              ...shadowStyle(),
            }}
          >
            <Fingerprint size={18} color={Colors.blue} />
            <Text className="text-sm font-bold" style={{ color: Colors.mid }}>
              Use Biometric Login
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center mt-5 px-5">
          <View className="flex-row">
            <Text className="text-[15px]" style={{ color: "#4C6997" }}>Need access? </Text>
            <TouchableOpacity
              onPress={onNavigateSignup}
              accessibilityRole="button"
              accessibilityLabel="Contact administrator"
            >
              <Text className="text-[15px] font-bold" style={{ color: "#0C55B7" }}>Contact your administrator</Text>
            </TouchableOpacity>
          </View>
          <Text className="mt-3 text-[14px]" style={{ color: "#93AACC" }}>v1.0.0</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
