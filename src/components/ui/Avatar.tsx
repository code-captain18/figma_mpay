/**
 * Avatar — Initials-based circular avatar used in Profile + Dashboard.
 */
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { Colors, T } from "@/theme";

interface AvatarProps {
  initials: string;
  size?: number;
}

export function Avatar({ initials, size = 40 }: AvatarProps) {
  const fontSize = Math.round(size * 0.36);
  const borderRadius = size / 2;

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, { width: size, height: size, borderRadius }]}
    >
      <Text style={[styles.text, { fontSize }]}>{initials}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "Urbanist_700Bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
});
