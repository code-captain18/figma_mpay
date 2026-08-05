import { useCallback, useState } from 'react';
import { C } from '@/theme';

type WalletView = 'home' | 'etopup-form' | 'momo-form' | 'confirm' | 'success';

interface WFState {
  type: 'etopup' | 'momo';
  amount: string;
  phone?: string;
  network?: string;
  ref: string;
}

export type { WalletView, WFState };

export function useWalletFlow() {
  const [view, setView] = useState<WalletView>('home');
  const [from, setFrom] = useState<WalletView>('etopup-form');
  const [formData, setFormData] = useState<WFState | null>(null);
  const [loading, setLoading] = useState(false);

  const titles: Record<WalletView, string> = {
    home: 'Wallet',
    'etopup-form': 'Load e Top-Up Wallet',
    'momo-form': 'Load Mobile Money',
    confirm: 'Confirm Transaction',
    success: 'Success',
  };

  const backTo: Record<WalletView, WalletView> = {
    home: 'home',
    'etopup-form': 'home',
    'momo-form': 'home',
    confirm: from,
    success: 'home',
  };

  const headerColors: Record<WalletView, readonly [string, string, string]> = {
    home: [C.gradientStart, C.blue, C.gradientEnd],
    'etopup-form': [C.gradientStart, C.blue, C.gradientEnd],
    'momo-form': ['#12C47E', '#0A9260', '#065C3D'],
    confirm: [C.gradientStart, C.blue, C.gradientEnd],
    success: [C.gradientStart, C.blue, C.gradientEnd],
  };

  const handleConfirm = useCallback(() => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setView('success'); }, 1800);
  }, []);

  const navigateTo = useCallback((v: WalletView, fromView?: WalletView) => {
    if (fromView) setFrom(fromView);
    setView(v);
  }, []);

  const reset = useCallback(() => {
    setView('home');
    setFormData(null);
  }, []);

  return {
    view, setView, navigateTo,
    from,
    formData, setFormData,
    loading,
    titles, backTo, headerColors,
    handleConfirm, reset,
  };
}
