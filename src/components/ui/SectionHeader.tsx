/**
 * SectionHeader — Title + optional "View all" link used throughout dashboard.
 */
import { Colors, SCREEN_PADDING } from "@/theme";
import { ChevronRight } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
        <TouchableOpacity onPress={onAction} hitSlop={8} style={styles.actionRow}>
          <Text style={styles.action}>{actionLabel}</Text>
          <ChevronRight size={13} color={Colors.primary} />
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
    fontSize: 14,
    fontFamily: "Urbanist_700Bold",
    color: Colors.textPrimary,
  },
  action: {
    fontSize: 12,
    fontFamily: "Urbanist_600SemiBold",
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
});
