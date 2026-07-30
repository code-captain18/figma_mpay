import type { LucideProps } from "lucide-react-native";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Bell,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Code2,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  Globe,
  HelpCircle,
  Layers,
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
  TrendingDown,
  TrendingUp,
  Tv,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react-native";
import React from "react";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  // PascalCase (existing)
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
  // kebab-case
  "bell": Bell,
  "eye": Eye,
  "eye-off": EyeOff,
  "check-circle-2": CheckCircle2,
  "x-circle": XCircle,
  "arrow-down-left": ArrowDownLeft,
  "arrow-up-right": ArrowUpRight,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "globe": Globe,
  "code-2": Code2,
  "layers": Layers,
  "chevron-right": ChevronRight,
  "phone": Phone,
  "wifi": Wifi,
  "smartphone": Smartphone,
  "zap": Zap,
  "more-horizontal": MoreHorizontal,
  "arrow-right": ArrowRight,
  "banknote": Banknote,
  "layers": Layers,
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
