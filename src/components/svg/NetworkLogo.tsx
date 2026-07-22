import React from "react";
import { Image, View } from "react-native";

interface NetworkLogoProps {
  id: string;
  size?: number;
}

export const networkLogoSource = {
  mtn: require("../../../assets/images/MTN.jpeg"),
  telecel: require("../../../assets/images/telecel.png"),
  airteltigo: require("../../../assets/images/at.png"),
} as const;

export function NetworkLogo({ id, size = 36 }: NetworkLogoProps) {
  const source = networkLogoSource[id as keyof typeof networkLogoSource] ?? networkLogoSource.airteltigo;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <Image source={source} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
    </View>
  );
}
