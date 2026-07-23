/**
 * Button — Unified button with Primary / Secondary / Outline / Ghost / Danger variants.
 * Loading state shows ActivityIndicator. Disabled dims the button.
 */
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "right",
  style,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const inner = (
    <View style={styles.content}>
      {icon && iconPosition === "left" && <View style={styles.iconLeft}>{icon}</View>}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "danger" ? "#fff" : Colors.primary}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "primary" && styles.labelOnDark,
            variant === "danger"  && styles.labelOnDark,
            variant === "secondary" && styles.labelSecondary,
            variant === "outline" && styles.labelOutline,
            variant === "ghost"   && styles.labelGhost,
            isDisabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      )}
      {icon && iconPosition === "right" && !loading && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );

  if (variant === "primary") {
    return (
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        style={[styles.pressable, fullWidth && styles.fullWidth, style]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {({ pressed }) => (
          <LinearGradient
            colors={
              isDisabled
                ? [Colors.textDisabled, Colors.textDisabled]
                : pressed
                ? [Colors.primaryPressed, Colors.primaryPressed]
                : [Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.base, styles.primaryGrad, { opacity: isDisabled ? 0.6 : 1 }]}
          >
            {inner}
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  if (variant === "danger") {
    return (
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        style={[styles.pressable, fullWidth && styles.fullWidth, style]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {({ pressed }) => (
          <View
            style={[
              styles.base,
              { backgroundColor: pressed ? "#c0253a" : Colors.error },
              isDisabled && styles.disabled,
            ]}
          >
            {inner}
          </View>
        )}
      </Pressable>
    );
  }

  const bgMap: Record<Variant, string | undefined> = {
    primary:   undefined,
    danger:    undefined,
    secondary: Colors.primaryLight,
    outline:   "transparent",
    ghost:     "transparent",
  };

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={[styles.pressable, fullWidth && styles.fullWidth, style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.base,
            { backgroundColor: bgMap[variant] },
            variant === "outline" && styles.outlineBorder,
            pressed && styles.pressed,
            isDisabled && styles.disabled,
          ]}
        >
          {inner}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {},
  fullWidth:  { width: "100%" },
  base: {
    height: 54,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    ...Shadows.subtle,
  },
  primaryGrad: {},
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  label: {
    ...T.button,
    color: Colors.textPrimary,
  },
  labelOnDark:   { color: "#fff" },
  labelSecondary: { color: Colors.primary },
  labelOutline:  { color: Colors.primary },
  labelGhost:    { color: Colors.primary },
  labelDisabled: { color: Colors.textDisabled },
  iconLeft:  { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
});
