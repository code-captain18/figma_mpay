import type { Network } from "@/types";

export const NETWORKS: Network[] = [
  {
    id: "mtn",
    label: "MTN",
    color: "#F5A623",
    bg: "rgba(245,166,35,0.12)",
    textDark: "#7A5000",
  },
  {
    id: "telecel",
    label: "Telecel",
    color: "#E8334A",
    bg: "rgba(232,51,74,0.1)",
    textDark: "#7A1020",
  },
  {
    id: "airteltigo",
    label: "AirtelTigo",
    color: "#1878CE",
    bg: "rgba(24,120,206,0.1)",
    textDark: "#0A3060",
  },
];

export const PRESET_AMOUNTS = [1, 2, 5, 10, 20, 50] as const;
