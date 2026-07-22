import { Redirect } from "expo-router";
import { useAuth } from "@/store/auth.store";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? (
    <Redirect href="/(app)/(tabs)" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
