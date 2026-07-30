import SplashScreenView from "@/components/SplashScreenView";
import { AuthProvider, useAuth } from "@/store/auth.store";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/urbanist";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <View className="flex-1 bg-mpay-bg" />;
  }

  return <>{children}</>;
}

function RootLayoutContent() {
  const segments = useSegments();
  const inAuthGroup = segments[0] === "(auth)";

  return (
    <AuthGuard>
      <StatusBar style={inAuthGroup ? "dark" : "auto"} />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGuard>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [splashDone, setSplashDone] = useState(false);

  if (!fontsLoaded) {
    return <View className="flex-1 bg-mpay-bg" />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
      {!splashDone && (
        <SplashScreenView onDone={() => setSplashDone(true)} />
      )}
    </SafeAreaProvider>
  );
}
