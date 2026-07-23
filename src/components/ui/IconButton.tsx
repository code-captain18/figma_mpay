/**
 * IconButton — Small pressable icon container.
 */
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { Colors, Radius, Shadows } from "@/theme";

interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: number;
  bg?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function IconButton({
  icon,
  onPress,
  size = 40,
  bg = Colors.surface,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.btn,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <View>{icon}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.subtle,
  },
});
