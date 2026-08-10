import { NetSelector } from '@/components/services/NetSelector';
import { GradHdr } from '@/components/services/GradHdr';
import { BundleGrid } from '@/components/services/BundleGrid';
import { Colors } from '@/theme';
import { GRADIENTS } from '@/constants/services';
import type { SFState, SvcBundle } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const C = Colors;
const G = GRADIENTS;

export const F = {
  medium: 'Urbanist_500Medium',
  semibold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
  extrabold: 'Urbanist_800ExtraBold',
} as const;

export const BTN_R = 14;
export const BTN_H = 52;
export const BTN_FS = 14;

export const saneStr = (v: string | null | undefined) =>
  (v && v !== 'undefined' && v !== 'null' ? v : '');

export function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={shr.label}>{label}</Text>
      {children}
    </View>
  );
}

export function SubmitBtn({
  label, gradient, onPress, disabled,
}: {
  label: string;
  gradient: typeof G.wallet;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={[shr.submitBtn, disabled && { opacity: 0.45 }]}
    >
      <LinearGradient
        colors={gradient.colors}
        start={gradient.start}
        end={gradient.end}
        style={shr.submitGrad}
      >
        <Text style={shr.submitText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export const shr = StyleSheet.create({
  label: {
    fontSize: 11,
    fontFamily: F.semibold,
    color: C.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: F.medium,
    color: C.navy,
    backgroundColor: C.bg,
  },
  submitBtn: { borderRadius: BTN_R, overflow: 'hidden', marginTop: 6 },
  submitGrad: { paddingVertical: BTN_H / 2 - 1, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontSize: 15, fontFamily: F.extrabold, color: '#fff' },
});

export const frm = StyleSheet.create({
  content: { padding: 20, paddingBottom: 36 },
  banner: { padding: 12, borderRadius: 13, marginBottom: 18, backgroundColor: 'rgba(24,120,206,0.06)', borderWidth: 1.5, borderColor: 'rgba(24,120,206,0.15)' },
  bannerText: { fontSize: 11, color: C.mid, fontFamily: F.medium, lineHeight: 17 },
  prefix: { position: 'absolute', left: 12, top: 12, fontSize: 13, fontFamily: F.semibold, color: C.mid, zIndex: 1 },
  quickAmts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qAmtBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 9, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.white },
  qAmtBtnActive: { borderColor: C.blue, backgroundColor: 'rgba(24,120,206,0.08)' },
  qAmtText: { fontSize: 12, fontFamily: F.medium, color: C.muted },
  qAmtTextActive: { fontFamily: F.bold, color: C.blue },
});
