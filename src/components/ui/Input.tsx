/**
 * Input — Standardized text input with label, leading/trailing icon,
 * focus, error, and disabled states.
 */
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Radius, Spacing, T } from "@/theme";

interface InputProps extends TextInputProps {
  label?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  /** Replaces trailingIcon with a pressable toggle */
  trailingAction?: { icon: React.ReactNode; onPress: () => void };
  error?: string;
  disabled?: boolean;
}

export function Input({
  label,
  leadingIcon,
  trailingIcon,
  trailingAction,
  error,
  disabled = false,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? Colors.borderError
    : focused
    ? Colors.borderFocus
    : Colors.border;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>{label.toUpperCase()}</Text>
      )}

      <View
        style={[
          styles.row,
          { borderColor },
          focused && styles.focused,
          disabled && styles.disabledRow,
        ]}
      >
        {leadingIcon && (
          <View style={styles.leadingIcon}>{leadingIcon}</View>
        )}

        <TextInput
          {...rest}
          editable={!disabled}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, style]}
          placeholderTextColor={Colors.textDisabled}
        />

        {trailingAction ? (
          <TouchableOpacity
            onPress={trailingAction.onPress}
            style={styles.trailingIcon}
            hitSlop={8}
          >
            {trailingAction.icon}
          </TouchableOpacity>
        ) : trailingIcon ? (
          <View style={styles.trailingIcon}>{trailingIcon}</View>
        ) : null}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    ...T.label,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1.2,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
  },
  focused: {
    borderWidth: 1.5,
  },
  disabledRow: {
    backgroundColor: Colors.surfaceRaised,
    opacity: 0.6,
  },
  leadingIcon: {
    marginRight: Spacing.sm,
  },
  trailingIcon: {
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    ...T.bodyMD,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    ...T.caption,
    color: Colors.error,
    marginTop: 4,
    marginLeft: 2,
  },
});
