import { DateInput } from '@/components/ui/DateInput';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, X } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { C, F, G } from '@/theme';
import type { FilterState, SvcType } from '@/types';

export const EMPTY_FILTER: FilterState = {
  status: '',
  svcType: '',
  phone: '',
  ref: '',
  dateFrom: '',
  dateTo: '',
  amtMin: '',
  amtMax: '',
};

const SVC_LABELS: Record<string, string> = {
  airtime: 'Airtime',
  data: 'Data Bundle',
  fibre: 'Fibre',
  bulk: 'Bulk',
  momo: 'MoMo',
};


// ─────────────────────────────────────────────────────────────────────────────
// FilterSheet — bottom sheet modal
// ─────────────────────────────────────────────────────────────────────────────
export function FilterSheet({
  filter,
  setFilter,
  onApply,
  onClose,
}: {
  filter: FilterState;
  setFilter: (f: FilterState) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<FilterState>(filter);

  const set = (k: keyof FilterState, v: string) =>
    setLocal(p => ({ ...p, [k]: v }));

  const Chip = ({
    label, field, value,
  }: { label: string; field: keyof FilterState; value: string }) => {
    const active = local[field] === value;
    return (
      <TouchableOpacity
        onPress={() => set(field, active ? '' : value)}
        activeOpacity={0.8}
        style={[fs.chip, active && fs.chipActive]}
      >
        <Text style={[fs.chipText, active && fs.chipTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const fullFields: { label: string; field: keyof FilterState; kbd: import('react-native').KeyboardTypeOptions; ph: string }[] = [
    { label: 'PHONE NUMBER', field: 'phone', kbd: 'phone-pad', ph: 'e.g. 233244123456' },
    { label: 'REFERENCE ID', field: 'ref', kbd: 'default', ph: 'e.g. WB17220912234567890' },
  ];

  const pairedFields: { label: string; field: keyof FilterState; kbd: import('react-native').KeyboardTypeOptions; ph: string; icon?: true }[][] = [
    [
      { label: 'DATE FROM', field: 'dateFrom', kbd: 'default', ph: 'mm/dd/yyyy', icon: true },
      { label: 'DATE TO', field: 'dateTo', kbd: 'default', ph: 'mm/dd/yyyy', icon: true },
    ],
    [
      { label: 'MIN AMOUNT', field: 'amtMin', kbd: 'decimal-pad', ph: '0.00' },
      { label: 'MAX AMOUNT', field: 'amtMax', kbd: 'decimal-pad', ph: '0.00' },
    ],
  ];

  return (
    <>
      <TouchableOpacity
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.overlay, zIndex: 100 }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={fs.sheet}>
        <View style={fs.dragHandle} />
        <View style={fs.sheetHeader}>
          <Text style={fs.sheetTitle}>Filter Transactions</Text>
          <TouchableOpacity onPress={onClose} style={fs.closeBtn} activeOpacity={0.8}>
            <X size={16} color={C.mid} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={fs.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={fs.groupLabel}>STATUS</Text>
          <View style={fs.chips}>
            {[
              { label: 'Success', value: 'success' },
              { label: 'Failed', value: 'failed' },
            ].map(({ label, value }) => (
              <Chip key={value} label={label} field="status" value={value} />
            ))}
          </View>

          <Text style={fs.groupLabel}>SERVICE TYPE</Text>
          <View style={fs.chips}>
            {(['airtime', 'data', 'fibre', 'bulk', 'momo'] as SvcType[]).map(t => (
              <Chip key={t} label={SVC_LABELS[t]} field="svcType" value={t} />
            ))}
          </View>

          {/* Full-width fields */}
          {fullFields.map(f => (
            <View key={f.field} style={{ marginBottom: 12 }}>
              <Text style={fs.groupLabel}>{f.label}</Text>
              <TextInput
                value={local[f.field]}
                onChangeText={v => set(f.field, v)}
                keyboardType={f.kbd}
                placeholder={f.ph}
                placeholderTextColor={C.pale}
                style={fs.input}
              />
            </View>
          ))}

          {/* Paired fields (side by side) */}
          {pairedFields.map((pair, gi) => (
            <View key={gi} style={{ flexDirection: 'row', gap: 10 }}>
              {pair.map(f => (
                <View key={f.field} style={{ flex: 1, marginBottom: 12 }}>
                  <Text style={fs.groupLabel}>{f.label}</Text>
                  {'icon' in f && f.icon ? (
                    <DateInput
                      value={local[f.field]}
                      onChange={v => set(f.field, v)}
                    />
                  ) : (
                    <TextInput
                      value={local[f.field]}
                      onChangeText={v => set(f.field, v)}
                      keyboardType={f.kbd}
                      placeholder={f.ph}
                      placeholderTextColor={C.pale}
                      style={fs.input}
                    />
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={fs.footer}>
          <TouchableOpacity
            onPress={() => {
              setLocal(EMPTY_FILTER);
              setFilter(EMPTY_FILTER);
            }}
            style={fs.clearBtn}
            activeOpacity={0.8}
          >
            <Text style={fs.clearText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setFilter(local); onApply(); onClose(); }}
            activeOpacity={0.85}
            style={fs.applyBtn}
          >
            <LinearGradient
              colors={G.wallet.colors}
              start={G.wallet.start}
              end={G.wallet.end}
              style={fs.applyGrad}
            >
              <Text style={fs.applyText}>Apply Filters</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const fs = StyleSheet.create({
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 101, backgroundColor: C.white, borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '82%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.divider },
  sheetTitle: { fontSize: 15, fontFamily: F.extrabold, color: C.navy },
  closeBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  sheetContent: { padding: 20, paddingTop: 14, paddingBottom: 8 },
  groupLabel: { fontSize: 11, fontFamily: F.semibold, color: C.mid, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 16 },
  chip: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  chipActive: { borderColor: C.blue, backgroundColor: 'rgba(24,120,206,0.08)' },
  chipText: { fontSize: 11, fontFamily: F.medium, color: C.muted, textTransform: 'capitalize' },
  chipTextActive: { color: C.blue, fontFamily: F.bold },
  input: { borderWidth: 1.5, borderColor: C.border, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 10, fontSize: 13, fontFamily: F.medium, color: C.navy, backgroundColor: C.bg },
  inputRow: { borderWidth: 1.5, borderColor: C.border, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bg },
  inputInner: { flex: 1, fontSize: 13, fontFamily: F.medium, color: C.navy, padding: 0 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.divider, alignSelf: 'center', marginTop: 10, marginBottom: 2 },
  footer: { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.divider },
  clearBtn: { flex: 1, paddingVertical: 13, borderRadius: 13, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  clearText: { fontSize: 13, fontFamily: F.bold, color: C.muted },
  applyBtn: { flex: 2, borderRadius: 13, overflow: 'hidden' },
  applyGrad: { paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  applyText: { fontSize: 14, fontFamily: F.extrabold, color: '#fff' },
});
