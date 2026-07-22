export type TransactionStatus = "success" | "pending";

export type TransactionCategory =
  | "Airtime"
  | "Data Bundle"
  | "Top-Up"
  | "Mobile Money";

export interface Transaction {
  id: number;
  label: string;
  time: string;
  status: TransactionStatus;
  amount: number;
  iconName: string;
  color: string;
  bg: string;
  ref: string;
  date: string;
  recipient: string;
  network: string;
  fee: number;
  category: TransactionCategory;
}

export interface Wallet {
  id: string;
  label: string;
  amount: string;
  sub: string;
}

export interface WalletCard {
  id: string;
  label: string;
  balance: number;
  number: string;
  colors: readonly [string, string, string];
}

export interface Network {
  id: string;
  label: string;
  color: string;
  bg: string;
  textDark: string;
}

export interface Bundle {
  id: string;
  size: string;
  validity: string;
  price: number;
  tag?: string;
}

export type BundleDuration = "Daily" | "Weekly" | "Monthly";

export interface ServiceItem {
  label: string;
  iconName: string;
  color: string;
  bg: string;
  badge?: string | null;
}

export interface ServiceCategory {
  title: string;
  color: string;
  services: ServiceItem[];
}

export interface FeaturedOffer {
  label: string;
  sub: string;
  color: string;
  iconName: string;
}

export interface ProfileSectionItem {
  iconName: string;
  label: string;
  color: string;
  bg: string;
  badge?: string;
}

export interface ProfileSection {
  title: string;
  items: ProfileSectionItem[];
}

export interface QuickAction {
  label: string;
  iconName: string;
  color: string;
  bg: string;
}
