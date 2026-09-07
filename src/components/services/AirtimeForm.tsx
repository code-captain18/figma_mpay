import { ContactPickerSheet } from '@/components/contacts/ContactPickerSheet';
import { SaveFavoriteRow } from '@/components/contacts/SaveFavoriteRow';
import { GradHdr } from '@/components/services/GradHdr';
import { NetSelector } from '@/components/services/NetSelector';
import { GRADIENTS } from '@/constants/services';
import { useContactPicker } from '@/features/contacts/hooks';
import { Colors } from '@/theme';
import type { SFState } from '@/types';
import { ghanaPhoneSchema } from '@/utils/phone';
import { UserRound } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const amountNum = parseFloat(form.amount);
  const amountValid = form.amount !== '' && Number.isFinite(amountNum) && amountNum > 0;
  const ok = !!form.phone && amountValid;
  const { state: contactState, openPicker, dismiss, showPermissionAlert } = useContactPicker();

  const handleContactPress = useCallback(() => {
    if (contactState.phase === 'denied') showPermissionAlert();
    else openPicker();
  }, [contactState.phase, openPicker, showPermissionAlert]);
  const phoneValid = ghanaPhoneSchema.safeParse(form.phone.trim()).success;

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
      <ContactPickerSheet
        visible={contactState.phase === 'ready'}
        contacts={contactState.phase === 'ready' ? contactState.contacts : []}
        onSelect={(num) => { set('phone', num); dismiss(); }}
        onClose={dismiss}
      />
    </View>
  );
}
