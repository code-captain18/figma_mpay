/**
 * LoadingState — Full-area or inline loading indicator.
 */
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors, T } from "@/theme";

interface LoadingStateProps {
  message?: string;
  inline?: boolean;
}

export function LoadingState({ message, inline = false }: LoadingStateProps) {
  return (
    <View style={[styles.container, inline && styles.inline]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  inline: {
    flex: 0,
    paddingVertical: 32,
  },
  message: {
    ...T.bodySM,
    color: Colors.textMuted,
  },
});
