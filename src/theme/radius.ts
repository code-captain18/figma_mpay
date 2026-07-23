export const Radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  "2xl": 22,
  "3xl": 28,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof Radius;
