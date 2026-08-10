import { BundleGrid } from '@/components/services/BundleGrid';
import { GradHdr } from '@/components/services/GradHdr';
import { GRADIENTS } from '@/constants/services';
import { Colors } from '@/theme';
import type { SFState, SvcBundle } from '@/types';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { F, FL, SubmitBtn, frm, shr } from './ServiceFormPrimitives';

const C = Colors;
const G = GRADIENTS;

export function FibreForm({
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
