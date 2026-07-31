import type { TextStyle } from "react-native";

const FONT_FAMILY = {
  regular:   "Urbanist_400Regular",
  medium:    "Urbanist_500Medium",
  semibold:  "Urbanist_600SemiBold",
  bold:      "Urbanist_700Bold",
  extrabold: "Urbanist_800ExtraBold",
  black:     "Urbanist_800ExtraBold",
} as const;

/** Canonical type scale */
export const T = {
  // Large display amounts (wallet balance)
  display: {
    fontFamily: FONT_FAMILY.extrabold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1,
  } satisfies TextStyle,

  headingXL: {
    fontFamily: FONT_FAMILY.extrabold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.6,
  } satisfies TextStyle,

  headingLG: {
    fontFamily: FONT_FAMILY.extrabold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  headingMD: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  headingSM: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  bodyLG: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  } satisfies TextStyle,

  bodyMD: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13.5,
    lineHeight: 20,
    letterSpacing: 0,
  } satisfies TextStyle,

  bodySM: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12.5,
    lineHeight: 18,
    letterSpacing: 0,
  } satisfies TextStyle,

  caption: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.1,
  } satisfies TextStyle,

  label: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
  } satisfies TextStyle,

  button: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15.5,
    lineHeight: 20,
    letterSpacing: 0.1,
  } satisfies TextStyle,

  // Amounts (transaction list, dashboard)
  amount: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  amountLG: {
    fontFamily: FONT_FAMILY.extrabold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.4,
  } satisfies TextStyle,
} as const;

export { FONT_FAMILY };
export type TypographyKey = keyof typeof T;
