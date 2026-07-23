/**
 * Card — White elevated surface with consistent radius and shadow.
 * Variants: default | outlined | flat
 */
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors, Radius, Shadows, Spacing } from "@/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: "default" | "outlined" | "flat";
  padding?: number;
}

export function Card({ children, style, variant = "default", padding = Spacing.lg }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === "default"  && styles.default,
        variant === "outlined" && styles.outlined,
        variant === "flat"     && styles.flat,
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
  },
  default: {
    ...Shadows.subtle,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flat: {
    backgroundColor: Colors.surfaceRaised,
  },
});
