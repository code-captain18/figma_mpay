import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { useAuth } from "@/store/auth.store";
import { Colors } from "@/theme/colors";

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
    <SafeAreaView
      className="flex-1 bg-[#EAF1FF]"
      edges={["top"]}
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
    </SafeAreaView>
  );
}
