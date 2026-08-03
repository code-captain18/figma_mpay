import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import type { GradientDef } from '@/constants/services';

const DEFAULT_GRAD: GradientDef = {
  colors: ['#4BAEE8', '#1878CE', '#052D6E'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

interface GradHdrProps {
  title: string;
  onBack?: () => void;
  gradient?: GradientDef;
}

export function GradHdr({ title, onBack, gradient = DEFAULT_GRAD }: GradHdrProps) {
  return (
    <LinearGradient
      colors={gradient.colors}
      start={gradient.start}
      end={gradient.end}
      style={styles.wrap}
    >
      <View style={styles.decoCircle} />
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.85}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    overflow: 'hidden',
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
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Urbanist_800ExtraBold',
    color: '#fff',
    letterSpacing: -0.5,
  },
});
