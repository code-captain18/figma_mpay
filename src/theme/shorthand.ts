import { Colors } from "./colors";
import { FONT_FAMILY } from "./typography";

/** Flat color shorthands – `C.navy`, `C.blue`, `C.red`, … */
export const C = Colors;

/**
 * Font-family shorthands.
 * `black` is aliased to `extrabold` (no 900-weight in the loaded font set).
 */
export const F = {
    ...FONT_FAMILY,
    black: FONT_FAMILY.extrabold,
} as const;

/** Gradient presets used across screens */
export const G = {
    /** Full-screen login background — deep navy top-left → sky blue bottom-right */
    login: {
        colors: ["#052D6E", "#1878CE", "#4BAEE8"] as [string, string, string],
        start: { x: 0, y: 0 },
        end: { x: 0.7, y: 1 },
    },
    /** Primary action button — sky → mid-blue → navy, left to right */
    wallet: {
        colors: ["#4BAEE8", "#1878CE", "#071830"] as [string, string, string],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
    },
} as const;

/** Button dimension tokens */
export const BTN = {
    primaryR: 14,   // border radius
    primaryH: 54,   // height
    primaryFS: 15,  // font size — matches T.button
} as const;
