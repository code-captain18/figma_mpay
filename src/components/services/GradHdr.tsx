import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GradientDef } from '@/constants/services';

const DEFAULT_GRAD: GradientDef = {
  colors: ['#4BAEE8', '#1878CE', '#052D6E'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

interface GradHdrProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  gradient?: GradientDef;
}

export function GradHdr({ title, onBack, right, gradient = DEFAULT_GRAD }: GradHdrProps) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={gradient.colors}
      start={gradient.start}
      end={gradient.end}
      style={[styles.wrap, { paddingTop: insets.top + 14 }]}
    >
      <View style={styles.decoCircle} />
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.85}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={styles.title}>{title}</Text>
        {right ? right : <View style={styles.backPlaceholder} />}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: 'hidden',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  decoCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: -30,
    right: -20,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 40,
    height: 40,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Urbanist_800ExtraBold',
    color: '#fff',
    letterSpacing: -0.5,
    marginHorizontal: 10,
  },
});
