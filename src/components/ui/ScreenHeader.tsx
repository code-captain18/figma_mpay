/**
 * ScreenHeader — Unified top-bar for stack screens.
 * Variants: "back" (← title), "plain" (title only), "dashboard" (title + right slot)
 */
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, SCREEN_PADDING, T } from "@/theme";

interface ScreenHeaderProps {
  title: string;
  /** Show a back button */
  back?: boolean;
  /** Custom back handler (defaults to router.back()) */
  onBack?: () => void;
  /** Slot rendered on the right side */
  right?: React.ReactNode;
  /** Render title on the left (dashboard style) instead of centred */
  leftTitle?: boolean;
}

export function ScreenHeader({
  title,
  back = false,
  onBack,
  right,
  leftTitle = false,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View style={styles.row}>
      {/* Left */}
      <View style={styles.side}>
        {back && (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={16}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      {leftTitle ? (
        <Text style={[styles.titleLeft, { marginLeft: back ? 0 : 0 }]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <Text style={styles.titleCenter} numberOfLines={1}>
          {title}
        </Text>
      )}

      {/* Right */}
      <View style={[styles.side, styles.sideRight]}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 14,
    backgroundColor: Colors.bg,
  },
  side: {
    width: 40,
    alignItems: "flex-start",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  titleCenter: {
    flex: 1,
    textAlign: "center",
    ...T.headingMD,
    color: Colors.textPrimary,
  },
  titleLeft: {
    flex: 1,
    textAlign: "left",
    ...T.headingMD,
    color: Colors.textPrimary,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
