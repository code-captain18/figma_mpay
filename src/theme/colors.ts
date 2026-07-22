export const Colors = {
    bg: "#EFF5FC",
    navy: "#071830",
    blue: "#1878CE",
    sky: "#4BAEE8",
    deep: "#052D6E",
    mid: "#2B5080",
    muted: "#5C7A9E",
    light: "#7A9ABE",
    pale: "#A0BEDC",
    green: "#0DA870",
    orange: "#E9910A",
    red: "#E8334A",
    purple: "#7C5CFC",
    border: "rgba(24,120,206,0.12)",
    divider: "#E0EDF8",
    white: "#FFFFFF",

    // Primary gradient stops
    gradientStart: "#2B2EE7",
    gradientMid: "#2428D9",
    gradientEnd: "#1E21CC",

    // Rich button gradient stops (same primary blue family)
    buttonGradientStart: "#2F35F0",
    buttonGradientHighlight: "#2B2EE7",
    buttonGradientMid: "#2428D9",
    buttonGradientEnd: "#1E21CC",
} as const;

export type ColorKey = keyof typeof Colors;
