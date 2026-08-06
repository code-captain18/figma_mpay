import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';
import type { GradientDef } from '@/constants/services';

export interface ConfirmRow {
  label: string;
  value: string;
  mono?: boolean;
}

interface ConfirmCardProps {
  title: string;
  rows: ConfirmRow[];
  amount: string;
  gradient: GradientDef;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmCard({ title, rows, amount, gradient, onCancel, onConfirm, loading = false }: ConfirmCardProps) {
  return (
    <View style={styles.container}>
      {/* Amount banner */}
      <LinearGradient
        colors={gradient.colors}
        start={gradient.start}
        end={gradient.end}
        style={styles.banner}
      >
        <View style={styles.bannerDeco} />
        <Text style={styles.bannerLabel}>TOTAL AMOUNT</Text>
        <Text style={styles.bannerAmount}>{amount}</Text>
      </LinearGradient>

      {/* Receipt rows */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        {rows.map((row, i) => (
          <View key={row.label + i}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={[styles.rowValue, row.mono && styles.mono]}>{row.value}</Text>
            </View>
            {i < rows.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.85}
          style={styles.cancelBtn}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={loading ? undefined : onConfirm}
          activeOpacity={0.85}
          style={styles.confirmWrap}
          accessibilityRole="button"
          accessibilityLabel="Confirm transaction"
          accessibilityState={{ disabled: loading }}
        >
          <LinearGradient
            colors={gradient.colors}
            start={gradient.start}
            end={gradient.end}
            style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.confirmText}>Confirm</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  banner: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  bannerDeco: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -30,
    right: -20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bannerAmount: {
    fontSize: 34,
    fontFamily: 'Urbanist_800ExtraBold',
    color: '#fff',
    letterSpacing: -1,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { fontSize: 13, fontFamily: 'Urbanist_500Medium', color: Colors.textMuted },
  rowValue: {
    fontSize: 13,
    fontFamily: 'Urbanist_700Bold',
    color: Colors.textPrimary,
    maxWidth: '58%',
    textAlign: 'right',
  },
  mono: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 11,
    color: Colors.textSecondary,
  },
  divider: { height: 1, backgroundColor: Colors.divider },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  cancelText: { fontSize: 14, fontFamily: 'Urbanist_700Bold', color: Colors.textMuted },
  confirmWrap: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  confirmBtn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontSize: 14, fontFamily: 'Urbanist_800ExtraBold', color: '#fff' },
});
