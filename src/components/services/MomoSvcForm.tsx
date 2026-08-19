import { GradHdr } from '@/components/services/GradHdr';
import { NetSelector } from '@/components/services/NetSelector';
import { ContactPickerSheet } from '@/components/contacts/ContactPickerSheet';
import { SaveFavoriteRow } from '@/components/contacts/SaveFavoriteRow';
import { useContactPicker } from '@/features/contacts/hooks';
import { GRADIENTS } from '@/constants/services';
import { Colors } from '@/theme';
import { ghanaPhoneSchema } from '@/utils/phone';
import type { MomoType, SFState } from '@/types';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { F, FL, SubmitBtn, frm, shr } from './ServiceFormPrimitives';

const C = Colors;
const G = GRADIENTS;

const MOMO_TYPES: { id: MomoType; label: string; sub: string }[] = [
  { id: 'send', label: 'Send Money', sub: 'Transfer to any MoMo wallet' },
  { id: 'withdraw', label: 'Withdraw', sub: 'Cash out from MoMo wallet' },
  { id: 'cashin', label: 'Cash In', sub: 'Deposit to MoMo wallet' },
];

export function MomoSvcForm({
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
  const { state: contactState, openPicker, dismiss, showPermissionAlert } = useContactPicker();

  const handleContactPress = useCallback(() => {
    if (contactState.phase === 'denied') showPermissionAlert();
    else openPicker();
  }, [contactState.phase, openPicker, showPermissionAlert]);
  const phoneValid = ghanaPhoneSchema.safeParse(form.phone.trim()).success;

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
          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 12, backgroundColor: C.bg }}>
            <TextInput
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={v => set('phone', v)}
              placeholder="024XXXXXXX"
              placeholderTextColor={C.pale}
              style={[shr.input, { flex: 1, borderWidth: 0 }]}
            />
            <TouchableOpacity
              onPress={handleContactPress}
              activeOpacity={0.7}
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Choose from contacts"
            >
              {contactState.phase === 'loading'
                ? <ActivityIndicator size="small" color={C.blue} />
                : <UserRound size={18} color={C.blue} />}
            </TouchableOpacity>
          </View>
          {phoneValid && (
            <View style={{ marginTop: 6 }}>
              <SaveFavoriteRow phoneNumber={form.phone.trim()} />
            </View>
          )}
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
      <ContactPickerSheet
        visible={contactState.phase === 'ready'}
        contacts={contactState.phase === 'ready' ? contactState.contacts : []}
        onSelect={(num) => { set('phone', num); dismiss(); }}
        onClose={dismiss}
      />
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
