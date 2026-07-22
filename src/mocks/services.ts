import { Colors } from "@/theme/colors";
import type {
  FeaturedOffer,
  ProfileSection,
  QuickAction,
  ServiceCategory,
} from "@/types";

export const MOCK_QUICK_ACTIONS: QuickAction[] = [
  { label: "Airtime", iconName: "Phone", color: Colors.blue, bg: "rgba(24,120,206,0.1)" },
  { label: "Data Bundle", iconName: "Wifi", color: Colors.green, bg: "rgba(13,168,112,0.1)" },
  { label: "Mobile Money", iconName: "Smartphone", color: Colors.orange, bg: "rgba(233,145,10,0.1)" },
  { label: "More", iconName: "MoreHorizontal", color: Colors.muted, bg: "rgba(107,123,164,0.1)" },
];

export const MOCK_SALES_CARDS = [
  { label: "Data Bundle", iconName: "Wifi", color: Colors.green, bg: "rgba(13,168,112,0.1)", amount: "GHS0.00" },
  { label: "Airtime", iconName: "Phone", color: Colors.blue, bg: "rgba(24,120,206,0.1)", amount: "GHS0.00" },
  { label: "Mobile Money", iconName: "Smartphone", color: Colors.orange, bg: "rgba(233,145,10,0.1)", amount: "GHS0.00" },
];

export const MOCK_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    title: "Airtime & Data",
    color: Colors.blue,
    services: [
      { label: "Airtime Top-Up", iconName: "Phone", color: Colors.blue, bg: "rgba(24,120,206,0.1)", badge: null },
      { label: "Data Bundle", iconName: "Wifi", color: Colors.green, bg: "rgba(13,168,112,0.1)", badge: "Popular" },
      { label: "SMS Bundle", iconName: "MessageSquare", color: Colors.purple, bg: "rgba(124,92,252,0.1)", badge: null },
      { label: "Night Bundle", iconName: "Globe", color: Colors.muted, bg: "rgba(92,122,158,0.1)", badge: null },
    ],
  },
  {
    title: "Mobile Money",
    color: Colors.orange,
    services: [
      { label: "Send Money", iconName: "ArrowUpRight", color: Colors.red, bg: "rgba(232,51,74,0.1)", badge: null },
      { label: "Receive Money", iconName: "ArrowDownLeft", color: Colors.green, bg: "rgba(13,168,112,0.1)", badge: null },
      { label: "MoMo Withdrawal", iconName: "Smartphone", color: Colors.orange, bg: "rgba(233,145,10,0.1)", badge: null },
      { label: "MoMo Pay", iconName: "Smartphone", color: Colors.blue, bg: "rgba(24,120,206,0.1)", badge: "New" },
    ],
  },
  {
    title: "Bills & Utilities",
    color: Colors.green,
    services: [
      { label: "Electricity", iconName: "Zap", color: Colors.orange, bg: "rgba(233,145,10,0.1)", badge: null },
      { label: "Water Bill", iconName: "Droplets", color: Colors.blue, bg: "rgba(24,120,206,0.1)", badge: null },
      { label: "TV / Cable", iconName: "Tv", color: Colors.purple, bg: "rgba(124,92,252,0.1)", badge: null },
      { label: "Internet", iconName: "Wifi", color: Colors.green, bg: "rgba(13,168,112,0.1)", badge: null },
    ],
  },
  {
    title: "Financial Services",
    color: Colors.purple,
    services: [
      { label: "Buy Insurance", iconName: "ShieldCheck", color: Colors.green, bg: "rgba(13,168,112,0.1)", badge: null },
      { label: "Savings Plan", iconName: "PiggyBank", color: Colors.blue, bg: "rgba(24,120,206,0.1)", badge: null },
      { label: "Loan Repayment", iconName: "Banknote", color: Colors.orange, bg: "rgba(233,145,10,0.1)", badge: null },
      { label: "Int'l Transfer", iconName: "Globe", color: Colors.purple, bg: "rgba(124,92,252,0.1)", badge: "New" },
    ],
  },
];

export const MOCK_FEATURED_OFFERS: FeaturedOffer[] = [
  {
    label: "Double Data",
    sub: "Get 2x data on any MTN bundle today only",
    color: Colors.green,
    iconName: "Wifi",
  },
  {
    label: "Free Transfer",
    sub: "Zero fees on MoMo sends above GHS50",
    color: Colors.blue,
    iconName: "ArrowUpRight",
  },
];

export const MOCK_PROFILE_SECTIONS: ProfileSection[] = [
  {
    title: "Account",
    items: [
      { iconName: "Pencil", label: "Edit Profile", color: Colors.blue, bg: "rgba(24,120,206,0.1)" },
      { iconName: "Lock", label: "Change PIN / Password", color: Colors.purple, bg: "rgba(124,92,252,0.1)" },
      { iconName: "ScanFace", label: "Biometric Login", color: Colors.green, bg: "rgba(13,168,112,0.1)", badge: "On" },
      { iconName: "ShieldCheck", label: "KYC Verification", color: Colors.orange, bg: "rgba(233,145,10,0.1)", badge: "Verified" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { iconName: "BellRing", label: "Notifications", color: Colors.blue, bg: "rgba(24,120,206,0.1)" },
      { iconName: "Globe", label: "Language", color: Colors.green, bg: "rgba(13,168,112,0.1)", badge: "English" },
    ],
  },
  {
    title: "Support",
    items: [
      { iconName: "HelpCircle", label: "Help Center", color: Colors.purple, bg: "rgba(124,92,252,0.1)" },
      { iconName: "MessageSquare", label: "Report an Issue", color: Colors.red, bg: "rgba(232,51,74,0.1)" },
      { iconName: "Star", label: "Rate the App", color: Colors.orange, bg: "rgba(233,145,10,0.1)" },
    ],
  },
  {
    title: "Legal",
    items: [
      { iconName: "FileText", label: "Privacy Policy", color: Colors.muted, bg: "rgba(107,123,164,0.1)" },
      { iconName: "ScrollText", label: "Terms of Service", color: Colors.muted, bg: "rgba(107,123,164,0.1)" },
    ],
  },
];
