import type { BulkTxItem, LoadWalletPayload } from '@/api';
import { apiBulkUpload, apiLoadWalletMoMo, apiPurchaseAirtime, apiPurchaseData, apiSendMoMo } from '@/api';
import { AirtimeForm } from '@/components/services/AirtimeForm';
import { BulkForm } from '@/components/services/BulkForm';
import { ConfirmCard } from '@/components/services/ConfirmCard';
import { DataForm } from '@/components/services/DataForm';
import { FibreForm } from '@/components/services/FibreForm';
import { GradHdr } from '@/components/services/GradHdr';
import { MomoSvcForm } from '@/components/services/MomoSvcForm';
import { saneStr } from '@/components/services/ServiceFormPrimitives';
import { ServicesHome } from '@/components/services/ServicesHome';
import { SuccessCard } from '@/components/services/SuccessCard';
import { FIBRE_BUNDLES, FIBRE_PROVIDERS, GRADIENTS, SVC_DATA_BUNDLES } from '@/constants/services';
import { QK, useResellerProducts } from '@/hooks/useAppQueries';
import { useAuth } from '@/store/auth.store';
import { useToast } from '@/store/toast.store';
import { Colors } from '@/theme';
import type { BulkItem, SFState, SvcBundle, SvcType, SvcView } from '@/types';
import { pollTransactionStatus } from '@/utils/pollStatus';
import { genBtRef, genMsRef, genWalletRef } from '@/utils/ref';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

const C = Colors;
const G = GRADIENTS;

const mkInitSF = (): SFState => ({
  network: 'mtn', phone: '', amount: '', bundle: null,
  reference: genMsRef(), momoType: 'send', provider: '', desc: '',
});

export default function ServicesScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const isAssistant = user?.accountType?.toLowerCase() === 'assistant';
  const { open } = useLocalSearchParams<{ open?: string }>();
  const router = useRouter();
  const handledOpen = useRef<string | undefined>(undefined);

  const [view, setView] = useState<SvcView>('home');
  const [svcType, setSvcType] = useState<SvcType>('airtime');
  const [form, setForm] = useState<SFState>(mkInitSF);
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  const [ref, setRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: products = [] } = useResellerProducts();
  const queryClient = useQueryClient();

  useFocusEffect(useCallback(() => { setStatusBarStyle('light'); }, []));

  // Block Android back press while a transaction is submitting
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => submitting);
    return () => sub.remove();
  }, [submitting]);

  const findProduct = useCallback((network: string, type: string) =>
    products.find(p =>
      p.network.toUpperCase() === network.toUpperCase() &&
      p.Type.toLowerCase() === type.toLowerCase(),
    ), [products]);

  const getDataBundles = useCallback((networkId: string): SvcBundle[] => {
    const prod = findProduct(networkId, 'Data');
    if (!prod?.bundles?.length) return SVC_DATA_BUNDLES;
    return prod.bundles.map(b => {
      const isFlexi = (b.BundleType ?? '').toUpperCase() === 'FLEXI';
      const priceStr = b.BundlePrice ?? (b.Amount != null ? String(b.Amount) : '');
      let price = 0, priceMin: number | undefined, priceMax: number | undefined, priceLabel: string | undefined;
      if (isFlexi && priceStr) {
        const m = priceStr.match(/^([\d.]+)\s*[\u2013\-]\s*([\d.]+)$/);
        if (m) {
          priceMin = parseFloat(m[1]);
          priceMax = parseFloat(m[2]);
          price = priceMin;
          priceLabel = `GHS ${priceMin.toFixed(2)} \u2013 ${priceMax.toFixed(2)}`;
        } else {
          price = parseFloat(priceStr) || 0;
        }
      } else {
        price = parseFloat(priceStr) || (b.Amount ?? 0);
      }
      return {
        id: b.BundleCode,
        label: b.BundleCode,
        price,
        priceLabel,
        bundleCode: b.BundleCode,
        bundleType: b.BundleType,
        product: prod.prodCode,
        priceMin,
        priceMax,
      };
    });
  }, [findProduct]);

  const getFibreBundles = useCallback((provider: string): SvcBundle[] => {
    const prod = findProduct(provider, 'Fibre');
    if (!prod?.bundles?.length) return FIBRE_BUNDLES;
    return prod.bundles.map(b => ({
      id: b.BundleCode,
      label: [saneStr(b.BundleName), saneStr(b.Validity)].filter(Boolean).join(' \u00b7 '),
      price: b.Amount ?? 0,
      bundleCode: b.BundleCode,
      bundleType: b.BundleType,
      product: prod.prodCode,
    }));
  }, [findProduct]);

  const getFibreProviders = useCallback((): string[] => {
    const fibreNets = products.filter(p => p.Type === 'Fibre').map(p => p.network);
    return fibreNets.length ? fibreNets : FIBRE_PROVIDERS;
  }, [products]);

  useEffect(() => {
    const VALID: SvcType[] = ['airtime', 'data', 'fibre', 'bulk', 'momo'];
    if (open && open !== handledOpen.current && VALID.includes(open as SvcType)) {
      handledOpen.current = open;
      openSvc(open as SvcType);
      router.setParams({ open: '' });
    }
  }, [open]);

  const goHome = () => { setView('home'); setForm({ ...mkInitSF(), reference: genMsRef() }); };
  const openSvc = (id: SvcType) => { setSvcType(id); setView(id); };
  const toConfirm = (extra?: Record<string, unknown>) => { setPending(extra ?? null); setView('confirm'); };

  const gradFor: Record<SvcType, typeof G.wallet> = {
    airtime: G.wallet, data: G.green, fibre: G.purple, bulk: G.orange, momo: G.momo,
  };

  const handleConfirm = useCallback(async () => {
    setSubmitting(true);
    try {
      const assistantFields = isAssistant && user?.accountId ? {
        reselleraccountId: user.accountId,
        resellerAccountId: user.accountId,
        resellerId: user.accountId,
        resellerid: user.accountId,
      } : {};

      let txRef = form.reference;

      if (svcType === 'airtime') {
        const prod = findProduct(form.network, 'Airtime');
        const result = await apiPurchaseAirtime({
          amount: parseFloat(form.amount),
          phoneNumber: form.phone,
          product: prod?.prodCode ?? `${form.network.toUpperCase()}AIRTIME`,
          referenceId: form.reference,
          transactionDescription: `Airtime for ${form.network.toUpperCase()}`,
          ...assistantFields,
        });
        txRef = result.referenceId;

      } else if (svcType === 'data' || svcType === 'fibre') {
        const apiType = svcType === 'fibre' ? 'Fibre' : 'Data';
        const netKey = svcType === 'fibre' ? form.provider : form.network;
        const prod = findProduct(netKey, apiType);
        const result = await apiPurchaseData({
          amount: form.bundle!.bundleType?.toUpperCase() === 'FLEXI'
            ? parseFloat(form.amount) || form.bundle!.price
            : form.bundle!.price,
          phoneNumber: form.phone,
          product: form.bundle!.product ?? prod?.prodCode ?? form.bundle!.bundleCode ?? form.bundle!.id,
          bundleType: form.bundle!.bundleType ?? 'FIXED',
          bundleCode: form.bundle!.bundleCode ?? form.bundle!.id,
          referenceId: form.reference,
          transactionDescription: `${apiType} bundle for ${form.bundle!.product ?? prod?.prodCode ?? netKey.toUpperCase()}`,
          ...assistantFields,
        });
        if (result.referenceId) txRef = result.referenceId;

      } else if (svcType === 'bulk') {
        const bulkRows = (pending?.rows as BulkItem[]) ?? [];
        const bulkType = (pending?.bulkType as 'airtime' | 'data') ?? 'airtime';
        const sharedBnd = pending?.sharedBundle as (SvcBundle | undefined);
        const batchTs = Math.floor(Date.now() / 1000);
        const validRows = bulkRows.filter(r => r.phone && r.amount);
        const transactions: BulkTxItem[] = validRows.map((row, i) => {
          let prodCode = sharedBnd?.product;
          if (!prodCode) {
            const apiType2 = bulkType === 'data' ? 'Data' : 'Airtime';
            prodCode = findProduct(row.network, apiType2)?.prodCode ?? `${row.network.toUpperCase()}${apiType2.toUpperCase()}`;
          }
          return {
            phoneNumber: row.phone.startsWith('0') ? row.phone : `0${row.phone}`,
            amount: parseFloat(row.amount),
            product: prodCode,
            referenceId: genBtRef(batchTs, i + 1),
            bundleCode: sharedBnd?.bundleCode ?? '',
            bundleType: sharedBnd?.bundleType ?? '',
          };
        });
        const result = await apiBulkUpload(transactions);
        txRef = `${result.successCount}/${validRows.length} processed`;

      } else if (svcType === 'momo') {
        const isCashIn = form.momoType === 'cashin';
        const product: LoadWalletPayload['product'] = isCashIn ? 'MOMOCASHOUT' : 'MOMOCASHIN';
        const momoRef = genWalletRef();
        const phone = form.phone.replace(/\s/g, '');
        const acctFields = isAssistant && user?.accountId
          ? { reselleraccountId: user.accountId, resellerid: user.accountId, accountId: '' }
          : { accountId: user?.accountId ?? '' };
        const payload: LoadWalletPayload = {
          amount: parseFloat(form.amount),
          phoneNumber: phone,
          referenceId: momoRef,
          product,
          ...acctFields,
        };
        if (isCashIn) {
          await apiLoadWalletMoMo(payload);
        } else {
          await apiSendMoMo(payload);
        }
        await pollTransactionStatus(momoRef);
        txRef = momoRef;
      }

      setRef(txRef);
      setView('success');
      queryClient.invalidateQueries({ queryKey: QK.walletBalances });
      queryClient.invalidateQueries({ queryKey: QK.transactions });
      queryClient.invalidateQueries({ queryKey: QK.recentTransactions(5) });
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.show(e?.message ?? 'Transaction failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [svcType, form, pending, isAssistant, user, findProduct, toast]);

  function renderConfirm() {
    const grad = gradFor[svcType];
    const isBulk = svcType === 'bulk';
    const amount = isBulk
      ? `GHS ${((pending?.total as number) ?? 0).toFixed(2)}`
      : form.bundle
        ? `GHS ${(form.bundle.bundleType?.toUpperCase() === 'FLEXI' && form.amount ? parseFloat(form.amount) : form.bundle.price).toFixed(2)}`
        : `GHS ${parseFloat(form.amount || '0').toFixed(2)}`;
    const rows = isBulk
      ? [
        { label: 'Service', value: 'Bulk Top-Up' },
        { label: 'Transactions', value: `${(pending?.rows as unknown[])?.length ?? 0}` },
        { label: 'Type', value: String(pending?.bulkType ?? 'airtime') },
        ...(pending?.bulkType === 'data' && pending?.sharedBundle
          ? [{ label: 'Bundle', value: (pending.sharedBundle as SvcBundle).label }]
          : []),
      ]
      : [
        { label: 'Service', value: svcType },
        ...(svcType === 'fibre' ? [{ label: 'Provider', value: form.provider }] : []),
        { label: 'Network', value: form.network },
        { label: 'Phone', value: form.phone },
        ...(form.bundle ? [{ label: 'Bundle', value: form.bundle.label }] : []),
        ...(svcType === 'momo' ? [{ label: 'Type', value: form.momoType }] : []),
        { label: 'Reference', value: form.reference, mono: true },
      ];
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <GradHdr title="Confirm Transaction" onBack={() => setView(svcType)} gradient={G.wallet} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <ConfirmCard
            title="Review your transaction"
            rows={rows}
            amount={amount}
            gradient={grad}
            onCancel={() => setView(svcType)}
            onConfirm={handleConfirm}
            loading={submitting}
          />
        </ScrollView>
      </View>
    );
  }

  function renderSuccess() {
    const grad = gradFor[svcType];
    const isBulk = svcType === 'bulk';
    const amount = isBulk
      ? `GHS ${((pending?.total as number) ?? 0).toFixed(2)}`
      : form.bundle
        ? `GHS ${(form.bundle.bundleType?.toUpperCase() === 'FLEXI' && form.amount ? parseFloat(form.amount) : form.bundle.price).toFixed(2)}`
        : `GHS ${parseFloat(form.amount || '0').toFixed(2)}`;
    const accent =
      svcType === 'data' || svcType === 'momo' ? C.green :
        svcType === 'fibre' ? C.purple :
          svcType === 'bulk' ? C.orange : C.blue;
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <GradHdr title="Transaction Complete" gradient={G.wallet} />
        <SuccessCard amount={amount} reference={ref} accent={accent} onDone={goHome} />
      </View>
    );
  }

  const content =
    view === 'airtime' ? <AirtimeForm form={form} setForm={setForm} onNext={toConfirm} onBack={goHome} /> :
      view === 'data' ? <DataForm form={form} setForm={setForm} onNext={toConfirm} onBack={goHome} bundles={getDataBundles('mtn')} /> :
        view === 'fibre' ? <FibreForm form={form} setForm={setForm} onNext={toConfirm} onBack={goHome} bundles={getFibreBundles(form.provider)} providers={getFibreProviders()} /> :
          view === 'bulk' ? <BulkForm onNext={d => toConfirm(d as Record<string, unknown>)} onBack={goHome} products={products} /> :
            view === 'momo' ? <MomoSvcForm form={form} setForm={setForm} onNext={toConfirm} onBack={goHome} /> :
              view === 'confirm' ? renderConfirm() :
                view === 'success' ? renderSuccess() :
                  <ServicesHome onOpen={openSvc} />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {content}
      </KeyboardAvoidingView>
    </View>
  );
}
