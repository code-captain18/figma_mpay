import { Colors } from "@/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity } from "react-native";

interface GradientButtonProps {
    label: string;
    onPress?: () => void;
    disabled?: boolean;
}

export function GradientButton({ label, onPress, disabled }: GradientButtonProps) {
    return (
        <LinearGradient
            colors={
                disabled
                    ? ["#D8EAF6", "#D8EAF6"]
                    : [
                        Colors.buttonGradientStart,
                        Colors.buttonGradientHighlight,
                        Colors.buttonGradientMid,
                        Colors.buttonGradientEnd,
                    ]
            }
            locations={disabled ? [0, 1] : [0, 0.24, 0.58, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl"
        >
            <TouchableOpacity
                onPress={disabled ? undefined : onPress}
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                className="py-4 items-center"
            >
                <Text
                    className="text-sm font-extrabold"
                    style={{
                        color: disabled ? Colors.pale : "#fff",
                        fontFamily: "Urbanist_800ExtraBold",
                    }}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}
