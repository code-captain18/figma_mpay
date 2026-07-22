import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { useAuth } from "@/store/auth.store";

export default function LoginScreen() {
  const [screen, setScreen] = useState<"login" | "signup">("login");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    router.replace("/(app)/(tabs)");
  };

  const handleSignup = async () => {
    // TODO: wire up real signup
    await login("new@example.com", "demo");
    router.replace("/(app)/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EAF1FF]" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 bg-[#EAF1FF]">
          {screen === "login" ? (
            <LoginForm
              onSuccess={() => handleLogin("demo@mpay.app", "demo")}
              onNavigateSignup={() => setScreen("signup")}
            />
          ) : (
            <SignupForm
              onSuccess={handleSignup}
              onNavigateLogin={() => setScreen("login")}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
