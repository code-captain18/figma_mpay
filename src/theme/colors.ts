// ─── Primitive palette ────────────────────────────────────────────────────────
const palette = {
  // Blues
  navy900: "#071830",
  navy800: "#0D2545",
  blue700: "#0F3A7A",
  blue600: "#1565C0",
  blue500: "#1878CE",
  blue400: "#2B9BEF",
  blue300: "#6FC0F6",
  blue200: "#BAE0FB",
  blue100: "#E6F3FF",
  blue50:  "#F0F7FF",

  // Gradient family
  grad0: "#2B2EE7",
  grad1: "#2428D9",
  grad2: "#1E21CC",

  // Neutrals
  white:   "#FFFFFF",
  gray50:  "#F8FAFF",
  gray100: "#EFF5FC",
  gray200: "#E0EDF8",
  gray300: "#C8DDEF",
  gray400: "#A0BEDC",
  gray500: "#7A9ABE",
  gray600: "#5C7A9E",
  gray700: "#2B5080",
  gray800: "#0D2545",

  // Semantic
  green600: "#0DA870",
  green100: "#E3F9F1",
  orange600: "#E9910A",
  orange100: "#FEF3E2",
  red600:   "#E8334A",
  red100:   "#FDEEF0",
  purple600: "#7C5CFC",
  purple100: "#F0EDFF",
} as const;

// ─── Semantic tokens ───────────────────────────────────────────────────────────
export const Colors = {
  // --- Brand ---
  primary:        palette.blue500,
  primaryDark:    palette.blue600,
  primaryLight:   palette.blue100,
  primaryPressed: palette.blue700,

  // --- Background levels ---
  bg:             palette.gray100,   // app background
  surface:        palette.white,     // cards, sheets
  surfaceRaised:  palette.gray50,    // slightly elevated
  overlay:        "rgba(7,24,48,0.45)",

  // --- Text ---
  textPrimary:    palette.navy900,
  textSecondary:  palette.gray700,
  textMuted:      palette.gray600,
  textLight:      palette.gray500,
  textDisabled:   palette.gray400,
  textOnDark:     palette.white,

  // --- Border / Divider ---
  border:   "rgba(24,120,206,0.12)",
  borderFocus: palette.blue500,
  borderError: palette.red600,
  divider:  palette.gray200,

  // --- Status ---
  success:    palette.green600,
  successBg:  palette.green100,
  warning:    palette.orange600,
  warningBg:  palette.orange100,
  error:      palette.red600,
  errorBg:    palette.red100,
  info:       palette.blue500,
  infoBg:     palette.blue100,

  // --- Accents ---
  green:  palette.green600,
  orange: palette.orange600,
  red:    palette.red600,
  purple: palette.purple600,
  greenBg:  palette.green100,
  orangeBg: palette.orange100,
  redBg:    palette.red100,
  purpleBg: palette.purple100,

  // --- Gradient stops ---
  gradientStart: palette.grad0,
  gradientMid:   palette.grad1,
  gradientEnd:   palette.grad2,

  // Button gradient (same family)
  buttonGradientStart:     "#2F35F0",
  buttonGradientHighlight: palette.grad0,
  buttonGradientMid:       palette.grad1,
  buttonGradientEnd:       palette.grad2,

  // --- Legacy aliases (kept for gradual migration) ---
  navy:  palette.navy900,
  sky:   palette.blue400,
  deep:  palette.navy800,
  mid:   palette.gray700,
  muted: palette.gray600,
  light: palette.gray500,
  pale:  palette.gray400,
  white: palette.white,
  blue:  palette.blue500,
} as const;

export type ColorKey = keyof typeof Colors;
export { palette };
