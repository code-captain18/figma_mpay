import type { BulkTxItem, LoadWalletPayload } from '@/api';
import { apiBulkUpload, apiGetTransactions, apiPurchaseAirtime, apiPurchaseData, apiSendMoMo } from '@/api';
import { AirtimeForm } from '@/components/services/AirtimeForm';
import { BulkForm } from '@/components/services/BulkForm';
import { ConfirmCard } from '@/components/services/ConfirmCard';
import { DataForm } from '@/components/services/DataForm';
import { FibreForm } from '@/components/services/FibreForm';
import { GradHdr } from '@/components/services/GradHdr';
import { MomoSvcForm } from '@/components/services/MomoSvcForm';
import { bundleCategoryLabel, saneStr } from '@/components/services/ServiceFormPrimitives';
import { ServicesHome } from '@/components/services/ServicesHome';
import { SuccessCard } from '@/components/services/SuccessCard';
import { FIBRE_BUNDLES, FIBRE_PROVIDERS, GRADIENTS, SVC_DATA_BUNDLES } from '@/constants/services';
import { QK, useResellerProducts, useUserProducts } from '@/hooks/useAppQueries';
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
  reference: genMsRef(), momoType: 'cashin', provider: '', desc: '',
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

  // Momo tile/route is only available when the account holder has the product assigned
  const { data: userProducts } = useUserProducts();
  const hasCashInProduct = !userProducts || userProducts.some(p => p.prodCode === 'MOMOCASHIN');
  const canMomo = (user?.hasMoMo ?? true) && (user?.permissions?.['MoMo:send']?.view ?? true) && hasCashInProduct;

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
      const category = bundleCategoryLabel(b.BundleName, b.BundleCode);
      const label = isFlexi ? category : [category, saneStr(b.Validity)].filter(Boolean).join(' \u00b7 ');
      return {
        id: b.BundleCode,
        label,
        price,
        priceLabel,
        bundleCode: b.BundleCode,
        bundleType: b.BundleType,
        category,
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
      if (open !== 'momo' || canMomo) openSvc(open as SvcType);
      router.setParams({ open: '' });
    }
  }, [open, canMomo]);

  const goHome = () => { setView('home'); setForm({ ...mkInitSF(), reference: genMsRef() }); };
  const openSvc = (id: SvcType) => {
    if (id === 'momo' && !canMomo) return;
    setSvcType(id); setView(id);
  };
  const toConfirm = (extra?: Record<string, unknown>) => {
    // momo uses a wallet-style reference, generated fresh so it matches the one submitted/shown on success
    if (svcType === 'momo') setForm(p => ({ ...p, reference: genWalletRef() }));
    setPending(extra ?? null);
    setView('confirm');
  };

  const gradFor: Record<SvcType, typeof G.wallet> = {
    airtime: G.wallet, data: G.green, fibre: G.purple, bulk: G.orange, momo: G.momo,
  };

  // ServicesHome (recent activity list) is unmounted on the success screen, so a plain
  // invalidateQueries only marks the cache stale without fetching. Force a refetch now via
  // refetchType: 'all', then keep re-fetching the same recent-transactions cache key until
  // the just-submitted reference leaves 'pending' (or we give up), so a delayed backend
  // resolution still reaches the UI without needing another transaction to reveal it.
  const pollTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { pollTimersRef.current.forEach(clearTimeout); }, []);

  const refreshTxData = useCallback((txRef?: string) => {
    queryClient.invalidateQueries({ queryKey: QK.walletBalances });
    queryClient.invalidateQueries({ queryKey: QK.transactions, refetchType: 'all' });

    const t0 = Date.now();
    const poll = async () => {
      let page: Awaited<ReturnType<typeof apiGetTransactions>> | undefined;
      try {
        page = await queryClient.fetchQuery({
          queryKey: QK.recentTransactions(5),
          queryFn: () => apiGetTransactions({ source: 'recent', page: 1, pageSize: 5 }, isAssistant),
          staleTime: 0, // force an actual network hit — the cached entry is rarely stale enough on its own
        });
      } catch {
        // network hiccup — keep retrying within the timeout window
      }
      const entry = txRef ? page?.data.find(t => t.id === txRef || t.ref === txRef) : undefined;
      const unresolved = !!txRef && (!entry || entry.status === 'pending');
      const elapsed = Date.now() - t0;
      if (unresolved && elapsed < 60_000) {
        pollTimersRef.current.push(setTimeout(poll, elapsed < 20_000 ? 3_000 : 5_000));
      }
    };
    poll();
  }, [queryClient, isAssistant]);

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
        if (result.referenceId) txRef = result.referenceId;

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
        const validRows = bulkRows.filter(r => r.phone && r.amount && Number.isFinite(parseFloat(r.amount)) && parseFloat(r.amount) > 0);
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
        const momoRef = form.reference;
        const phone = form.phone.replace(/\s/g, '');
        const acctFields = isAssistant && user?.accountId
          ? { reselleraccountId: user.accountId, resellerid: user.accountId, accountId: '' }
          : { accountId: user?.accountId ?? '' };
        const payload: LoadWalletPayload = {
          amount: parseFloat(form.amount),
          phoneNumber: phone,
          referenceId: momoRef,
          product: 'MOMOCASHIN',
          ...acctFields,
        };
        await apiSendMoMo(payload);
        await pollTransactionStatus(momoRef);
        txRef = momoRef;
      }

      setRef(txRef);
      setView('success');
      // bulk's txRef is a "x/y processed" summary, not a single reference — nothing to poll for
      refreshTxData(svcType === 'bulk' ? undefined : txRef);
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.show(e?.message ?? 'Transaction failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [svcType, form, pending, isAssistant, user, findProduct, toast, refreshTxData]);

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
                  <ServicesHome onOpen={openSvc} momoEnabled={canMomo} />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {content}
      </KeyboardAvoidingView>
    </View>
  );
}
