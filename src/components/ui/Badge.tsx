/**
 * Badge — Small status pill used for transaction status, etc.
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius, T } from "@/theme";

type Status = "success" | "pending" | "failed" | "info";

interface BadgeProps {
  label: string;
  status?: Status;
}

const MAP: Record<Status, { bg: string; text: string }> = {
  success: { bg: Colors.successBg,  text: Colors.success },
  pending: { bg: Colors.warningBg,  text: Colors.warning },
  failed:  { bg: Colors.errorBg,    text: Colors.error   },
  info:    { bg: Colors.infoBg,     text: Colors.info    },
};

export function Badge({ label, status = "info" }: BadgeProps) {
  const c = MAP[status];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  text: {
    ...T.caption,
    fontFamily: "Urbanist_600SemiBold",
  },
});
