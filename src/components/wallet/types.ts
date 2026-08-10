export type WalletView =
  | 'home'
  | 'etopup-form'
  | 'momo-form'
  | 'momo-send'
  | 'confirm'
  | 'processing'
  | 'success';

export interface WFState {
  product: string;
  accountId: string;
  amount: string;
  phoneNumber: string;
  referenceId: string;
}
