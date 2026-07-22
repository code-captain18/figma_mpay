import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Colors } from "@/theme/colors";
import type { Transaction } from "@/types";

interface TransactionRowProps {
  transaction: Transaction;
  onPress: () => void;
  showRelativeTime?: boolean;
}

export function TransactionRow({ transaction: tx, onPress, showRelativeTime = false }: TransactionRowProps) {
  const timeLabel = showRelativeTime ? tx.time : tx.date.split("· ")[1];
  const rowGap = showRelativeTime ? 12 : 14;
  const rowVertical = showRelativeTime ? 13 : 15;
  const iconSize = showRelativeTime ? 44 : 46;
  const iconRadius = showRelativeTime ? 14 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${tx.label}, ${tx.amount > 0 ? "received" : "sent"} GHS${Math.abs(tx.amount).toFixed(2)}`}
      className="flex-row items-center"
      style={{
        gap: rowGap,
        paddingHorizontal: 18,
        paddingVertical: rowVertical,
      }}
    >
      <View
        className="items-center justify-center"
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: iconRadius,
          backgroundColor: tx.bg,
        }}
      >
        <Icon name={tx.iconName} size={18} color={tx.color} />
      </View>

      <View className="flex-1" style={{ minWidth: 0 }}>
        <Text className="text-base font-bold" style={{ color: Colors.navy }} numberOfLines={1}>
          {tx.label}
        </Text>
        <View className="flex-row items-center mt-0.5" style={{ gap: 4 }}>
          {tx.status === "success" ? (
            <CheckCircle2 size={10} color={Colors.green} />
          ) : (
            <Clock size={10} color={Colors.orange} />
          )}
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: tx.status === "success" ? Colors.green : Colors.orange,
            }}
          >
            {tx.status === "success" ? "Success" : "Pending"}
          </Text>
          <Text className="text-[11px] text-[#93A7C7]">· {timeLabel}</Text>
        </View>
      </View>

      {showRelativeTime ? (
        <View className="flex-row items-center" style={{ gap: 4 }}>
          {tx.amount > 0 ? (
            <ArrowDownLeft size={14} color={Colors.green} />
          ) : (
            <ArrowUpRight size={14} color={Colors.red} />
          )}
          <Text
            style={{
              fontSize: 29 / 2,
              fontWeight: "700",
              color: tx.amount > 0 ? Colors.green : Colors.red,
              fontFamily: "Urbanist_700Bold",
            }}
          >
            GHS{Math.abs(tx.amount).toFixed(2)}
          </Text>
        </View>
      ) : (
        <View className="items-end gap-0.5">
          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: tx.amount > 0 ? Colors.green : Colors.red,
              fontFamily: "Urbanist_800ExtraBold",
            }}
          >
            {tx.amount > 0 ? "+" : "−"}GHS{Math.abs(tx.amount).toFixed(2)}
          </Text>
          <Text className="text-[11px] font-semibold text-[#B4C4DE]">{tx.network}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
