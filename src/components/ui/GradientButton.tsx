import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Colors, Radius, T } from "@/theme";

interface GradientButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function GradientButton({ label, onPress, disabled = false, loading = false }: GradientButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={styles.pressable}
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
          locations={isDisabled || pressed ? undefined : [0, 0.42, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, isDisabled && styles.disabledOpacity]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.textOnDark} />
          ) : (
            <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: "100%" },
  gradient: {
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledOpacity: { opacity: 0.6 },
  label: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: "Urbanist_800ExtraBold",
    color: Colors.textOnDark,
  },
  labelDisabled: {
    color: Colors.textDisabled,
  },
});
