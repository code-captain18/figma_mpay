import { C } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { sd } from './WalletFormPrimitives';
import type { WFState, WalletView } from './types';

export function WalletConfirm({
  formData, walletType, onConfirm, onCancel, loading,
}: {
  formData: WFState;
  walletType: WalletView;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const productLabel =
    formData.product === 'MMONEYDB' ? 'MTN Mobile Money (MoMo)' :
      formData.product === 'MOMOWALLET' ? 'mPay Wallet' :
        formData.product === 'MOMOCASHOUT' ? 'MTN MoMo Cashout' :
          formData.product === 'MOMOCASHIN' ? 'MTN MoMo Cashin' : '—';

  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: 'Wallet', value: walletType === 'etopup-form' ? 'e Top-Up Wallet' : 'mPay Wallet' },
    { label: 'Product', value: productLabel },
    { label: 'Account ID', value: formData.accountId },
    { label: 'Amount', value: `GHS ${Number(formData.amount).toFixed(2)}` },
    ...(formData.phoneNumber ? [{ label: 'Phone', value: formData.phoneNumber }] : []),
    { label: 'Reference', value: formData.referenceId, mono: true },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={{ borderRadius: 18, overflow: 'hidden', backgroundColor: C.white, borderWidth: 1, borderColor: C.border, marginBottom: 16, ...sd(6, C.navy, 0.04) }}>
        <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: C.divider }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Urbanist_700Bold' }}>
            Transaction Summary
          </Text>
        </View>
        {rows.map((r, i) => (
          <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 12, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: C.divider }}>
            <Text style={{ fontSize: 11, color: C.muted, fontFamily: 'Urbanist_500Medium' }}>{r.label}</Text>
            <Text style={{ fontSize: r.mono ? 10 : 11, fontWeight: '700', color: C.navy, fontFamily: r.mono ? undefined : 'Urbanist_700Bold', maxWidth: '58%', textAlign: 'right' }}>
              {r.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ borderRadius: 16, padding: 16, marginBottom: 24, backgroundColor: 'rgba(24,120,206,0.06)', borderWidth: 1.5, borderColor: 'rgba(24,120,206,0.14)', alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontFamily: 'Urbanist_500Medium' }}>
          {walletType === 'momo-send' ? 'You are sending' : 'You are loading'}
        </Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: C.blue, fontFamily: 'Urbanist_800ExtraBold' }}>
          GHS {Number(formData.amount).toFixed(2)}
        </Text>
        <Text style={{ fontSize: 11, color: C.muted, marginTop: 2, fontFamily: 'Urbanist_500Medium' }}>
          {walletType === 'momo-send' ? 'to recipient' : 'into your wallet'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={onCancel}
          disabled={loading}
          activeOpacity={0.8}
          style={{ flex: 1, paddingVertical: 13, borderRadius: 14, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.5 : 1 }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.mid, fontFamily: 'Urbanist_700Bold' }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onConfirm} disabled={loading} activeOpacity={0.85} style={{ flex: 2 }}>
          <LinearGradient
            colors={loading ? [C.pale, C.pale] : [C.gradientStart, C.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 14, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
          >
            {loading && <ActivityIndicator size="small" color="#fff" />}
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff', fontFamily: 'Urbanist_800ExtraBold' }}>
              {loading ? 'Processing…' : 'Confirm'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
