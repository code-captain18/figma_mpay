import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  BellRing,
  Droplets,
  FileText,
  Globe,
  HelpCircle,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Phone,
  PiggyBank,
  ScanFace,
  ScrollText,
  ShieldCheck,
  Smartphone,
  Star,
  Tv,
  Wifi,
  Zap,
} from "lucide-react-native";
import React from "react";
import type { LucideProps } from "lucide-react-native";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Phone,
  Wifi,
  Smartphone,
  ArrowDownLeft,
  ArrowUpRight,
  MoreHorizontal,
  Zap,
  Droplets,
  Tv,
  ShieldCheck,
  PiggyBank,
  Banknote,
  Globe,
  MessageSquare,
  Pencil,
  Lock,
  ScanFace,
  BellRing,
  HelpCircle,
  Star,
  FileText,
  ScrollText,
};

interface IconProps {
  name: string;
  size: number;
  color: string;
}

export function Icon({ name, size, color }: IconProps) {
  const Component = ICON_MAP[name];
  if (!Component) return null;
  return <Component size={size} color={color} />;
}
