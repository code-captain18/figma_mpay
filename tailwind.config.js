module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                mpay: {
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
                },
            },
            fontFamily: {
                sans: ["Urbanist_400Regular"],
                medium: ["Urbanist_500Medium"],
                semibold: ["Urbanist_600SemiBold"],
                bold: ["Urbanist_700Bold"],
                extrabold: ["Urbanist_800ExtraBold"],
            },
        },
    },
    plugins: [],
};