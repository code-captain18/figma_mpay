/**
 * Screen — Consistent full-screen wrapper with SafeArea + bg color.
 */
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, SCREEN_PADDING } from "@/theme";

type Edges = React.ComponentProps<typeof SafeAreaView>["edges"];

interface ScreenProps {
  children: React.ReactNode;
  /** Use when the content should scroll */
  scroll?: boolean;
  /** Extra horizontal padding for screens that need none (e.g. full-bleed cards) */
  noPadding?: boolean;
  style?: object;
  contentStyle?: object;
  edges?: Edges;
}

export function Screen({
  children,
  scroll = false,
  noPadding = false,
  style,
  contentStyle,
  edges = ["top"],
}: ScreenProps) {
  const inner = noPadding
    ? contentStyle
    : [{ paddingHorizontal: SCREEN_PADDING }, contentStyle];

  if (scroll) {
    return (
      <SafeAreaView
        style={[styles.root, style]}
        edges={edges}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingBottom: 32 }, inner]}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, style]} edges={edges}>
      <View style={[styles.flex, inner]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
});
