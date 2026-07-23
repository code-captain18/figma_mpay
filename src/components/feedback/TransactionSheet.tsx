import { Icon } from "@/components/ui/Icon";
import { Colors, Radius, Shadows, Spacing, T } from "@/theme";
import type { Transaction } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, Clock, Copy, Share2, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={DS.detailRow}>
      <Text style={DS.detailLabel}>{label}</Text>
      <Text style={DS.detailValue}>{value}</Text>
    </View>
  );
}

interface TransactionSheetProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionSheet({ transaction: tx, onClose }: TransactionSheetProps) {
  const insets = useSafeAreaInsets();
  const isCredit = tx.amount > 0;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={DS.backdrop}>
        <Pressable style={DS.scrim} onPress={onClose} accessibilityLabel="Close transaction details" />
        <View style={[DS.sheet, { paddingBottom: insets.bottom + 12 }]}>

          {/* Handle */}
          <View style={DS.handleWrap}>
            <View style={DS.handle} />
          </View>

          {/* Header */}
          <View style={DS.header}>
            <Text style={DS.headerTitle}>Transaction Details</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={DS.closeBtn}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <View style={DS.hero}>
            <View style={[DS.iconCircle, { backgroundColor: tx.bg }]}>
              <Icon name={tx.iconName} size={28} color={tx.color} />
            </View>
            <Text style={[DS.amount, { color: isCredit ? Colors.green : Colors.textPrimary }]}>
              {isCredit ? "+" : "-"}GHS{Math.abs(tx.amount).toFixed(2)}
            </Text>
            <Text style={DS.amountSub}>{tx.label}</Text>
            <View style={[DS.statusBadge, { backgroundColor: tx.status === "success" ? "rgba(13,168,112,0.1)" : "rgba(233,145,10,0.1)" }]}>
              {tx.status === "success"
                ? <CheckCircle2 size={12} color={Colors.green} />
                : <Clock size={12} color={Colors.orange} />}
              <Text style={[DS.statusText, { color: tx.status === "success" ? Colors.green : Colors.orange }]}>
                {tx.status === "success" ? "Successful" : "Pending"}
              </Text>
            </View>
          </View>

          {/* Details */}
          <ScrollView style={DS.scroll} showsVerticalScrollIndicator={false}>
            <DetailRow label="Date &amp; Time" value={tx.date} />
            <DetailRow label="Category" value={tx.category} />
            <DetailRow label="Recipient" value={tx.recipient} />
            <DetailRow label="Network" value={tx.network} />
            <DetailRow label="Transaction Fee" value={tx.fee === 0 ? "Free" : `GHS${tx.fee.toFixed(2)}`} />

            {/* Reference row with copy */}
            <View style={DS.detailRow}>
              <Text style={DS.detailLabel}>Reference</Text>
              <View style={DS.refRow}>
                <Text style={[DS.detailValue, { fontSize: 12 }]}>{tx.ref}</Text>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy reference" style={DS.copyBtn}>
                  <Copy size={13} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={DS.actions}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Share receipt" style={DS.shareBtn}>
              <Share2 size={16} color={Colors.textSecondary} />
              <Text style={DS.shareBtnText}>Share Receipt</Text>
            </TouchableOpacity>
            <LinearGradient
              colors={[Colors.buttonGradientStart, Colors.buttonGradientHighlight, Colors.buttonGradientMid, Colors.buttonGradientEnd]}
              locations={[0, 0.24, 0.58, 1]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={DS.repeatGrad}
            >
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Repeat transaction" style={DS.repeatBtn}>
                <Text style={DS.repeatBtnText}>Repeat Transaction</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const DS = StyleSheet.create({
  backdrop:    { flex: 1, justifyContent: "flex-end" },
  scrim:       { ...StyleSheet.absoluteFill, backgroundColor: "rgba(13,18,38,0.45)" },
  sheet:       { backgroundColor: Colors.surface, borderTopLeftRadius: Radius["3xl"], borderTopRightRadius: Radius["3xl"], maxHeight: "84%", ...Shadows.strong },
  handleWrap:  { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  handle:      { width: 40, height: 4, borderRadius: Radius.pill, backgroundColor: Colors.divider },
  header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing["2xl"], paddingBottom: Spacing.lg, paddingTop: Spacing.sm },
  headerTitle: { ...T.headingMD, color: Colors.textPrimary },
  closeBtn:    { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" },

  hero:        { alignItems: "center", paddingBottom: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  iconCircle:  { width: 72, height: 72, borderRadius: Radius["2xl"], alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
  amount:      { ...T.display, letterSpacing: -0.5 },
  amountSub:   { ...T.bodyMD, color: Colors.textMuted, marginTop: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: 5, marginTop: Spacing.sm },
  statusText:  { fontSize: 12, fontWeight: "700", fontFamily: "Urbanist_700Bold" },

  scroll:      { paddingHorizontal: Spacing["2xl"] },
  detailRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  detailLabel: { fontSize: 15, fontFamily: "Urbanist_500Medium", color: Colors.textMuted },
  detailValue: { fontSize: 15, fontFamily: "Urbanist_700Bold", color: Colors.textPrimary },
  refRow:      { flexDirection: "row", alignItems: "center", gap: 8 },
  copyBtn:     { width: 32, height: 32, borderRadius: Radius.md, backgroundColor: "rgba(24,120,206,0.08)", alignItems: "center", justifyContent: "center" },

  actions:     { flexDirection: "row", gap: Spacing.md, paddingHorizontal: Spacing["2xl"], paddingTop: Spacing.xl },
  shareBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 56, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surfaceRaised },
  shareBtnText:{ fontSize: 16, fontFamily: "Urbanist_700Bold", color: Colors.textSecondary },
  repeatGrad:  { flex: 1, borderRadius: Radius.xl },
  repeatBtn:   { flex: 1, alignItems: "center", justifyContent: "center", height: 56 },
  repeatBtnText: { fontSize: 16, fontFamily: "Urbanist_700Bold", color: "#fff" },
});
