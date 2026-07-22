import React from "react";
import { Text, View } from "react-native";
import { Colors } from "@/theme/colors";

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
    <View
      className="rounded-2xl overflow-hidden mb-6 bg-white border"
      style={{ borderColor: "rgba(24,120,206,0.08)" }}
    >
      {rows.map((row, i) => (
        <View key={row.label}>
          <View className="flex-row justify-between px-5 py-3">
            <Text className="text-xs font-medium" style={{ color: Colors.muted }}>
              {row.label}
            </Text>
            <Text
              className="text-xs font-bold"
              style={{
                color: row.green ? Colors.green : Colors.navy,
              }}
            >
              {row.value}
            </Text>
          </View>
          {i < rows.length - 1 && (
            <View className="mx-5 h-px" style={{ backgroundColor: Colors.divider }} />
          )}
        </View>
      ))}
    </View>
  );
}
