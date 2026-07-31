export { Colors }      from "./colors";
export type { ColorKey } from "./colors";

export { T, FONT_FAMILY } from "./typography";
export type { TypographyKey } from "./typography";

export { Spacing, SCREEN_PADDING, SECTION_GAP } from "./spacing";
export type { SpacingKey } from "./spacing";

export { Radius } from "./radius";
export type { RadiusKey } from "./radius";

export { Shadows, shadowStyle } from "./shadows";
export type { ShadowKey } from "./shadows";

// ── Convenience aliases used by profile & service screens ─────────────────────
export { Colors as C }      from "./colors";
export { FONT_FAMILY as F } from "./typography";

/** Gradient presets shared across screens */
export const G = {
  avatar: {
    colors: ['#4BAEE8', '#1878CE'] as [string, string],
    start:  { x: 0, y: 0 },
    end:    { x: 1, y: 1 },
  },
  wallet: {
    colors: ['#4BAEE8', '#1878CE', '#052D6E'] as [string, string, string],
    start:  { x: 0, y: 0 },
    end:    { x: 1, y: 1 },
  },
  header: {
    colors: ['#4BAEE8', '#1878CE', '#052D6E'] as [string, string, string],
    start:  { x: 0, y: 0 },
    end:    { x: 1, y: 1 },
  },
} as const;
