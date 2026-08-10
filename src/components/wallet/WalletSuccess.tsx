import { C } from '@/theme';
import { CheckCircle2 } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function WalletSuccess({
  amount, reference, title = 'Wallet Loaded!', onDone,
}: {
  amount: string;
  reference: string;
  title?: string;
  onDone: () => void;
}) {
  const scale = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <Animated.View style={{ transform: [{ scale }], opacity: fade, marginBottom: 20 }}>
        <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(13,168,112,0.1)', borderWidth: 3, borderColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={44} color={C.green} />
        </View>
      </Animated.View>

      <Animated.Text style={{ fontSize: 20, fontWeight: '800', color: C.navy, marginBottom: 6, fontFamily: 'Urbanist_800ExtraBold', opacity: fade, transform: [{ translateY: slideY }] }}>
        {title}
      </Animated.Text>

      <Animated.Text style={{ fontSize: 25, fontWeight: '800', color: C.green, marginBottom: 6, fontFamily: 'Urbanist_800ExtraBold', opacity: fade }}>
        {amount}
      </Animated.Text>

      <Animated.Text style={{ fontSize: 13, color: C.muted, marginBottom: 28, textAlign: 'center', lineHeight: 20, fontFamily: 'Urbanist_500Medium', opacity: fade, transform: [{ translateY: slideY }] }}>
        Transaction completed successfully.
      </Animated.Text>

      <Animated.View style={{ borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18, backgroundColor: 'rgba(13,168,112,0.07)', borderWidth: 1, borderColor: 'rgba(13,168,112,0.2)', marginBottom: 32, opacity: fade }}>
        <Text style={{ fontSize: 9, color: C.muted, marginBottom: 2, fontFamily: 'Urbanist_500Medium' }}>Reference</Text>
        <Text style={{ fontSize: 10, fontWeight: '700', color: C.navy }}>{reference}</Text>
      </Animated.View>

      <Animated.View style={{ width: '100%', opacity: fade, transform: [{ translateY: slideY }] }}>
        <TouchableOpacity onPress={onDone} activeOpacity={0.85}>
          <LinearGradient
            colors={[C.gradientStart, C.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff', fontFamily: 'Urbanist_800ExtraBold' }}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
