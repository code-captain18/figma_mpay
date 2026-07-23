import { Platform } from "react-native";
import type { ViewStyle } from "react-native";

const s = (opacity: number, radius: number, yOff: number, elevation: number): ViewStyle =>
  Platform.OS === "ios"
    ? {
        shadowColor: "#071830",
        shadowOpacity: opacity,
        shadowRadius: radius,
        shadowOffset: { width: 0, height: yOff },
      }
    : { elevation };

export const Shadows = {
  none:   {} as ViewStyle,
  subtle: s(0.05, 6,  1, 2),
  medium: s(0.08, 10, 3, 5),
  strong: s(0.13, 18, 6, 10),
} as const;

/** Legacy helper for code that passes custom values */
export function shadowStyle(opacity = 0.06, radius = 8, yOff = 2): ViewStyle {
  return s(opacity, radius, yOff, Math.ceil(radius / 2));
}

export type ShadowKey = keyof typeof Shadows;
