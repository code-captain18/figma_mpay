import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { Colors } from '@/theme';

interface SuccessCardProps {
  amount: string;
  reference: string;
  accent: string;
  onDone: () => void;
}

export function SuccessCard({ amount, reference, accent, onDone }: SuccessCardProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Animated icon rings */}
      <View style={[styles.ring1, { borderColor: accent + '20' }]}>
        <View style={[styles.ring2, { borderColor: accent + '35', backgroundColor: accent + '0A' }]}>
          <View style={[styles.iconWrap, { backgroundColor: accent + '20' }]}>
            <CheckCircle2 size={42} color={accent} strokeWidth={1.8} />
          </View>
        </View>
      </View>

      <Text style={styles.headline}>Transaction Successful!</Text>
      <Text style={styles.sub}>
        Your transaction has been processed{'\n'}and is on its way.
      </Text>

      {/* Receipt card */}
      <View style={styles.card}>
        <Text style={styles.amountLabel}>AMOUNT</Text>
        <Text style={[styles.amount, { color: accent }]}>{amount}</Text>
        <View style={styles.divider} />
        <Text style={styles.refLabel}>REFERENCE</Text>
        <Text style={styles.ref}>{reference}</Text>
      </View>

      <TouchableOpacity
        onPress={onDone}
        activeOpacity={0.85}
        style={[styles.doneBtn, { backgroundColor: accent }]}
        accessibilityRole="button"
        accessibilityLabel="Done"
      >
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 36,
    paddingBottom: 40,
  },
  ring1: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ring2: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 22,
    fontFamily: 'Urbanist_800ExtraBold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 13,
    fontFamily: 'Urbanist_500Medium',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textDisabled,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  amount: {
    fontSize: 30,
    fontFamily: 'Urbanist_800ExtraBold',
    letterSpacing: -0.8,
    marginBottom: 18,
  },
  divider: { width: '100%', height: 1, backgroundColor: Colors.divider, marginBottom: 18 },
  refLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textDisabled,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  ref: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: Colors.textSecondary },
  doneBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { fontSize: 14, fontFamily: 'Urbanist_800ExtraBold', color: '#fff' },
});
