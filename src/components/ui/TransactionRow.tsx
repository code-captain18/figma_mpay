import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Colors, Radius, Spacing } from "@/theme";
import type { Transaction } from "@/types";

interface TransactionRowProps {
  transaction: Transaction;
  onPress: () => void;
  showRelativeTime?: boolean;
}

export function TransactionRow({ transaction: tx, onPress, showRelativeTime = false }: TransactionRowProps) {
  const timeLabel = showRelativeTime ? tx.time : tx.date.split("· ")[1];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${tx.label}, ${tx.amount > 0 ? "received" : "sent"} GHS${Math.abs(tx.amount).toFixed(2)}`}
      style={[R.row, showRelativeTime ? R.rowCompact : R.rowFull]}
    >
      <View style={[R.iconWrap, { backgroundColor: tx.bg }, showRelativeTime ? R.iconWrapSm : R.iconWrapLg]}>
        <Icon name={tx.iconName} size={22} color={tx.color} />
      </View>

      <View style={R.mid}>
        <Text style={R.label} numberOfLines={1}>{tx.label}</Text>
        <View style={R.subRow}>
          {tx.status === "success"
            ? <CheckCircle2 size={11} color={Colors.green} />
            : <Clock size={11} color={Colors.orange} />}
          <Text style={[R.statusText, { color: tx.status === "success" ? Colors.green : Colors.orange }]}>
            {tx.status === "success" ? "Success" : "Pending"}
          </Text>
          <Text style={R.timeText}>· {timeLabel}</Text>
        </View>
      </View>

      {showRelativeTime ? (
        <View style={R.amountRow}>
          {tx.amount > 0
            ? <ArrowDownLeft size={14} color={Colors.green} />
            : <ArrowUpRight size={14} color={Colors.red} />}
          <Text style={[R.amountSm, { color: tx.amount > 0 ? Colors.green : Colors.red }]}>
            GHS{Math.abs(tx.amount).toFixed(2)}
          </Text>
        </View>
      ) : (
        <View style={R.amountCol}>
          <Text style={[R.amountLg, { color: tx.amount > 0 ? Colors.green : Colors.red }]}>
            {tx.amount > 0 ? "+" : "-"}GHS{Math.abs(tx.amount).toFixed(2)}
          </Text>
          <Text style={R.network}>{tx.network}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const R = StyleSheet.create({
  row:        { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg },
  rowCompact: { gap: 12, paddingVertical: 13 },
  rowFull:    { gap: 14, paddingVertical: 15 },
  iconWrap:   { alignItems: "center", justifyContent: "center" },
  iconWrapSm: { width: 48, height: 48, borderRadius: Radius.lg },
  iconWrapLg: { width: 50, height: 50, borderRadius: Radius.lg + 1 },
  mid:        { flex: 1, minWidth: 0 },
  label:      { fontSize: 12, fontWeight: "600", fontFamily: "Urbanist_600SemiBold", color: Colors.textPrimary },
  subRow:     { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  statusText: { fontSize: 10, fontWeight: "600", fontFamily: "Urbanist_600SemiBold" },
  timeText:   { fontSize: 10, color: Colors.textLight, fontFamily: "Urbanist_400Regular" },
  amountRow:  { flexDirection: "row", alignItems: "center", gap: 4 },
  amountSm:   { fontSize: 12, fontWeight: "700", fontFamily: "Urbanist_700Bold" },
  amountCol:  { alignItems: "flex-end", gap: 2 },
  amountLg:   { fontSize: 12, fontWeight: "700", fontFamily: "Urbanist_700Bold" },
  network:    { fontSize: 10, fontFamily: "Urbanist_400Regular", color: Colors.pale },
});
