import type { Wallet, WalletCard } from "@/types";
import { Colors } from "@/theme/colors";

export const MOCK_WALLETS: Wallet[] = [
  { id: "etopup", label: "eTop-Up Wallet", amount: "GHS3.05", sub: "Available balance" },
  { id: "momo", label: "Mobile Money Wallet", amount: "GHS1.34", sub: "MoMo balance" },
];

export const MOCK_WALLET_CARDS: WalletCard[] = [
  {
    id: "etopup",
    label: "eTop-Up Wallet",
    balance: 3.05,
    number: "****  ****  ****  4821",
    colors: [Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd],
  },
  {
    id: "momo",
    label: "Mobile Money Wallet",
    balance: 1.34,
    number: "****  ****  ****  7703",
    colors: [Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd],
  },
];
