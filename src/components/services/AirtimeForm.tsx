import { NetSelector } from '@/components/services/NetSelector';
import { GradHdr } from '@/components/services/GradHdr';
import { GRADIENTS } from '@/constants/services';
import { Colors } from '@/theme';
import type { SFState } from '@/types';
import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FL, SubmitBtn, frm, shr } from './ServiceFormPrimitives';

const C = Colors;
const G = GRADIENTS;

export function AirtimeForm({
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
