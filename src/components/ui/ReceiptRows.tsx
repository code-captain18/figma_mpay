import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Spacing, T } from "@/theme";

interface ReceiptRow {
  label: string;
  value: string;
  green?: boolean;
}

interface ReceiptRowsProps {
  rows: ReceiptRow[];
}

export function ReceiptRows({ rows }: ReceiptRowsProps) {
  return (
    <View style={styles.container}>
      {rows.map((row, i) => (
        <View key={row.label}>
          <View style={styles.row}>
            <Text style={styles.label}>{row.label}</Text>
            <Text style={[styles.value, row.green && styles.valueGreen]}>{row.value}</Text>
          </View>
          {i < rows.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius["2xl"],
    overflow: "hidden",
    marginBottom: Spacing["2xl"],
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontFamily: "Urbanist_500Medium",
    color: Colors.textMuted,
  },
  value: {
    fontSize: 12,
    fontFamily: "Urbanist_700Bold",
    color: Colors.textPrimary,
  },
  valueGreen: {
    color: Colors.success,
  },
  divider: {
    marginHorizontal: Spacing.xl,
    height: 1,
    backgroundColor: Colors.divider,
  },
});
