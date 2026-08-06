import { useAuth } from '@/store/auth.store';
import { useToast } from '@/store/toast.store';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Check,
  ChevronRight,
  CreditCard,
  Globe, Layers,
  Plus,
  Smartphone,
  Trash2, Upload,
  Wifi,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { ApiProduct, BulkTxItem } from '@/api';
import { apiBulkUpload, apiPurchaseAirtime, apiPurchaseData } from '@/api';
import { BundleGrid } from '@/components/services/BundleGrid';
import { ConfirmCard } from '@/components/services/ConfirmCard';
import { GradHdr } from '@/components/services/GradHdr';
import { NetSelector } from '@/components/services/NetSelector';
import { SuccessCard } from '@/components/services/SuccessCard';
import {
  FIBRE_BUNDLES,
  FIBRE_PROVIDERS,
  GRADIENTS,
  SVC_DATA_BUNDLES,
} from '@/constants/services';
import { NETWORKS, fmtAgo } from '@/data';
import { QK, useRecentTransactions, useResellerProducts } from '@/hooks/useAppQueries';
import { Colors } from '@/theme';
import type { BulkItem, MomoType, SFState, SvcBundle, SvcType, SvcView, TxRecord } from '@/types';
import { formatGHS } from '@/utils/format';
import { genBtRef, genMsRef } from '@/utils/ref';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';

// ─── Theme shortcuts ──────────────────────────────────────────────────────────
const C = Colors;
const G = GRADIENTS;

const F = {
  medium: 'Urbanist_500Medium',
  semibold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
  extrabold: 'Urbanist_800ExtraBold',
} as const;

const BTN_R = 14;
const BTN_H = 52;
const BTN_FS = 14;

// ─── Initial form state ───────────────────────────────────────────────────────
const mkInitSF = (): SFState => ({
  network: 'mtn',
  phone: '',
  amount: '',
  bundle: null,
  reference: genMsRef(),
  momoType: 'send',
  provider: '',
  desc: '',
});

// ─── Shared primitives ────────────────────────────────────────────────────────
function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={shr.label}>{label}</Text>
      {children}
    </View>
  );
}

function SubmitBtn({
  label,
  gradient,
  onPress,
  disabled,
}: {
  label: string;
  gradient: typeof G.wallet;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={[shr.submitBtn, disabled && { opacity: 0.45 }]}
    >
      <LinearGradient
        colors={gradient.colors}
        start={gradient.start}
        end={gradient.end}
        style={shr.submitGrad}
      >
        <Text style={shr.submitText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const shr = StyleSheet.create({
  label: {
    fontSize: 11,
    fontFamily: F.semibold,
    color: C.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: F.medium,
    color: C.navy,
    backgroundColor: C.bg,
  },
  submitBtn: { borderRadius: BTN_R, overflow: 'hidden', marginTop: 6 },
  submitGrad: { paddingVertical: BTN_H / 2 - 1, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontSize: 15, fontFamily: F.extrabold, color: '#fff' },
});

// ─── Airtime Top-Up Form ──────────────────────────────────────────────────────
function AirtimeForm({
  form, setForm, onNext, onBack,
}: {
  form: SFState;
  setForm: React.Dispatch<React.SetStateAction<SFState>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const set = (k: keyof SFState, v: SFState[keyof SFState]) =>
    setForm(p => ({ ...p, [k]: v }));
  const ok = !!form.phone && !!form.amount;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Airtime Top-Up" onBack={onBack} gradient={G.wallet} />
      <ScrollView contentContainerStyle={frm.content} showsVerticalScrollIndicator={false}>
        <View style={frm.banner}>
          <Text style={frm.bannerText}>
            Purchase airtime for any network instantly. Funds are deducted from your wallet.
          </Text>
        </View>
        <FL label="SELECT NETWORK">
          <NetSelector selected={form.network} onSelect={v => set('network', v)} />
        </FL>
        <FL label="RECIPIENT PHONE NUMBER *">
          <TextInput
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={v => set('phone', v)}
            placeholder="024XXXXXXX"
            placeholderTextColor={C.pale}
            style={shr.input}
          />
        </FL>
        <FL label="AMOUNT (GHS) *">
          <View style={{ position: 'relative' }}>
            <Text style={frm.prefix}>GHS</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={form.amount}
              onChangeText={v => set('amount', v)}
              placeholder="0.00"
              placeholderTextColor={C.pale}
              style={[shr.input, { paddingLeft: 46 }]}
            />
          </View>
        </FL>
        <View style={{ marginBottom: 18 }}>
          <Text style={[shr.label, { marginBottom: 8 }]}>QUICK AMOUNTS</Text>
          <View style={frm.quickAmts}>
            {['1', '2', '5', '10', '20', '50'].map(amt => (
              <TouchableOpacity
                key={amt}
                onPress={() => set('amount', amt)}
                activeOpacity={0.8}
                style={[frm.qAmtBtn, form.amount === amt && frm.qAmtBtnActive]}
              >
                <Text style={[frm.qAmtText, form.amount === amt && frm.qAmtTextActive]}>
                  GHS {amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <SubmitBtn label="Review & Confirm" gradient={G.wallet} disabled={!ok} onPress={onNext} />
      </ScrollView>
    </View>
  );
}

// ─── Data Bundle Form ─────────────────────────────────────────────────────────
function DataForm({
  form, setForm, onNext, onBack, bundles,
}: {
  form: SFState;
  setForm: React.Dispatch<React.SetStateAction<SFState>>;
  onNext: () => void;
  onBack: () => void;
  bundles: SvcBundle[];
}) {
  const set = (k: keyof SFState, v: SFState[keyof SFState]) =>
    setForm(p => ({ ...p, [k]: v }));
  const handleNetworkChange = (v: string) =>
    setForm(p => ({ ...p, network: v, bundle: null }));
  const ok = !!form.phone && !!form.bundle;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Data Bundle" onBack={onBack} gradient={G.wallet} />
      <ScrollView contentContainerStyle={frm.content} showsVerticalScrollIndicator={false}>
        <View style={frm.banner}>
          <Text style={frm.bannerText}>Buy data bundles for any network. Choose a plan below.</Text>
        </View>
        <FL label="SELECT NETWORK">
          <NetSelector
            selected={form.network}
            onSelect={handleNetworkChange}
            accent={C.green}
          />
        </FL>
        <FL label="RECIPIENT PHONE NUMBER *">
          <TextInput
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={v => set('phone', v)}
            placeholder="024XXXXXXX"
            placeholderTextColor={C.pale}
            style={shr.input}
          />
        </FL>
        <FL label="SELECT BUNDLE *">
          <BundleGrid
            bundles={bundles}
            selected={form.bundle?.id ?? null}
            accent={C.green}
            onSelect={b => set('bundle', b)}
          />
        </FL>
        <SubmitBtn label="Review & Confirm" gradient={G.wallet} disabled={!ok} onPress={onNext} />
      </ScrollView>
    </View>
  );
}

// ─── Fibre Bundle Form ────────────────────────────────────────────────────────
function FibreForm({
  form, setForm, onNext, onBack, bundles, providers,
}: {
  form: SFState;
  setForm: React.Dispatch<React.SetStateAction<SFState>>;
  onNext: () => void;
  onBack: () => void;
  bundles: SvcBundle[];
  providers: string[];
}) {
  const set = (k: keyof SFState, v: SFState[keyof SFState]) =>
    setForm(p => ({ ...p, [k]: v }));
  const handleProviderChange = (p: string) =>
    setForm(prev => ({ ...prev, provider: p, bundle: null }));
  const ok = !!form.provider && !!form.phone && !!form.bundle;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Fibre Bundle" onBack={onBack} gradient={G.wallet} />
      <ScrollView contentContainerStyle={frm.content} showsVerticalScrollIndicator={false}>
        <View style={frm.banner}>
          <Text style={frm.bannerText}>Pay for fibre broadband plans across 4 major providers.</Text>
        </View>
        <FL label="SELECT PROVIDER *">
          <View style={fib.provRow}>
            {providers.map(p => {
              const active = form.provider === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => handleProviderChange(p)}
                  activeOpacity={0.8}
                  style={[fib.provBtn, active && fib.provBtnActive]}
                >
                  <Text style={[fib.provText, active && fib.provTextActive]}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </FL>
        <FL label="ACCOUNT / CUSTOMER NUMBER *">
          <TextInput
            value={form.phone}
            onChangeText={v => set('phone', v)}
            placeholder="Enter account number"
            placeholderTextColor={C.pale}
            style={shr.input}
          />
        </FL>
        <FL label="SELECT PLAN *">
          <BundleGrid
            bundles={bundles}
            selected={form.bundle?.id ?? null}
            accent={C.purple}
            onSelect={b => set('bundle', b)}
          />
        </FL>
        <SubmitBtn label="Review & Confirm" gradient={G.wallet} disabled={!ok} onPress={onNext} />
      </ScrollView>
    </View>
  );
}

const fib = StyleSheet.create({
  provRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  provBtn: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  provBtnActive: { borderColor: C.purple, backgroundColor: 'rgba(124,92,252,0.08)' },
  provText: { fontSize: 12, fontFamily: F.medium, color: C.muted },
  provTextActive: { fontFamily: F.bold, color: C.purple },
});

// ─── Bulk Top-Up Form ─────────────────────────────────────────────────────────
function BulkForm({
  onNext, onBack, products,
}: {
  onNext: (data: { rows: BulkItem[]; bulkType: 'airtime' | 'data'; total: number; sharedBundle?: SvcBundle }) => void;
  onBack: () => void;
  products: ApiProduct[];
}) {
  const toast = useToast();
  const [bulkType, setBulkType] = useState<'airtime' | 'data'>('airtime');
  const [rows, setRows] = useState<BulkItem[]>([
    { id: '1', phone: '', network: 'mtn', amount: '' },
  ]);
  const [sharedBundle, setSharedBundle] = useState<SvcBundle | null>(null);
  const [sharedBundleNetwork, setSharedBundleNetwork] = useState('mtn');

  // Reset shared bundle when switching service type
  useEffect(() => { setSharedBundle(null); }, [bulkType]);

  const dataBundles = useMemo((): SvcBundle[] => {
    const apiNet = sharedBundleNetwork.toUpperCase();
    const prod = products.find(p => p.network.toUpperCase() === apiNet && p.Type === 'Data');
    if (!prod?.bundles?.length) return SVC_DATA_BUNDLES;
    return prod.bundles.map(b => ({
      id: b.BundleCode,
      label: `${b.BundleName}${b.Validity ? ` \u00b7 ${b.Validity}` : ''}`,
      price: b.Amount ?? 0,
      bundleCode: b.BundleCode,
      bundleType: b.BundleType,
      product: prod.prodCode,
    }));
  }, [products, sharedBundleNetwork]);

  const addRow = () =>
    setRows(p => [...p, { id: Date.now().toString(), phone: '', network: 'mtn', amount: '' }]);
  const delRow = (id: string) => setRows(p => p.filter(r => r.id !== id));
  const setRow = (id: string, k: keyof BulkItem, v: string) =>
    setRows(p => p.map(r => r.id === id ? { ...r, [k]: v } : r));

  const importCsv = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'application/vnd.ms-excel'],
      });
      if (res.canceled) return;
      const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
      const lines = text.trim().split('\n').slice(1);
      const parsed: BulkItem[] = lines.map((line, i) => {
        const [phone = '', network = 'mtn', amount = ''] = line.split(',');
        return { id: String(i + 1), phone: phone.trim(), network: network.trim().toLowerCase(), amount: amount.trim() };
      });
      setRows(parsed);
    } catch {
      toast.show('Could not read CSV. Expected columns: phone, network, amount', 'error');
    }
  };

  const total = rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const filled = rows.filter(r => r.phone && r.amount).length;
  const canSubmit = filled > 0 && (bulkType === 'airtime' || sharedBundle !== null);

  const NETS = [
    { id: 'mtn', short: 'MTN', color: '#FFC107' },
    { id: 'telecel', short: 'TEL', color: '#E8334A' },
    { id: 'airteltigo', short: 'AT', color: '#E91E63' },
    { id: 'glo', short: 'GLO', color: '#22C55E' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Bulk Top-Up" onBack={onBack} gradient={G.wallet} />
      <ScrollView contentContainerStyle={frm.content} showsVerticalScrollIndicator={false}>
        <View style={blk.toggle}>
          {(['airtime', 'data'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setBulkType(t)}
              activeOpacity={0.8}
              style={[blk.toggleBtn, bulkType === t && blk.toggleBtnActive]}
            >
              <Text style={[blk.toggleText, bulkType === t && blk.toggleTextActive]}>
                {t === 'airtime' ? 'Airtime' : 'Data Bundle'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bundle picker — data bulk only */}
        {bulkType === 'data' && (
          <View style={{ marginBottom: 6 }}>
            <FL label="SELECT NETWORK FOR BUNDLE">
              <NetSelector
                selected={sharedBundleNetwork}
                onSelect={v => { setSharedBundleNetwork(v); setSharedBundle(null); }}
                accent={C.green}
              />
            </FL>
            <FL label="SELECT BUNDLE FOR ALL ROWS *">
              <BundleGrid
                bundles={dataBundles}
                selected={sharedBundle?.id ?? null}
                accent={C.green}
                onSelect={setSharedBundle}
              />
            </FL>
          </View>
        )}
        <View style={blk.summaryBar}>
          <View>
            <Text style={blk.summaryCount}>{filled} of {rows.length} filled</Text>
            <Text style={blk.summaryTotal}>
              Total: <Text style={{ fontFamily: F.bold, color: C.orange }}>GHS {total.toFixed(2)}</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={importCsv} style={blk.importBtn} activeOpacity={0.85}>
            <Upload size={12} color={C.orange} />
            <Text style={blk.importBtnText}>Import CSV</Text>
          </TouchableOpacity>
        </View>
        <View style={blk.hintBox}>
          <Text style={blk.hintText}>
            CSV format: <Text style={{ fontFamily: F.bold }}>phone, network, amount</Text>
            {'\n'}e.g. 0244123456, mtn, 5
          </Text>
        </View>
        {rows.map((row, i) => (
          <View key={row.id} style={blk.row}>
            <Text style={blk.rowNum}>#{i + 1}</Text>
            <View style={{ flex: 1, gap: 7 }}>
              <View style={{ flexDirection: 'row', gap: 7 }}>
                <TextInput
                  keyboardType="phone-pad"
                  value={row.phone}
                  onChangeText={v => setRow(row.id, 'phone', v)}
                  placeholder="Phone number"
                  placeholderTextColor={C.pale}
                  style={[shr.input, { flex: 2, paddingVertical: 9, fontSize: 12 }]}
                />
                <TextInput
                  keyboardType="decimal-pad"
                  value={row.amount}
                  onChangeText={v => setRow(row.id, 'amount', v)}
                  placeholder="Amt"
                  placeholderTextColor={C.pale}
                  style={[shr.input, { flex: 1, paddingVertical: 9, fontSize: 12 }]}
                />
              </View>
              {/* Network chips — airtime only; data product is determined by the shared bundle */}
              {bulkType === 'airtime' && (
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {NETS.map(n => (
                    <TouchableOpacity
                      key={n.id}
                      onPress={() => setRow(row.id, 'network', n.id)}
                      activeOpacity={0.8}
                      style={[
                        blk.netChip,
                        row.network === n.id && { backgroundColor: n.color + '22', borderColor: n.color + '88' },
                      ]}
                    >
                      <Text style={[blk.netChipText, row.network === n.id && { color: n.color }]}>
                        {n.short}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => rows.length > 1 ? delRow(row.id) : undefined}
              style={blk.delBtn}
              activeOpacity={0.8}
            >
              <Trash2 size={13} color={rows.length > 1 ? C.red : C.pale} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addRow} style={blk.addRowBtn} activeOpacity={0.8}>
          <Plus size={13} color={C.orange} />
          <Text style={blk.addRowText}>Add Row</Text>
        </TouchableOpacity>
        <SubmitBtn
          label={`Process ${filled} Transaction${filled !== 1 ? 's' : ''}`}
          gradient={G.wallet}
          disabled={!canSubmit}
          onPress={() => onNext({ rows, bulkType, total, sharedBundle: sharedBundle ?? undefined })}
        />
      </ScrollView>
    </View>
  );
}

const blk = StyleSheet.create({
  toggle: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, padding: 3, marginBottom: 14 },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: C.white, shadowColor: '#071830', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 12, fontFamily: F.medium, color: C.muted },
  toggleTextActive: { fontFamily: F.bold, color: C.navy },
  summaryBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(233,145,10,0.07)', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1.5, borderColor: 'rgba(233,145,10,0.2)' },
  summaryCount: { fontSize: 12, fontFamily: F.semibold, color: C.navy },
  summaryTotal: { fontSize: 11, color: C.muted },
  importBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(233,145,10,0.12)', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1.5, borderColor: 'rgba(233,145,10,0.3)' },
  importBtnText: { fontSize: 11, fontFamily: F.bold, color: C.orange },
  hintBox: { backgroundColor: 'rgba(7,24,48,0.03)', borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: C.divider },
  hintText: { fontSize: 10, color: C.muted, lineHeight: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10, backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12 },
  rowNum: { fontSize: 10, fontFamily: F.bold, color: C.pale, paddingTop: 11, width: 22, textAlign: 'right' },
  netChip: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 7, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  netChipText: { fontSize: 8, fontFamily: F.extrabold, color: C.mid },
  delBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(232,51,74,0.07)', alignItems: 'center', justifyContent: 'center', marginTop: 7 },
  addRowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(233,145,10,0.4)', borderStyle: 'dashed', marginBottom: 16 },
  addRowText: { fontSize: 12, fontFamily: F.semibold, color: C.orange },
});

// ─── Mobile Money Services Form ───────────────────────────────────────────────
function MomoSvcForm({
  form, setForm, onNext, onBack,
}: {
  form: SFState;
  setForm: React.Dispatch<React.SetStateAction<SFState>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const set = (k: keyof SFState, v: SFState[keyof SFState]) =>
    setForm(p => ({ ...p, [k]: v }));
  const ok = !!form.phone && !!form.amount;

  const MOMO_TYPES: { id: MomoType; label: string; sub: string }[] = [
    { id: 'send', label: 'Send Money', sub: 'Transfer to any MoMo wallet' },
    { id: 'withdraw', label: 'Withdraw', sub: 'Cash out from MoMo wallet' },
    { id: 'cashin', label: 'Cash In', sub: 'Deposit to MoMo wallet' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Mobile Money Services" onBack={onBack} gradient={G.wallet} />
      <ScrollView contentContainerStyle={frm.content} showsVerticalScrollIndicator={false}>
        <View style={frm.banner}>
          <Text style={frm.bannerText}>
            Send, withdraw, or deposit to any mobile money wallet across all networks.
          </Text>
        </View>
        <View style={{ marginBottom: 14 }}>
          <Text style={[shr.label, { marginBottom: 8 }]}>TRANSACTION TYPE</Text>
          <View style={{ gap: 8 }}>
            {MOMO_TYPES.map(t => {
              const active = form.momoType === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => set('momoType', t.id)}
                  activeOpacity={0.8}
                  style={[mmo.typeBtn, active && mmo.typeBtnActive]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[mmo.typeLabel, active && mmo.typeLabelActive]}>{t.label}</Text>
                    <Text style={mmo.typeSub}>{t.sub}</Text>
                  </View>
                  <View style={[mmo.typeRadio, active && mmo.typeRadioActive]}>
                    {active && <View style={mmo.typeRadioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <FL label="SELECT NETWORK">
          <NetSelector selected={form.network} onSelect={v => set('network', v)} accent={C.green} />
        </FL>
        <FL label="PHONE NUMBER *">
          <TextInput
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={v => set('phone', v)}
            placeholder="024XXXXXXX"
            placeholderTextColor={C.pale}
            style={shr.input}
          />
        </FL>
        <FL label="AMOUNT (GHS) *">
          <View style={{ position: 'relative' }}>
            <Text style={frm.prefix}>GHS</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={form.amount}
              onChangeText={v => set('amount', v)}
              placeholder="0.00"
              placeholderTextColor={C.pale}
              style={[shr.input, { paddingLeft: 46 }]}
            />
          </View>
        </FL>
        <FL label="DESCRIPTION (OPTIONAL)">
          <TextInput
            value={form.desc}
            onChangeText={v => set('desc', v)}
            placeholder="e.g. Payment for goods"
            placeholderTextColor={C.pale}
            style={[shr.input, { height: 72, textAlignVertical: 'top', paddingTop: 11 }]}
            multiline
            numberOfLines={3}
          />
        </FL>
        <SubmitBtn label="Review & Confirm" gradient={G.wallet} disabled={!ok} onPress={onNext} />
      </ScrollView>
    </View>
  );
}

const mmo = StyleSheet.create({
  typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  typeBtnActive: { borderColor: C.green, backgroundColor: 'rgba(13,168,112,0.06)' },
  typeLabel: { fontSize: 13, fontFamily: F.semibold, color: C.navy, marginBottom: 1 },
  typeLabelActive: { fontFamily: F.bold, color: '#0A7A50' },
  typeSub: { fontSize: 10, color: C.muted },
  typeRadio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.pale, alignItems: 'center', justifyContent: 'center' },
  typeRadioActive: { borderColor: C.green },
  typeRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
});

// ─── Shared form layout styles ────────────────────────────────────────────────
const frm = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  banner: { padding: 12, borderRadius: 13, marginBottom: 18, backgroundColor: 'rgba(24,120,206,0.06)', borderWidth: 1.5, borderColor: 'rgba(24,120,206,0.15)' },
  bannerText: { fontSize: 11, color: C.mid, fontFamily: F.medium, lineHeight: 17 },
  prefix: { position: 'absolute', left: 12, top: 12, fontSize: 13, fontFamily: F.semibold, color: C.mid, zIndex: 1 },
  quickAmts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qAmtBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  qAmtBtnActive: { borderColor: C.blue, backgroundColor: 'rgba(24,120,206,0.08)' },
  qAmtText: { fontSize: 12, fontFamily: F.medium, color: C.muted },
  qAmtTextActive: { fontFamily: F.bold, color: C.blue },
});

// ─── Services Home Grid ───────────────────────────────────────────────────────
const SVC_TILES: {
  id: SvcType;
  label: string;
  sub: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconColor: string;
  iconBg: string;
  grad: typeof G.wallet;
  full: boolean;
}[] = [
    { id: 'airtime', label: 'Airtime Top-Up', sub: 'All networks', Icon: Smartphone, iconColor: C.blue, iconBg: 'rgba(24,120,206,0.1)', grad: G.wallet, full: false },
    { id: 'data', label: 'Data Bundle', sub: 'All networks', Icon: Wifi, iconColor: C.green, iconBg: 'rgba(13,168,112,0.1)', grad: G.green, full: false },
    { id: 'fibre', label: 'Fibre Bundle', sub: 'Home & office', Icon: Globe, iconColor: C.purple, iconBg: 'rgba(124,92,252,0.1)', grad: G.purple, full: false },
    { id: 'bulk', label: 'Bulk Top-Up', sub: 'Multiple numbers', Icon: Layers, iconColor: C.orange, iconBg: 'rgba(233,145,10,0.1)', grad: G.orange, full: false },
    { id: 'momo', label: 'Mobile Money Services', sub: 'Send · Withdraw', Icon: CreditCard, iconColor: C.green, iconBg: 'rgba(13,168,112,0.12)', grad: G.momo, full: true },
  ];

type RecentDisplayItem = {
  label: string; acct: string; time: string; value: string; status: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconBg: string; iconColor: string;
};

const TX_ICON_MAP: Record<string, { Icon: RecentDisplayItem['Icon']; iconBg: string; iconColor: string }> = {
  airtime: { Icon: Smartphone, iconBg: 'rgba(24,120,206,0.1)', iconColor: C.blue },
  data: { Icon: Wifi, iconBg: 'rgba(13,168,112,0.1)', iconColor: C.green },
  fibre: { Icon: Globe, iconBg: 'rgba(124,92,252,0.1)', iconColor: C.purple },
  bulk: { Icon: Layers, iconBg: 'rgba(233,145,10,0.1)', iconColor: C.orange },
  momo: { Icon: CreditCard, iconBg: 'rgba(13,168,112,0.12)', iconColor: C.green },
};

const SVC_LABELS: Record<string, string> = {
  airtime: 'Airtime', data: 'Data Bundle', fibre: 'Fibre', bulk: 'Bulk', momo: 'MoMo',
};

function toRecentItem(tx: TxRecord): RecentDisplayItem {
  const net = NETWORKS.find(n => n.id === tx.network)?.name ?? tx.network;
  const tile = TX_ICON_MAP[tx.type] ?? TX_ICON_MAP.airtime;
  return {
    label: tx.bundle ? `${net} ${tx.bundle}` : `${net} ${SVC_LABELS[tx.type] ?? tx.type}`,
    acct: tx.phone,
    time: fmtAgo(tx.createdAt),
    value: formatGHS(tx.amount),
    status: tx.status,
    Icon: tile.Icon,
    iconBg: tile.iconBg,
    iconColor: tile.iconColor,
  };
}

function ServicesHome({ onOpen }: { onOpen: (id: SvcType) => void }) {
  const gridTiles = SVC_TILES.filter(t => !t.full);
  const momoTile = SVC_TILES.find(t => t.full)!;
  const [selectedRecent, setSelectedRecent] = useState<RecentDisplayItem | null>(null);
  const { data: recentPage, isFetching: recentLoading } = useRecentTransactions(5);
  const recentItems = useMemo(() => (recentPage?.data ?? []).map(toRecentItem), [recentPage]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <GradHdr title="Services" />
      <ScrollView contentContainerStyle={grd.content} showsVerticalScrollIndicator={false}>

        {/* Quick Actions */}
        <Text style={grd.sectionTitle}>Quick Actions</Text>

        {/* 2×2 card grid */}
        <View style={grd.grid}>
          {gridTiles.map(tile => (
            <TouchableOpacity
              key={tile.id}
              onPress={() => onOpen(tile.id)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
              style={grd.halfCard}
            >
              <View style={[grd.iconBg, { backgroundColor: tile.iconBg }]}>
                <tile.Icon size={24} color={tile.iconColor} strokeWidth={1.8} />
              </View>
              <Text style={grd.cardLabel}>{tile.label}</Text>
              <Text style={grd.cardSub}>{tile.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mobile Money — full-width horizontal row */}
        <TouchableOpacity
          onPress={() => onOpen(momoTile.id)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={momoTile.label}
          style={grd.momoCard}
        >
          <View style={[grd.iconBg, { backgroundColor: momoTile.iconBg }]}>
            <momoTile.Icon size={24} color={momoTile.iconColor} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={grd.cardLabel}>{momoTile.label}</Text>
            <Text style={grd.cardSub}>{momoTile.sub}</Text>
          </View>
          <ChevronRight size={16} color={C.pale} />
        </TouchableOpacity>

        {/* Recent Activity */}
        <Text style={[grd.sectionTitle, { marginTop: 24 }]}>Recent Activity</Text>
        {recentLoading && !recentItems.length ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={C.blue} />
          </View>
        ) : recentItems.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: C.muted, fontFamily: F.medium }}>No recent transactions</Text>
          </View>
        ) : (
          <View style={grd.recentCard}>
            {recentItems.map((item, i) => {
              const ok = item.status === 'success';
              return (
                <View key={i}>
                  <TouchableOpacity
                    onPress={() => setSelectedRecent(item)}
                    activeOpacity={0.75}
                    style={grd.recentRow}
                  >
                    <View style={[grd.recentIcon, { backgroundColor: item.iconBg }]}>
                      <item.Icon size={16} color={item.iconColor} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={grd.recentLabel}>{item.label}</Text>
                      <Text style={grd.recentSub}>{item.acct} · {item.time}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={grd.recentAmount}>{item.value}</Text>
                      <View style={grd.statusBadge}>
                        {ok
                          ? <Check size={9} color={C.green} strokeWidth={3} />
                          : <X size={9} color={C.red} strokeWidth={3} />
                        }
                        <Text style={[grd.statusText, { color: ok ? C.green : C.red }]}>
                          {ok ? 'Success' : 'Failed'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  {i < recentItems.length - 1 && <View style={grd.recentDivider} />}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {selectedRecent && (
        <Modal
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedRecent(null)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(7,24,48,0.5)', justifyContent: 'flex-end' }}
            onPress={() => setSelectedRecent(null)}
          >
            <Pressable onPress={e => e.stopPropagation()}>
              <View style={grd.dtSheet}>
                <View style={grd.dtHandle} />
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={[grd.dtIconWrap, { backgroundColor: selectedRecent.iconBg }]}>
                    <selectedRecent.Icon size={26} color={selectedRecent.iconColor} strokeWidth={1.8} />
                  </View>
                  <Text style={grd.dtAmt}>{selectedRecent.value}</Text>
                  <Text style={grd.dtName}>{selectedRecent.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                  <View style={[grd.dtBadge, {
                    backgroundColor: selectedRecent.status === 'success'
                      ? 'rgba(13,168,112,0.12)' : 'rgba(232,51,74,0.12)',
                  }]}>
                    {selectedRecent.status === 'success'
                      ? <Check size={11} color={C.green} strokeWidth={3} />
                      : <X size={11} color={C.red} strokeWidth={3} />
                    }
                    <Text style={[grd.dtBadgeText, {
                      color: selectedRecent.status === 'success' ? C.green : C.red,
                    }]}>
                      {selectedRecent.status === 'success' ? 'Success' : 'Failed'}
                    </Text>
                  </View>
                </View>
                <View style={grd.dtRows}>
                  <View style={grd.dtRow}>
                    <Text style={grd.dtRowLbl}>Account</Text>
                    <Text style={grd.dtRowVal}>{selectedRecent.acct}</Text>
                  </View>
                  <View style={[grd.dtRow, { borderBottomWidth: 0 }]}>
                    <Text style={grd.dtRowLbl}>Time</Text>
                    <Text style={grd.dtRowVal}>{selectedRecent.time}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedRecent(null)}
                  style={grd.dtCloseBtn}
                  activeOpacity={0.85}
                >
                  <Text style={grd.dtCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const grd = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  sectionTitle: { fontSize: 13, fontFamily: F.extrabold, color: C.navy, marginBottom: 12 },

  // 2×2 grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  halfCard: {
    width: '47.4%',
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#071830',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconBg: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardLabel: { fontSize: 13, fontFamily: F.bold, color: C.navy, marginBottom: 3, textAlign: 'center' },
  cardSub: { fontSize: 11, fontFamily: F.medium, color: C.muted, textAlign: 'center' },

  // MoMo row card
  momoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#071830',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  // Recent Activity
  recentCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    shadowColor: '#071830',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
  },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  recentDivider: { height: 1, backgroundColor: C.divider, marginHorizontal: 14 },
  recentIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  recentLabel: { fontSize: 13, fontFamily: F.bold, color: C.navy, marginBottom: 2 },
  recentSub: { fontSize: 11, fontFamily: F.medium, color: C.muted },
  recentAmount: { fontSize: 13, fontFamily: F.extrabold, color: C.navy, marginBottom: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statusText: { fontSize: 11, fontFamily: F.semibold },

  dtSheet: { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44 },
  dtHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.pale, alignSelf: 'center', marginBottom: 20 },
  dtIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  dtAmt: { fontSize: 26, fontFamily: F.extrabold, color: C.navy, letterSpacing: -0.5 },
  dtName: { fontSize: 13, fontFamily: F.semibold, color: C.mid, marginTop: 4 },
  dtBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 16, borderRadius: 99 },
  dtBadgeText: { fontSize: 12, fontFamily: F.semibold },
  dtRows: { backgroundColor: C.bg, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  dtRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.divider },
  dtRowLbl: { fontSize: 12, fontFamily: F.medium, color: C.muted },
  dtRowVal: { fontSize: 12, fontFamily: F.semibold, color: C.navy },
  dtCloseBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  dtCloseText: { fontSize: 14, fontFamily: F.bold, color: C.navy },
});

// ─── Main ServicesScreen — state machine ──────────────────────────────────────
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

  // ─ Product helpers ──────────────────────────────────────────────────────────
  const findProduct = useCallback((network: string, type: string) =>
    products.find(p =>
      p.network.toUpperCase() === network.toUpperCase() &&
      p.Type.toLowerCase() === type.toLowerCase(),
    ), [products]);

  const getDataBundles = useCallback((networkId: string): SvcBundle[] => {
    const prod = findProduct(networkId, 'Data');
    if (!prod?.bundles?.length) return SVC_DATA_BUNDLES;
    return prod.bundles.map(b => ({
      id: b.BundleCode,
      label: `${b.BundleName}${b.Validity ? ` \u00b7 ${b.Validity}` : ''}`,
      price: b.Amount ?? 0,
      bundleCode: b.BundleCode,
      bundleType: b.BundleType,
      product: prod.prodCode,
    }));
  }, [findProduct]);

  const getFibreBundles = useCallback((provider: string): SvcBundle[] => {
    const prod = findProduct(provider, 'Fibre');
    if (!prod?.bundles?.length) return FIBRE_BUNDLES;
    return prod.bundles.map(b => ({
      id: b.BundleCode,
      label: `${b.BundleName}${b.Validity ? ` \u00b7 ${b.Validity}` : ''}`,
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

  // ─ Deep-link open from home screen ──────────────────────────────────────────
  useEffect(() => {
    const VALID: SvcType[] = ['airtime', 'data', 'fibre', 'bulk', 'momo'];
    if (open && open !== handledOpen.current && VALID.includes(open as SvcType)) {
      handledOpen.current = open;
      openSvc(open as SvcType);
      router.setParams({ open: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ─ Navigation ───────────────────────────────────────────────────────────────
  const goHome = () => {
    setView('home');
    setForm({ ...mkInitSF(), reference: genMsRef() });
  };

  const openSvc = (id: SvcType) => { setSvcType(id); setView(id); };

  const toConfirm = (extra?: Record<string, unknown>) => {
    setPending(extra ?? null);
    setView('confirm');
  };

  const gradFor: Record<SvcType, typeof G.wallet> = {
    airtime: G.wallet,
    data: G.green,
    fibre: G.purple,
    bulk: G.orange,
    momo: G.momo,
  };

  // ─ Confirm handler ───────────────────────────────────────────────────────────
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
          amount: form.bundle!.price,
          phoneNumber: form.phone,
          product: form.bundle!.product ?? prod?.prodCode ?? form.bundle!.bundleCode ?? form.bundle!.id,
          bundleType: form.bundle!.bundleType ?? 'FIXED',
          bundleCode: form.bundle!.bundleCode ?? form.bundle!.id,
          referenceId: form.reference,
          transactionDescription: `${apiType} bundle for ${netKey.toUpperCase()}`,
          ...assistantFields,
        });
        txRef = result.referenceId;

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
            prodCode = findProduct(row.network, apiType2)?.prodCode
              ?? `${row.network.toUpperCase()}${apiType2.toUpperCase()}`;
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
      }
      // momo: no endpoint provided in current docs — txRef stays as form.reference

      setRef(txRef);
      setView('success');
      queryClient.invalidateQueries({ queryKey: QK.walletBalances });
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
        ? `GHS ${form.bundle.price.toFixed(2)}`
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
        ? `GHS ${form.bundle.price.toFixed(2)}`
        : `GHS ${parseFloat(form.amount || '0').toFixed(2)}`;
    const accent =
      svcType === 'data' || svcType === 'momo' ? C.green :
        svcType === 'fibre' ? C.purple :
          svcType === 'bulk' ? C.orange :
            C.blue;

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <GradHdr title="Transaction Complete" gradient={G.wallet} />
        <SuccessCard amount={amount} reference={ref} accent={accent} onDone={goHome} />
      </View>
    );
  }

  const content =
    view === 'airtime' ? <AirtimeForm form={form} setForm={setForm} onNext={toConfirm} onBack={goHome} /> :
      view === 'data' ? <DataForm form={form} setForm={setForm} onNext={toConfirm} onBack={goHome}
        bundles={getDataBundles(form.network)} /> :
        view === 'fibre' ? <FibreForm form={form} setForm={setForm} onNext={toConfirm} onBack={goHome}
          bundles={getFibreBundles(form.provider)}
          providers={getFibreProviders()} /> :
          view === 'bulk' ? <BulkForm onNext={d => toConfirm(d as Record<string, unknown>)} onBack={goHome} products={products} /> :
            view === 'momo' ? <MomoSvcForm form={form} setForm={setForm} onNext={toConfirm} onBack={goHome} /> :
              view === 'confirm' ? renderConfirm() :
                view === 'success' ? renderSuccess() :
                  <ServicesHome onOpen={openSvc} />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor="#4BAEE8" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    </View>
  );
}
