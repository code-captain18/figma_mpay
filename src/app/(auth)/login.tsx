import { LoginFormValues, loginSchema } from '@/features/auth/schemas/auth.schema';
import { useAuth } from '@/store/auth.store';
import { BTN, C, F, G } from '@/theme';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────────────────────────────────────
// LoginScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  // ── Form state ─────────────────────────────────────────────────────────────
  const { control, handleSubmit: rhfSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userFocus, setUserFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  // ── Animation refs ─────────────────────────────────────────────────────────
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  // Run entry animation on mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1, useNativeDriver: true,
        tension: 60, friction: 7,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
      Animated.timing(cardSlide, {
        toValue: 0, duration: 480,
        delay: 160, useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1, duration: 480,
        delay: 160, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Shake animation on wrong credentials
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -4, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = rhfSubmit(async (values: LoginFormValues) => {
    setError('');
    setLoading(true);

    try {
      await login(values.username, values.password);
      setLoading(false);
      setSuccess(true);
      await new Promise(r => setTimeout(r, 700));
      router.replace('/(app)/(tabs)');
    } catch (err: any) {
      setLoading(false);
      setError(err?.message ?? 'Invalid username or password. Please try again.');
      shake();
    }
  });


  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={G.login.colors}
      start={G.login.start}
      end={G.login.end}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
      {/* ── Background decorations ── */}
      <View style={[s.deco1, { top: insets.top + 10 }]} />
      <View style={s.deco2} />
      <View style={s.deco3} />
      <View style={s.deco4} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Logo / brand area ── */}
          <Animated.View
            style={[
              s.logoArea,
              { paddingTop: insets.top + 48 },
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={s.appIconWrap}>
              <LinearGradient
                colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.appIconGrad}
              >
                <View style={s.appIconInner}>
                  <Image
                    source={require('../../../assets/mpay_logooo.png')}
                    style={s.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
              <View style={s.appIconRing} />
            </View>

            <Text style={s.appName}>M-PAY</Text>
            <Text style={s.appTagline}>Manage Transactions Grow Your Business</Text>

            {/* Feature pills */}
            <View style={s.pillRow}>
              {(['Airtime', 'Data', 'Fibre', 'SMS'] as const).map((p, i) => (
                <View key={p} style={[s.pill, i === 1 && s.pillAccent]}>
                  <Text style={[s.pillText, i === 1 && s.pillTextAccent]}>{p}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* ── Login card ── */}
          <Animated.View
            style={[
              s.card,
              { paddingBottom: Math.max(insets.bottom + 16, 32) },
              {
                opacity: cardOpacity,
                transform: [
                  { translateY: cardSlide },
                  { translateX: shakeX },
                ],
              },
            ]}
          >
            {/* Card handle */}
            <View style={s.cardHandle} />

            <Text style={s.cardTitle}>Welcome back</Text>
            <Text style={s.cardSub}>Sign in to your account to continue</Text>

            {/* ── Error banner ── */}
            {(error || errors.username?.message || errors.password?.message) ? (
              <View style={s.errorBanner}>
                <AlertCircle size={14} color={C.red} />
                <Text style={s.errorText}>
                  {error || errors.username?.message || errors.password?.message}
                </Text>
              </View>
            ) : null}

            {/* ── Username field ── */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>USERNAME</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value, ref } }) => (
                  <View style={[
                    s.inputWrap,
                    userFocus && s.inputWrapFocus,
                    !!errors.username && s.inputWrapError,
                  ]}>
                    <TextInput
                      ref={ref}
                      value={value}
                      onChangeText={v => { onChange(v); setError(''); }}
                      onFocus={() => setUserFocus(true)}
                      onBlur={() => setUserFocus(false)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="username"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      placeholder="Enter username or account ID"
                      placeholderTextColor={C.pale}
                      style={s.input}
                      editable={!loading && !success}
                    />
                    {value.length > 0 && !errors.username && (
                      <CheckCircle2 size={15} color={C.green} style={{ marginRight: 12 }} />
                    )}
                  </View>
                )}
              />
            </View>

            {/* ── Password field ── */}
            <View style={[s.fieldWrap, { marginBottom: 8 }]}>
              <Text style={s.fieldLabel}>PASSWORD</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View style={[
                    s.inputWrap,
                    passFocus && s.inputWrapFocus,
                    !!errors.password && s.inputWrapError,
                  ]}>
                    <TextInput
                      ref={passwordRef}
                      value={value}
                      onChangeText={v => { onChange(v); setError(''); }}
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      secureTextEntry={!showPwd}
                      autoComplete="current-password"
                      returnKeyType="go"
                      onSubmitEditing={handleSubmit}
                      placeholder="Enter your password"
                      placeholderTextColor={C.pale}
                      style={[s.input, { paddingRight: 48 }]}
                      editable={!loading && !success}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPwd(p => !p)}
                      style={s.eyeBtn}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {showPwd
                        ? <EyeOff size={16} color={C.pale} />
                        : <Eye size={16} color={C.pale} />}
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            {/* ── Submit button ── */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || success}
              activeOpacity={0.85}
              style={[s.submitBtn, (loading || success) && { opacity: 0.9 }]}
            >
              {success ? (
                <View style={[s.submitInner, { backgroundColor: C.green }]}>
                  <CheckCircle2 size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={s.submitText}>Signing you in…</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={G.wallet.colors}
                  start={G.wallet.start}
                  end={G.wallet.end}
                  style={[
                    s.submitInner,
                    {
                      shadowColor: C.blue,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.38,
                      shadowRadius: 14,
                      elevation: 6,
                    },
                  ]}
                >
                  {loading && (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={{ marginRight: 10 }}
                    />
                  )}
                  <Text style={s.submitText}>
                    {loading ? 'Signing in…' : 'Sign In'}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            {/* ── Forgot password ── */}
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Forgot Password?',
                  'Password reset is not available in-app. Please contact your administrator or the M-Pay support team to reset your password.',
                  [{ text: 'OK' }],
                )
              }
              activeOpacity={0.7}
              style={s.forgotRow}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* ── Footer ── */}
            <Text style={s.footer}>
              © {new Date().getFullYear()} M-PAY · All rights reserved
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // ── Background decorations ──────────────────────────────────────────────
  deco1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  deco2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    top: 120,
    right: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  deco3: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    top: 200,
    left: -25,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  deco4: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: 320,
    left: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  // ── Logo area ────────────────────────────────────────────────────────────
  logoArea: {
    alignItems: 'center',
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  appIconWrap: {
    position: 'relative',
    marginBottom: 18,
  },
  appIconGrad: {
    width: 88,
    height: 88,
    borderRadius: 28,
    padding: 2,
  },
  appIconInner: {
    flex: 1,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  appIconRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 33,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoImage: {
    width: 68,
    height: 68,
  },
  appName: {
    fontSize: 32,
    fontFamily: F.black,
    color: '#fff',
    letterSpacing: 4,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 12,
    fontFamily: F.medium,
    color: 'rgba(255,255,255,0.62)',
    marginBottom: 18,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pillAccent: {
    backgroundColor: 'rgba(75,174,232,0.25)',
    borderColor: 'rgba(75,174,232,0.5)',
  },
  pillText: {
    fontSize: 10,
    fontFamily: F.semibold,
    color: 'rgba(255,255,255,0.7)',
  },
  pillTextAccent: {
    color: '#fff',
  },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 26,
    shadowColor: '#071830',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  cardHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.divider,
    alignSelf: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: F.black,
    color: C.navy,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: F.medium,
    color: C.muted,
    marginBottom: 22,
    lineHeight: 18,
  },

  // ── Error banner ─────────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: 'rgba(232,51,74,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(232,51,74,0.22)',
    borderRadius: 13,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    fontFamily: F.medium,
    color: C.red,
    lineHeight: 17,
  },

  // ── Fields ───────────────────────────────────────────────────────────────
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: F.semibold,
    color: C.mid,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.bg,
    overflow: 'hidden',
  },
  inputWrapFocus: {
    borderColor: C.blue,
    backgroundColor: '#fff',
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  inputWrapError: {
    borderColor: C.red,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: F.medium,
    color: C.navy,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 13,
  },

  // ── Forgot password ──────────────────────────────────────────────────────
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 11,
    fontFamily: F.semibold,
    color: C.blue,
  },

  // ── Submit button ─────────────────────────────────────────────────────────
  submitBtn: {
    borderRadius: BTN.primaryR,
    overflow: 'hidden',
    marginBottom: 18,
  },
  submitInner: {
    height: BTN.primaryH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BTN.primaryR,
  },
  submitText: {
    fontSize: BTN.primaryFS,
    fontFamily: F.extrabold,
    color: '#fff',
  },

  // ── Demo hint ─────────────────────────────────────────────────────────────
  hintBox: {
    backgroundColor: 'rgba(24,120,206,0.05)',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(24,120,206,0.12)',
  },
  hintText: {
    fontSize: 10,
    fontFamily: F.medium,
    color: C.muted,
  },
  hintBold: {
    fontFamily: F.bold,
    color: C.navy,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    fontSize: 11,
    fontFamily: F.medium,
    color: C.pale,
    textAlign: 'center',
    marginBottom: 4,
  },
});
