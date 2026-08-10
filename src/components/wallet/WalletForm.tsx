import { useAuth } from '@/store/auth.store';
import { C } from '@/theme';
import { genWalletRef } from '@/utils/ref';
import { AlertCircle, Hash, Phone, RefreshCw, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Field, SInput, SelectSheet } from './WalletFormPrimitives';
import type { WFState } from './types';

export function WalletForm({
  isMoMo, isSend, initialProduct, onBack: _onBack, onSubmit,
}: {
  isMoMo: boolean;
  isSend?: boolean;
  initialProduct?: string;
  onBack: () => void;
  onSubmit: (d: WFState) => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState<WFState>({
    product: initialProduct ?? (isMoMo ? 'MOMOCASHOUT' : ''),
    accountId: user?.accountId ?? '',
    amount: '',
    phoneNumber: '',
    referenceId: genWalletRef(),
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [touched, setTouch] = useState<Record<string, boolean>>({});

  const showPhone = isMoMo || form.product === 'MMONEYDB';

  const set = (k: keyof WFState, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (touched[k]) setErrs(p => ({ ...p, [k]: '' }));
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!isMoMo && !form.product) e.product = 'Select a product';
    if (!form.amount || isNaN(+form.amount) || +form.amount < 0.10)
      e.amount = 'Minimum amount is GHS 0.10';
    if (showPhone && !form.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    if (showPhone && form.phoneNumber && !/^(0[0-9]{9})$/.test(form.phoneNumber.replace(/\s/g, '')))
      e.phoneNumber = 'Enter a valid Ghana number (0XXXXXXXXX)';
    return e;
  };

  const submit = () => {
    setTouch({ product: true, amount: true, phoneNumber: true });
    const ev = validate();
    setErrs(ev);
    if (!Object.keys(ev).length) onSubmit(form);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 14, marginBottom: 18, backgroundColor: 'rgba(24,120,206,0.06)', borderWidth: 1.5, borderColor: 'rgba(24,120,206,0.15)' }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, backgroundColor: 'rgba(24,120,206,0.12)', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            <AlertCircle size={14} color={C.blue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.blue, marginBottom: 3, fontFamily: 'Urbanist_700Bold' }}>Load Wallet</Text>
            <Text style={{ fontSize: 11, color: C.mid, lineHeight: 17, fontWeight: '500', fontFamily: 'Urbanist_500Medium' }}>
              Load Wallet allows you to add funds to your account. The funds you load here will be used for airtime and data bundle.
            </Text>
          </View>
        </View>

        {isMoMo && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, marginBottom: 18, backgroundColor: 'rgba(233,145,10,0.07)', borderWidth: 1.5, borderColor: 'rgba(233,145,10,0.2)' }}>
            <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff', fontFamily: 'Urbanist_900Black' }}>MTN</Text>
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.navy, fontFamily: 'Urbanist_700Bold' }}>MTN Mobile Money (MoMo)</Text>
              <Text style={{ fontSize: 10, color: C.muted, fontFamily: 'Urbanist_400Regular' }}>Ghana</Text>
            </View>
          </View>
        )}

        {!isMoMo && (
          <Field label="Product" required error={touched.product ? errs.product : ''}>
            <SelectSheet
              value={form.product}
              onChange={v => { set('product', v); setTouch(p => ({ ...p, product: true })); if (v !== 'MMONEYDB') set('phoneNumber', ''); }}
              options={[
                { value: 'MOMOWALLET', label: 'Mobile Money Wallet' },
                { value: 'MMONEYDB', label: 'MTN Mobile Money (MoMo)' },
              ]}
              placeholder="Select product"
              error={!!(touched.product && errs.product)}
            />
          </Field>
        )}

        <Field label="Account ID">
          <SInput value={form.accountId} disabled icon={<User size={14} color={C.pale} />} />
        </Field>

        <Field label="Amount" required error={touched.amount ? errs.amount : ''}>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: touched.amount && errs.amount ? C.red : C.border, backgroundColor: C.white, paddingHorizontal: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.muted, fontFamily: 'Urbanist_700Bold', marginRight: 4 }}>GHS</Text>
            <TextInput
              value={form.amount}
              onChangeText={v => set('amount', v)}
              onBlur={() => setTouch(p => ({ ...p, amount: true }))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={C.pale}
              style={{ flex: 1, fontSize: 13, fontWeight: '600', color: C.navy, fontFamily: 'Urbanist_600SemiBold', paddingVertical: 11, padding: 0 }}
            />
          </View>
        </Field>

        {showPhone && (
          <Field label={isSend ? 'Recipient Phone' : 'Phone Number'} required error={touched.phoneNumber ? errs.phoneNumber : ''}>
            <SInput
              value={form.phoneNumber}
              onChangeText={v => set('phoneNumber', v)}
              onBlur={() => setTouch(p => ({ ...p, phoneNumber: true }))}
              keyboardType="phone-pad"
              placeholder={isSend ? 'Recipient number (0XXXXXXXXX)' : 'e.g. 0244123456'}
              icon={<Phone size={14} color={touched.phoneNumber && errs.phoneNumber ? C.red : C.pale} />}
              error={!!(touched.phoneNumber && errs.phoneNumber)}
            />
          </Field>
        )}

        <Field label="Reference ID">
          <SInput
            value={form.referenceId}
            disabled
            icon={<Hash size={14} color={C.pale} />}
            rightEl={
              <TouchableOpacity onPress={() => set('referenceId', genWalletRef())} style={{ backgroundColor: 'rgba(24,120,206,0.07)', borderRadius: 7, padding: 5 }}>
                <RefreshCw size={12} color={C.blue} />
              </TouchableOpacity>
            }
          />
          <Text style={{ fontSize: 9, color: C.pale, marginTop: 3, fontFamily: 'Urbanist_400Regular' }}>{form.referenceId.length}/255 chars</Text>
        </Field>

        <TouchableOpacity onPress={submit} activeOpacity={0.85} style={{ marginTop: 8 }}>
          <LinearGradient
            colors={[C.gradientStart, C.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff', fontFamily: 'Urbanist_800ExtraBold' }}>
              {isSend ? 'Send' : 'Load'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
