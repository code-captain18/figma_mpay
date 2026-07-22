import React from "react";
import Svg, { Circle, Defs, Ellipse, Rect, Stop, LinearGradient as SvgLinearGradient } from "react-native-svg";

interface OrbitalMarkProps {
  size?: number;
}

export function OrbitalMark({ size = 56 }: OrbitalMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Defs>
        <SvgLinearGradient id="og" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#4BAEE8" />
          <Stop offset="0.45" stopColor="#1878CE" />
          <Stop offset="1" stopColor="#052D6E" />
        </SvgLinearGradient>
      </Defs>
      <Rect width="56" height="56" rx="15" fill="url(#og)" />
      <Circle cx="25" cy="25" r="13" fill="white" />
      <Circle cx="31.5" cy="19.5" r="11.5" fill="url(#og)" />
      <Ellipse
        cx="29"
        cy="30"
        rx="20"
        ry="6.5"
        stroke="#0B2A5E"
        strokeWidth="3.8"
        strokeLinecap="round"
        transform="rotate(-22, 29, 30)"
        opacity={0.95}
      />
    </Svg>
  );
}
