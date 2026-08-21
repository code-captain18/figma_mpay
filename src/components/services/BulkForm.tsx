import type { ApiBundle, ApiProduct } from '@/api';
import { BundleGrid } from '@/components/services/BundleGrid';
import { GradHdr } from '@/components/services/GradHdr';
import { NetSelector } from '@/components/services/NetSelector';
import { GRADIENTS, SVC_DATA_BUNDLES } from '@/constants/services';
import { useToast } from '@/store/toast.store';
import { Colors } from '@/theme';
import type { BulkItem, SvcBundle } from '@/types';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Plus, Trash2, Upload } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { F, FL, SubmitBtn, frm, saneStr, shr } from './ServiceFormPrimitives';

const C = Colors;
const G = GRADIENTS;

const NETS = [
  { id: 'mtn', short: 'MTN', color: '#FFC107' },
  { id: 'telecel', short: 'TEL', color: '#E8334A' },
  { id: 'airteltigo', short: 'AT', color: '#E91E63' },
  { id: 'glo', short: 'GLO', color: '#22C55E' },
];

export function BulkForm({
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

  useEffect(() => { setSharedBundle(null); }, [bulkType]);

  const dataBundles = useMemo((): SvcBundle[] => {
    const apiNet = sharedBundleNetwork.toUpperCase();
    const prod = products.find(p => p.network.toUpperCase() === apiNet && p.Type === 'Data');
    if (!prod?.bundles?.length) return SVC_DATA_BUNDLES;
    return prod.bundles.map((b: ApiBundle) => ({
      id: b.BundleCode,
      label: [saneStr(b.BundleName), saneStr(b.Validity)].filter(Boolean).join(' \u00b7 '),
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
