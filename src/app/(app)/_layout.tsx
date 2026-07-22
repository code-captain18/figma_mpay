import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="airtime" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="data-bundle" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}
