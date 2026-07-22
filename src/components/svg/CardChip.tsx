import React from "react";
import Svg, { Line, Rect } from "react-native-svg";

export function CardChip() {
  return (
    <Svg width="32" height="24" viewBox="0 0 32 24">
      <Rect width="32" height="24" rx="4" fill="rgba(255,255,255,0.22)" />
      <Rect x="1" y="8" width="30" height="8" fill="rgba(255,255,255,0.08)" />
      <Rect x="8" y="4" width="16" height="16" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
      <Line x1="8" y1="12" x2="24" y2="12" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <Line x1="16" y1="4" x2="16" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    </Svg>
  );
}
