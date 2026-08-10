import { C } from '@/theme';
import { FileText } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

const USSD_STEPS = [
  'Dial *170# on your phone.',
  'Select 6 – My Wallet.',
  'Select 3 – My Approvals.',
  'Select 1 – My Approvals.',
  'Enter your MoMo PIN to view pending transactions.',
  'Select the pending transaction you want to approve.',
  'Choose 1 to Approve.',
];

export function WalletProcessing({ referenceId }: { referenceId: string }) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40, alignItems: 'center' }}
    >
      <ActivityIndicator size="large" color={C.blue} style={{ marginBottom: 24 }} />

      <Text style={{ fontSize: 20, fontWeight: '800', color: C.navy, fontFamily: 'Urbanist_800ExtraBold', marginBottom: 10, textAlign: 'center' }}>
        Processing transaction
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <FileText size={13} color={C.muted} />
        <Text style={{ fontSize: 12, color: C.muted, fontFamily: 'Urbanist_500Medium' }}>
          Reference Id #{referenceId}
        </Text>
      </View>

      <Text style={{ fontSize: 12, color: C.mid, textAlign: 'center', fontFamily: 'Urbanist_400Regular', lineHeight: 18, marginBottom: 30 }}>
        Please wait while we process your Wallet Credit request...
      </Text>

      <View style={{ width: '100%', marginBottom: 24 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.blue, fontFamily: 'Urbanist_700Bold', textAlign: 'center', marginBottom: 10 }}>
          Authorize Transaction via USSD
        </Text>
        {USSD_STEPS.map((step, i) => (
          <Text key={i} style={{ fontSize: 12, color: C.mid, textAlign: 'center', fontFamily: 'Urbanist_400Regular', lineHeight: 22 }}>
            {step}
          </Text>
        ))}
      </View>

      <View style={{ width: '60%', height: 1, backgroundColor: C.divider, marginBottom: 24 }} />

      <View style={{ width: '100%' }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.blue, fontFamily: 'Urbanist_700Bold', textAlign: 'center', marginBottom: 10 }}>
          Authorize Transaction via MTN App
        </Text>
        <Text style={{ fontSize: 12, color: C.mid, textAlign: 'center', fontFamily: 'Urbanist_400Regular', lineHeight: 22 }}>
          Open the MTN MoMo App and sign in.
        </Text>
        <Text style={{ fontSize: 12, color: C.mid, textAlign: 'center', fontFamily: 'Urbanist_400Regular', lineHeight: 22 }}>
          Tap <Text style={{ fontWeight: '700', fontFamily: 'Urbanist_700Bold', color: C.navy }}>Allow Cash Out.</Text>
        </Text>
        <Text style={{ fontSize: 12, color: C.mid, textAlign: 'center', fontFamily: 'Urbanist_400Regular', lineHeight: 22 }}>
          Tap <Text style={{ fontWeight: '700', fontFamily: 'Urbanist_700Bold', color: C.navy }}>Go to Approvals.</Text>
        </Text>
        <Text style={{ fontSize: 12, color: C.mid, textAlign: 'center', fontFamily: 'Urbanist_400Regular', lineHeight: 22 }}>
          Select the transaction, then tap{' '}
          <Text style={{ fontWeight: '700', fontFamily: 'Urbanist_700Bold', color: C.navy }}>Approve.</Text>
        </Text>
      </View>
    </ScrollView>
  );
}
