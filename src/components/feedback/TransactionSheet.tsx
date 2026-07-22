import { Icon } from "@/components/ui/Icon";
import { Colors } from "@/theme/colors";
import type { Transaction } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, Clock, Copy, Share2, X } from "lucide-react-native";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View
      className="flex-row items-center justify-between border-b py-3"
      style={{ borderBottomColor: Colors.divider }}
    >
      <Text className="text-xs font-medium" style={{ color: Colors.muted }}>{label}</Text>
      <Text className="text-xs font-semibold" style={{ color: Colors.navy }}>{value}</Text>
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
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-[#0D122673]"
          onPress={onClose}
          accessibilityLabel="Close transaction details"
        />
        <View
          className="bg-white rounded-t-[28px]"
          style={{
            paddingBottom: insets.bottom + 8,
            maxHeight: "82%",
          }}
        >
          <View className="items-center pt-3 pb-1">
            <View className="h-1 w-10 rounded-full bg-[#C8DCF0]" />
          </View>
          <View
            className="flex-row items-center justify-between px-6 pb-4 pt-2"
          >
            <Text
              className="text-sm font-bold"
              style={{ color: Colors.navy, fontFamily: "Urbanist_700Bold" }}
            >
              Transaction Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: Colors.bg }}
            >
              <X size={16} color={Colors.muted} />
            </TouchableOpacity>
          </View>

          <View
            className="items-center border-b pb-6"
            style={{ borderBottomColor: Colors.divider }}
          >
            <View
              className="mb-3 h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: tx.bg }}
            >
              <Icon name={tx.iconName} size={22} color={tx.color} />
            </View>
            <Text
              className="text-2xl font-extrabold"
              style={{
                color: isCredit ? Colors.green : Colors.navy,
                fontFamily: "Urbanist_800ExtraBold",
              }}
            >
              {isCredit ? "+" : "–"}GHS{Math.abs(tx.amount).toFixed(2)}
            </Text>
            <Text className="mt-1 text-xs" style={{ color: Colors.muted }}>{tx.label}</Text>
            <View
              className="mt-2 flex-row items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                backgroundColor:
                  tx.status === "success" ? "rgba(13,168,112,0.1)" : "rgba(233,145,10,0.1)",
              }}
            >
              {tx.status === "success" ? (
                <CheckCircle2 size={11} color={Colors.green} />
              ) : (
                <Clock size={11} color={Colors.orange} />
              )}
              <Text
                className="text-[11px] font-bold"
                style={{ color: tx.status === "success" ? Colors.green : Colors.orange }}
              >
                {tx.status === "success" ? "Successful" : "Pending"}
              </Text>
            </View>
          </View>

          <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
            <DetailRow label="Date & Time" value={tx.date} />
            <DetailRow label="Category" value={tx.category} />
            <DetailRow label="Recipient" value={tx.recipient} />
            <DetailRow label="Network" value={tx.network} />
            <DetailRow
              label="Transaction Fee"
              value={tx.fee === 0 ? "Free" : `GHS${tx.fee.toFixed(2)}`}
            />
            <View
              className="flex-row items-center justify-between py-3"
            >
              <Text className="text-xs font-medium" style={{ color: Colors.muted }}>
                Reference
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-[11px] font-semibold" style={{ color: Colors.navy }}>
                  {tx.ref}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Copy reference"
                  className="h-11 w-11 items-center justify-center rounded-lg bg-[#1878CE14]"
                >
                  <Copy size={12} color={Colors.blue} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View
            className="flex-row gap-3 px-6 pt-4"
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Share receipt"
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5"
              style={{ backgroundColor: Colors.bg }}
            >
              <Share2 size={15} color={Colors.mid} />
              <Text className="text-sm font-bold" style={{ color: Colors.mid }}>
                Share Receipt
              </Text>
            </TouchableOpacity>
            <LinearGradient
              colors={[
                Colors.buttonGradientStart,
                Colors.buttonGradientHighlight,
                Colors.buttonGradientMid,
                Colors.buttonGradientEnd,
              ]}
              locations={[0, 0.24, 0.58, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-1 rounded-2xl"
            >
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Repeat transaction"
                className="flex-1 items-center justify-center py-3.5"
              >
                <Text className="text-sm font-bold text-white">Repeat</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
}
