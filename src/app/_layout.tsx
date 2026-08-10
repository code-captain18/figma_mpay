import * as Sentry from '@sentry/react-native';
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
import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { AppState, AppStateStatus, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// React Query doesn't hook into AppState by default in React Native

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      // keep cached data for 10 min — financial screens never show GHS 0 on reconnect
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnReconnect: true,
    },
  },
});

import { registerForPushNotificationsAsync, setupNotificationListeners } from "@/notifications";
import { AuthProvider, useAuth } from "@/store/auth.store";
import { ToastProvider } from "@/store/toast.store";
import Constants from 'expo-constants';
import '../../global.css';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN && !__DEV__) {
  Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.2 });
}

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
  }, [isAuthenticated, isLoading, segments, router]);

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
  const router = useRouter();
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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hide();
    }
    const appStateSub = AppState.addEventListener('change', (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    });
    registerForPushNotificationsAsync();
    const cleanupNotifications = setupNotificationListeners(
      undefined,
      (response) => {
        const txId = response.notification.request.content.data?.txId;
        if (txId) router.push('/(app)/(tabs)/history');
      },
    );
    return () => {
      appStateSub.remove();
      cleanupNotifications();
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <ToastProvider>
            <RootLayoutContent />
          </ToastProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
