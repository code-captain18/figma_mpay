import { useAuth } from '@/store/auth.store';
import { C, G } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, ChevronRight, CreditCard, RefreshCw, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { WalletView } from './types';

const sd = (size: number, color: string, opacity: number) =>
  Platform.select({
    ios: { shadowColor: color, shadowOffset: { width: 0, height: size / 2 }, shadowOpacity: opacity, shadowRadius: size },
    android: { elevation: Math.round(size * 0.8) },
  }) ?? {};

export function WalletHome({
  onSelect, topup, momo, balanceLoading, onRefresh,
}: {
  onSelect: (v: WalletView) => void;
  topup: number;
  momo: number;
  balanceLoading: boolean;
  onRefresh: () => void;
}) {
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const both = (user?.hasETopup ?? true) && (user?.hasMoMo ?? true);
  const perms = user?.permissions;
  const canLoadMoMo = !perms || perms['MoMo:withdraw']?.create !== false;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.navy, fontFamily: 'Urbanist_700Bold' }}>
            My Wallets
          </Text>
          {balanceLoading
            ? <ActivityIndicator size="small" color={C.blue} />
            : (
              <TouchableOpacity onPress={onRefresh} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <RefreshCw size={13} color={C.muted} />
              </TouchableOpacity>
            )
          }
        </View>
        <TouchableOpacity
          onPress={() => setHidden(!hidden)}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show balances' : 'Hide balances'}
          accessibilityHint="Toggles whether your wallet balances are visible"
          style={{ backgroundColor: 'rgba(24,120,206,0.07)', borderRadius: 99, paddingVertical: 4, paddingHorizontal: 10 }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.muted, fontFamily: 'Urbanist_600SemiBold' }}>
            {hidden ? 'Show balances' : 'Hide balances'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: both ? 'row' : 'column', gap: 10, marginBottom: 24 }}>
        {(user?.hasETopup ?? true) && (
          <LinearGradient
            colors={[C.gradientStart, C.blue, C.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 20, padding: 16, overflow: 'hidden' }}
          >
            <View style={{ position: 'absolute', top: -26, right: -18, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={12} color="#fff" />
              </View>
              <Text style={{ fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, fontFamily: 'Urbanist_700Bold' }}>
                {both ? 'e Top-Up' : 'e Top-Up Wallet'}
              </Text>
            </View>
            <Text style={{ fontSize: both ? 19 : 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 2, fontFamily: 'Urbanist_800ExtraBold' }}>
              {hidden ? '••••••' : `GHS ${topup.toFixed(2)}`}
            </Text>
            <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'Urbanist_400Regular' }}>
              {user?.accountId ?? ''}
            </Text>
          </LinearGradient>
        )}

        {(user?.hasMoMo ?? true) && (
          <LinearGradient
            colors={G.momoGreen.colors}
            start={G.momoGreen.start}
            end={G.momoGreen.end}
            style={{ flex: 1, borderRadius: 20, padding: 16, overflow: 'hidden' }}
          >
            <View style={{ position: 'absolute', top: -26, right: -18, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={12} color="#fff" />
              </View>
              <Text style={{ fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, fontFamily: 'Urbanist_700Bold' }}>
                {both ? 'mPay' : 'Mobile Money Wallet'}
              </Text>
            </View>
            <Text style={{ fontSize: both ? 19 : 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 2, fontFamily: 'Urbanist_800ExtraBold' }}>
              {hidden ? '••••••' : `GHS ${momo.toFixed(2)}`}
            </Text>
            <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'Urbanist_400Regular' }}>
              {user?.accountId ?? ''}
            </Text>
          </LinearGradient>
        )}
      </View>

      <Text style={{ fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 12, fontFamily: 'Urbanist_700Bold' }}>
        Load Wallet
      </Text>

      <View style={{ gap: 10 }}>
        {(user?.hasMoMo ?? true) && canLoadMoMo && (
          <TouchableOpacity
            onPress={() => onSelect('momo-form')}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 16, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, ...sd(6, C.navy, 0.05) }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(13,168,112,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={20} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 2, fontFamily: 'Urbanist_700Bold' }}>
                Load mPay Wallet
              </Text>
              <Text style={{ fontSize: 11, color: C.muted, fontFamily: 'Urbanist_500Medium' }}>
                {hidden ? 'Balance hidden' : `Balance: GHS ${momo.toFixed(2)}`}
              </Text>
            </View>
            <ChevronRight size={15} color={C.pale} />
          </TouchableOpacity>
        )}

        {(user?.hasETopup ?? true) && (
          <TouchableOpacity
            onPress={() => onSelect('etopup-form')}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 16, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, ...sd(6, C.navy, 0.05) }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(24,120,206,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} color={C.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 2, fontFamily: 'Urbanist_700Bold' }}>
                Load e Top-Up Wallet
              </Text>
              <Text style={{ fontSize: 11, color: C.muted, fontFamily: 'Urbanist_500Medium' }}>
                {hidden ? 'Balance hidden' : `Balance: GHS ${topup.toFixed(2)}`}
              </Text>
            </View>
            <ChevronRight size={15} color={C.pale} />
          </TouchableOpacity>
        )}

        {!(user?.hasMoMo ?? true) && !(user?.hasETopup ?? true) && (
          <View style={{ borderRadius: 18, padding: 24, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border, alignItems: 'center' }}>
            <AlertCircle size={32} color={C.pale} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.muted, marginTop: 8, fontFamily: 'Urbanist_600SemiBold' }}>
              No wallet products assigned
            </Text>
            <Text style={{ fontSize: 11, color: C.pale, marginTop: 4, fontFamily: 'Urbanist_400Regular' }}>
              Contact support to enable wallet top-up
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
