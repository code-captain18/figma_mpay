import { Platform } from "react-native";

export function shadowStyle(opacity = 0.06, radius = 8, yOff = 2) {
    return (
        Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: yOff },
                shadowOpacity: opacity,
                shadowRadius: radius,
            },
            android: { elevation: Math.ceil(radius / 2) },
        }) ?? {}
    );
}
