/** Base unit: 4px */
export const Spacing = {
  px:  1,
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

/** Standard screen horizontal padding */
export const SCREEN_PADDING = Spacing["2xl"];
/** Standard section vertical gap */
export const SECTION_GAP = Spacing["2xl"];

export type SpacingKey = keyof typeof Spacing;
