/**
 * SectionHeader — Title + optional "View all" link used throughout dashboard.
 */
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, SCREEN_PADDING, T } from "@/theme";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel} ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: 10,
  },
  title: {
    ...T.headingMD,
    color: Colors.textPrimary,
  },
  action: {
    ...T.bodySM,
    color: Colors.primary,
    fontFamily: "Urbanist_600SemiBold",
  },
});
