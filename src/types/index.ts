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

// ── History screen ────────────────────────────────────────────────────────────
export interface TxRecord {
  id: string;
  ref: string;
  createdAt: string;
  status: 'success' | 'pending' | 'failed';
  type: SvcType;
  network: string;
  phone: string;
  amount: number;
  fee: number;
  bundle?: string;
  momoType?: string;
  accountId?: string;
}

export interface FilterState {
  status: string;
  svcType: string;
  phone: string;
  ref: string;
  dateFrom: string;
  dateTo: string;
  amtMin: string;
  amtMax: string;
}

// ── Services screen ────────────────────────────────────────────────────────────
export type SvcType = 'airtime' | 'data' | 'fibre' | 'bulk' | 'momo';
export type SvcView = SvcType | 'home' | 'confirm' | 'success';
export type MomoType = 'send' | 'withdraw' | 'cashin';

export interface SvcBundle {
  id: string;
  label: string;
  price: number;
  tag?: string;
}

export interface SFState {
  network: string;
  phone: string;
  amount: string;
  bundle: SvcBundle | null;
  reference: string;
  momoType: MomoType;
  provider: string;
  desc: string;
}

export interface BulkItem {
  id: string;
  phone: string;
  network: string;
  amount: string;
}

// ── Profile screen ─────────────────────────────────────────────────────────────
export type PermKey = 'view' | 'create' | 'approve' | 'export' | 'delete';
export type PermMap = Record<string, Record<PermKey, boolean>>;
export type ProfileView = 'home' | 'edit' | 'password' | 'assistants' | 'add-asst' | 'edit-asst';

export interface Assistant {
  id: string;
  assistantId?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  status: 'active' | 'inactive';
  permissions: PermMap;
  createdAt: string;
  idProofType?: string;
  idNumber?: string;
}
