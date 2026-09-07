import { apiCheckTransactionStatus, apiGetWalletBalances, apiLoadWalletFromWallet, apiLoadWalletMoMo, apiSendMoMo } from '@/api';
import { GradHdr } from '@/components/services/GradHdr';
import { WalletConfirm } from '@/components/wallet/WalletConfirm';
import { WalletForm } from '@/components/wallet/WalletForm';
import { WalletHome } from '@/components/wallet/WalletHome';
import { WalletProcessing } from '@/components/wallet/WalletProcessing';
import { WalletSuccess } from '@/components/wallet/WalletSuccess';
import type { WFState, WalletView } from '@/components/wallet/types';
import { QK, useProfileData, useWalletBalances } from '@/hooks/useAppQueries';
import { useAuth } from '@/store/auth.store';
import { useToast } from '@/store/toast.store';
import { C } from '@/theme';
import { genWalletRef } from '@/utils/ref';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, View } from 'react-native';

const BLUE_GRAD = { colors: [C.gradientStart, C.blue, C.gradientEnd] as [string, string, string], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };

export default function WalletScreen() {
  const [view, setView] = useState<WalletView>('home');
  const [from, setFrom] = useState<WalletView>('etopup-form');
  const [formData, setFormData] = useState<WFState | null>(null);
  const [loading, setLoading] = useState(false);
  const processingCancelledRef = useRef(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const { data: profileData } = useProfileData();
  const { data: balancesData, isFetching: balanceLoading, refetch: fetchBalances } = useWalletBalances();
  const balances = balancesData ?? { topup: 0, momo: 0 };

  useFocusEffect(useCallback(() => { setStatusBarStyle(view === 'success' ? 'dark' : 'light'); fetchBalances(); }, [fetchBalances, view]));

  useEffect(() => { setStatusBarStyle(view === 'success' ? 'dark' : 'light'); }, [view]);

  // Block Android back press while an API call is in flight
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => loading);
    return () => sub.remove();
  }, [loading]);

  const titles: Record<WalletView, string> = {
    home: 'Wallet', 'etopup-form': 'Load e Top-Up Wallet',
    'momo-form': 'Load mPay Wallet', 'momo-send': 'Cash Disbursement',
    confirm: 'Confirm Transaction', processing: 'Processing Transaction', success: 'Success',
  };
  const backTo: Record<WalletView, WalletView> = {
    home: 'home', 'etopup-form': 'home',
    'momo-form': 'home', 'momo-send': 'home', confirm: from, processing: 'confirm', success: 'home',
  };

  const handleConfirm = useCallback(async () => {
    if (!formData) return;
    setLoading(true);
    const capturedFrom = from;
    const amount = Number(formData.amount);
    const phone = formData.phoneNumber ? formData.phoneNumber.replace(/\s/g, '') : undefined;
    const payload = {
      amount,
      phoneNumber: phone,
      referenceId: formData.referenceId,
      product: formData.product as 'MMONEYDB' | 'MOMOWALLET' | 'MOMOCASHOUT' | 'MOMOCASHIN',
      accountId: formData.accountId,
    };

    const pollStatus = (refId: string, initialDelayMs = 0): Promise<void> =>
      new Promise((resolve, reject) => {
        const t0 = Date.now();
        const check = async () => {
          const elapsed = Date.now() - t0;
          if (elapsed >= 300_000) { reject(new Error('Transaction timed out.')); return; }
          try {
            const r = await apiCheckTransactionStatus(refId);
            if (r.status === 'success') { resolve(); return; }
            if (r.status === 'failed') { reject(new Error(r.entry?.Message ?? 'Transaction failed.')); return; }
          } catch { /* retry */ }
          setTimeout(check, elapsed < 30_000 ? 1_000 : elapsed < 90_000 ? 2_000 : 5_000);
        };
        setTimeout(check, initialDelayMs);
      });

    if (
      (formData.product === 'MOMOCASHIN' || formData.product === 'MOMOWALLET') &&
      amount > balances.momo
    ) {
      setLoading(false);
      toast.show('Insufficient Mobile Money balance.', 'error');
      return;
    }

    const invalidate = () => {
      fetchBalances();
      queryClient.invalidateQueries({ queryKey: QK.walletBalances });
    };

    // Poll until the balance(s) actually change from their pre-transaction snapshot
    // (backend settlement can lag behind a "success" status), so wallet home never shows a stale figure.
    const pollUntilSettled = (isSettled: (b: { topup: number; momo: number }) => boolean, onDone: () => void) => {
      const t0 = Date.now();
      const tick = () => {
        apiGetWalletBalances().then((b) => {
          if (isSettled(b) || Date.now() - t0 >= 30_000) {
            queryClient.setQueryData(QK.walletBalances, b);
            onDone();
            return;
          }
          setTimeout(tick, 2000);
        }).catch(() => { if (Date.now() - t0 < 30_000) setTimeout(tick, 2000); else { invalidate(); onDone(); } });
      };
      setTimeout(tick, 2000);
    };

    try {
      const snapTopup = balances.topup;
      const snapMomo = balances.momo;

      if (formData.product === 'MOMOWALLET') {
        await apiLoadWalletFromWallet(payload);
        setLoading(false);
        setView('processing');
        pollUntilSettled(b => b.topup !== snapTopup && b.momo !== snapMomo, () => setView('success'));
      } else if (formData.product === 'MOMOCASHIN') {
        await apiSendMoMo(payload);
        await pollStatus(formData.referenceId);
        setLoading(false);
        setView('success');
        pollUntilSettled(b => b.momo !== snapMomo, () => { });
      } else {
        await apiLoadWalletMoMo(payload);
        processingCancelledRef.current = false;
        setLoading(false);
        setView('processing');
        pollStatus(formData.referenceId, 5_000)
          .then(() => {
            if (processingCancelledRef.current) return;
            const isSettled = formData.product === 'MMONEYDB'
              ? (b: { topup: number; momo: number }) => b.topup !== snapTopup
              : (b: { topup: number; momo: number }) => b.momo !== snapMomo;
            pollUntilSettled(isSettled, () => setView('success'));
          })
          .catch((pollErr: any) => {
            if (processingCancelledRef.current) return;
            setFormData(p => p ? { ...p, referenceId: genWalletRef() } : p);
            toast.show(pollErr.message ?? 'Transaction failed. Please try again.', 'error');
            setView(capturedFrom);
          });
      }
    } catch (err: any) {
      setLoading(false);
      setFormData(p => p ? { ...p, referenceId: genWalletRef() } : p);
      if (err.message?.startsWith('Wallet load incomplete')) {
        Alert.alert(
          'Action Required',
          err.message,
          [{ text: 'OK', style: 'default' }],
        );
      } else {
        toast.show(err.message ?? 'Transaction failed. Please try again.', 'error');
      }
    }
  }, [formData, from, fetchBalances, toast, queryClient, balances.momo]);

  const reset = () => { setView('home'); setFormData(null); };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {view !== 'success' && (
        <GradHdr
          title={titles[view]}
          onBack={view !== 'home' && view !== 'processing' ? () => setView(backTo[view]) : undefined}
          gradient={BLUE_GRAD}
        />
      )}

      {view === 'home' && (
        <WalletHome onSelect={setView} topup={balances.topup} momo={balances.momo} balanceLoading={balanceLoading} onRefresh={fetchBalances} />
      )}

      {(view === 'etopup-form' || view === 'momo-form' || view === 'momo-send') && (
        <WalletForm
          key={view}
          isMoMo={view === 'momo-form' || view === 'momo-send'}
          isSend={view === 'momo-send'}
          initialProduct={view === 'momo-send' ? 'MOMOCASHIN' : undefined}
          onBack={() => setView('home')}
          onSubmit={d => { setFormData(d); setFrom(view); setView('confirm'); }}
        />
      )}

      {view === 'confirm' && formData && (
        <WalletConfirm formData={formData} walletType={from} onConfirm={handleConfirm} onCancel={() => setView(from)} loading={loading} />
      )}

      {view === 'processing' && formData && (
        <WalletProcessing referenceId={formData.referenceId} walletToWallet={formData.product === 'MOMOWALLET'} />
      )}

      {view === 'success' && formData && (
        <WalletSuccess
          amount={`GHS ${Number(formData.amount).toFixed(2)}`}
          reference={formData.referenceId}
          title={formData.product === 'MOMOCASHIN' ? 'Money Sent!' : 'Wallet Loaded!'}
          onDone={reset}
        />
      )}
    </View>
  );
}
