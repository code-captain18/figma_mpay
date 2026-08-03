import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft, ChevronRight,
  CreditCard,
  Hash, Phone,
  RefreshCw,
  Smartphone,
  User
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/store/auth.store';
import { C } from '@/theme';
import { genRef } from '@/utils/ref';
import { formatGHS } from '@/utils/format';

/* ─── Shadow helper ──────────────────────────────────────────────────────────── */
const sd = (size: number, color: string, opacity: number) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: size / 2 },
      shadowOpacity: opacity,
      shadowRadius: size,
    },
    android: { elevation: Math.round(size * 0.8) },
  }) ?? {};

/* ─── Types ──────────────────────────────────────────────────────────────────── */
type WalletView = 'home' | 'etopup-form' | 'momo-form' | 'confirm' | 'success';

interface WFState {
  product: string;
  accountId: string;
  amount: string;
  phoneNumber: string;
  referenceId: string;
}


/* ══════════════════════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
══════════════════════════════════════════════════════════════════════════════ */

/* Field label wrapper */
function Field({
  label, required, error, children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <Text style={{
          fontSize: 11, fontWeight: '700', color: C.mid,
          textTransform: 'uppercase', letterSpacing: 0.6,
          fontFamily: 'Urbanist_600SemiBold',
        }}>
          {label}
        </Text>
        {required && (
          <Text style={{ fontSize: 10, color: C.red, fontWeight: '700' }}>*</Text>
        )}
      </View>
      {children}
      {!!error && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }}>
          <AlertCircle size={10} color={C.red} />
          <Text style={{
            fontSize: 10, color: C.red, fontWeight: '600',
            fontFamily: 'Urbanist_600SemiBold',
          }}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

/* Styled TextInput */
function SInput({
  icon, disabled, error, rightEl, style: _style, ...props
}: {
  icon?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  rightEl?: React.ReactNode;
} & React.ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? C.red
    : disabled
      ? C.divider
      : focused
        ? C.blue
        : C.border;

  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      borderRadius: 12, borderWidth: 1.5, borderColor,
      backgroundColor: disabled ? 'rgba(24,120,206,0.04)' : C.white,
      paddingHorizontal: 12,
    }}>
      {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
      <TextInput
        {...props}
        editable={!disabled}
        placeholderTextColor={C.pale}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        style={{
          flex: 1, fontSize: 14, fontWeight: '500',
          color: disabled ? C.muted : C.navy,
          fontFamily: 'Urbanist_500Medium',
          paddingVertical: 11,
          padding: 0, margin: 0,
        }}
      />
      {rightEl && <View style={{ marginLeft: 8 }}>{rightEl}</View>}
    </View>
  );
}

/* Product select — bottom-sheet modal */
function SelectSheet({
  value, onChange, options, placeholder, error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12, paddingVertical: 12,
          borderRadius: 12, borderWidth: 1.5,
          borderColor: error ? C.red : open ? C.blue : C.border,
          backgroundColor: C.white,
        }}
      >
        <Text style={{
          fontSize: 13, fontWeight: '600',
          color: selected ? C.navy : C.pale,
          fontFamily: selected ? 'Urbanist_600SemiBold' : 'Urbanist_500Medium',
        }}>
          {selected ? selected.label : (placeholder ?? 'Select\u2026')}
        </Text>
        <ChevronDown size={14} color={C.muted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{
            flex: 1, backgroundColor: 'rgba(7,24,48,0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={e => e.stopPropagation()}>
            <View style={{
              backgroundColor: C.white,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              paddingBottom: 40,
            }}>
              <View style={{
                width: 40, height: 4, borderRadius: 2,
                backgroundColor: C.pale, alignSelf: 'center',
                marginTop: 12, marginBottom: 20,
              }} />
              <Text style={{
                fontSize: 14, fontWeight: '700', color: C.navy,
                paddingHorizontal: 20, marginBottom: 10,
                fontFamily: 'Urbanist_700Bold',
              }}>
                Select Product
              </Text>
              {options.map((opt, i) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { onChange(opt.value); setOpen(false); }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                    paddingVertical: 15, paddingHorizontal: 20,
                    backgroundColor:
                      opt.value === value ? 'rgba(24,120,206,0.05)' : 'transparent',
                    borderBottomWidth: i < options.length - 1 ? 1 : 0,
                    borderBottomColor: C.divider,
                  }}
                >
                  {opt.value === value ? (
                    <CheckCircle2 size={17} color={C.blue} />
                  ) : (
                    <View style={{
                      width: 17, height: 17, borderRadius: 9,
                      borderWidth: 1.5, borderColor: C.border,
                    }} />
                  )}
                  <Text style={{
                    fontSize: 14,
                    fontWeight: opt.value === value ? '700' : '500',
                    color: opt.value === value ? C.blue : C.navy,
                    fontFamily: opt.value === value
                      ? 'Urbanist_700Bold'
                      : 'Urbanist_500Medium',
                  }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/* Gradient header */
function GradHdr({
  title, onBack, colors,
}: {
  title: string;
  onBack?: () => void;
  colors?: readonly [string, string, string];
}) {
  return (
    <LinearGradient
      colors={colors ?? [C.gradientStart, C.blue, C.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18,
        borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.8}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={18} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={{
          fontSize: 16, fontWeight: '800', color: '#fff',
          fontFamily: 'Urbanist_800ExtraBold',
        }}>
          {title}
        </Text>
      </View>
    </LinearGradient>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   WALLET HOME
══════════════════════════════════════════════════════════════════════════════ */
function WalletHome({ onSelect }: { onSelect: (v: WalletView) => void }) {
  const { user } = useAuth();
  const [hidden, setHidden] = useState(false);
  const both = (user?.hasETopup ?? true) && (user?.hasMoMo ?? true);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
    >
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 12,
      }}>
        <Text style={{
          fontSize: 13, fontWeight: '700', color: C.navy,
          fontFamily: 'Urbanist_700Bold',
        }}>
          My Wallets
        </Text>
        <TouchableOpacity
          onPress={() => setHidden(!hidden)}
          style={{
            backgroundColor: 'rgba(24,120,206,0.07)',
            borderRadius: 99, paddingVertical: 4, paddingHorizontal: 10,
          }}
        >
          <Text style={{
            fontSize: 11, fontWeight: '600', color: C.muted,
            fontFamily: 'Urbanist_600SemiBold',
          }}>
            {hidden ? 'Show balances' : 'Hide balances'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{
        flexDirection: both ? 'row' : 'column',
        gap: 10, marginBottom: 24,
      }}>
        {(user?.hasETopup ?? true) && (
          <LinearGradient
            colors={[C.gradientStart, C.blue, C.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 20, padding: 16, overflow: 'hidden' }}
          >
            <View style={{
              position: 'absolute', top: -26, right: -18,
              width: 90, height: 90, borderRadius: 45,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }} />
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              gap: 6, marginBottom: 10,
            }}>
              <View style={{
                width: 24, height: 24, borderRadius: 7,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <CreditCard size={12} color="#fff" />
              </View>
              <Text style={{
                fontSize: 9, fontWeight: '700',
                color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5,
                fontFamily: 'Urbanist_700Bold',
              }}>
                {both ? 'e Top-Up' : 'e Top-Up Wallet'}
              </Text>
            </View>
            <Text style={{
              fontSize: both ? 19 : 26, fontWeight: '800',
              color: '#fff', letterSpacing: -0.5, marginBottom: 2,
              fontFamily: 'Urbanist_800ExtraBold',
            }}>
              {hidden ? '\u2022\u2022\u2022\u2022\u2022\u2022' : `GH\u20B5${(user?.eTopupBalance ?? 0).toFixed(2)}`}
            </Text>
            <Text style={{
              fontSize: 9, color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Urbanist_400Regular',
            }}>
              {user?.accountId ?? ''}
            </Text>
          </LinearGradient>
        )}

        {(user?.hasMoMo ?? true) && (
          <LinearGradient
            colors={['#12C47E', '#0A9260', '#065C3D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 20, padding: 16, overflow: 'hidden' }}
          >
            <View style={{
              position: 'absolute', top: -26, right: -18,
              width: 90, height: 90, borderRadius: 45,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }} />
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              gap: 6, marginBottom: 10,
            }}>
              <View style={{
                width: 24, height: 24, borderRadius: 7,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Smartphone size={12} color="#fff" />
              </View>
              <Text style={{
                fontSize: 9, fontWeight: '700',
                color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5,
                fontFamily: 'Urbanist_700Bold',
              }}>
                {both ? 'Mobile Money' : 'Mobile Money Wallet'}
              </Text>
            </View>
            <Text style={{
              fontSize: both ? 19 : 26, fontWeight: '800',
              color: '#fff', letterSpacing: -0.5, marginBottom: 2,
              fontFamily: 'Urbanist_800ExtraBold',
            }}>
              {hidden ? '\u2022\u2022\u2022\u2022\u2022\u2022' : `GH\u20B5${(user?.momoBalance ?? 0).toFixed(2)}`}
            </Text>
            <Text style={{
              fontSize: 9, color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Urbanist_400Regular',
            }}>
              {user?.accountId ?? ''}
            </Text>
          </LinearGradient>
        )}
      </View>

      <Text style={{
        fontSize: 13, fontWeight: '700', color: C.navy,
        marginBottom: 12, fontFamily: 'Urbanist_700Bold',
      }}>
        Load Wallet
      </Text>

      <View style={{ gap: 10 }}>
        {(user?.hasMoMo ?? true) && (
          <TouchableOpacity
            onPress={() => onSelect('momo-form')}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 14,
              borderRadius: 18, padding: 16,
              backgroundColor: C.white,
              borderWidth: 1.5, borderColor: C.border,
              ...sd(6, C.navy, 0.05),
            }}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: 'rgba(13,168,112,0.1)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Smartphone size={20} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 13, fontWeight: '700', color: C.navy,
                marginBottom: 2, fontFamily: 'Urbanist_700Bold',
              }}>
                Load Mobile Money Wallet
              </Text>
              <Text style={{
                fontSize: 11, color: C.muted,
                fontFamily: 'Urbanist_500Medium',
              }}>
                {hidden ? 'Balance hidden' : `Balance: GH\u20B5${(user?.momoBalance ?? 0).toFixed(2)}`}
              </Text>
            </View>
            <ChevronRight size={15} color={C.pale} />
          </TouchableOpacity>
        )}

        {(user?.hasETopup ?? true) && (
          <TouchableOpacity
            onPress={() => onSelect('etopup-form')}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 14,
              borderRadius: 18, padding: 16,
              backgroundColor: C.white,
              borderWidth: 1.5, borderColor: C.border,
              ...sd(6, C.navy, 0.05),
            }}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: 'rgba(24,120,206,0.1)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <CreditCard size={20} color={C.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 13, fontWeight: '700', color: C.navy,
                marginBottom: 2, fontFamily: 'Urbanist_700Bold',
              }}>
                Load e Top-Up Wallet
              </Text>
              <Text style={{
                fontSize: 11, color: C.muted,
                fontFamily: 'Urbanist_500Medium',
              }}>
                {hidden ? 'Balance hidden' : `Balance: GH\u20B5${(user?.eTopupBalance ?? 0).toFixed(2)}`}
              </Text>
            </View>
            <ChevronRight size={15} color={C.pale} />
          </TouchableOpacity>
        )}

        {!(user?.hasMoMo ?? true) && !(user?.hasETopup ?? true) && (
          <View style={{
            borderRadius: 18, padding: 24,
            backgroundColor: C.white,
            borderWidth: 1.5, borderColor: C.border,
            alignItems: 'center',
          }}>
            <AlertCircle size={32} color={C.pale} />
            <Text style={{
              fontSize: 13, fontWeight: '600', color: C.muted,
              marginTop: 8, fontFamily: 'Urbanist_600SemiBold',
            }}>
              No wallet products assigned
            </Text>
            <Text style={{
              fontSize: 11, color: C.pale, marginTop: 4,
              fontFamily: 'Urbanist_400Regular',
            }}>
              Contact support to enable wallet top-up
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   WALLET FORM  (shared — isMoMo flag switches layout)
══════════════════════════════════════════════════════════════════════════════ */
function WalletForm({
  isMoMo, onBack, onSubmit,
}: {
  isMoMo: boolean;
  onBack: () => void;
  onSubmit: (d: WFState) => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState<WFState>({
    product: isMoMo ? 'mtn-momo' : '',
    accountId: user?.accountId ?? '',
    amount: '',
    phoneNumber: '',
    referenceId: genRef(),
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [touched, setTouch] = useState<Record<string, boolean>>({});

  const showPhone = form.product === 'mtn-momo' || isMoMo;

  const set = (k: keyof WFState, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (touched[k]) setErrs(p => ({ ...p, [k]: '' }));
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!isMoMo && !form.product)
      e.product = 'Select a product';
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0)
      e.amount = 'Enter a valid amount';
    if (showPhone && !form.phoneNumber.trim())
      e.phoneNumber = 'Phone number is required';
    if (showPhone && form.phoneNumber &&
      !/^(0[0-9]{9})$/.test(form.phoneNumber.replace(/\s/g, '')))
      e.phoneNumber = 'Enter a valid Ghana number (0XXXXXXXXX)';
    return e;
  };

  const submit = () => {
    setTouch({ product: true, amount: true, phoneNumber: true });
    const ev = validate();
    setErrs(ev);
    if (!Object.keys(ev).length) onSubmit(form);
  };

  const btnGrad: readonly [string, string] = isMoMo
    ? ['#12C47E', '#0A9260']
    : [C.gradientStart, C.blue];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* ── Info banner ──────────────────────────────────────────────────────── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
          padding: 14,
          borderRadius: 14,
          marginBottom: 18,
          backgroundColor: 'rgba(24,120,206,0.06)',
          borderWidth: 1.5,
          borderColor: 'rgba(24,120,206,0.15)',
        }}>
          <View style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            backgroundColor: 'rgba(24,120,206,0.12)',
            alignItems: 'center', justifyContent: 'center',
            marginTop: 1,
          }}>
            <AlertCircle size={14} color={C.blue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 11, fontWeight: '700', color: C.blue,
              marginBottom: 3, fontFamily: 'Urbanist_700Bold',
            }}>
              Load Wallet
            </Text>
            <Text style={{
              fontSize: 11, color: C.mid, lineHeight: 17,
              fontWeight: '500', fontFamily: 'Urbanist_500Medium',
            }}>
              Load Wallet allows you to add funds to your account.
              The funds you load here will be used for airtime and data bundle.
            </Text>
          </View>
        </View>

        {isMoMo && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            padding: 12, borderRadius: 14, marginBottom: 18,
            backgroundColor: 'rgba(233,145,10,0.07)',
            borderWidth: 1.5, borderColor: 'rgba(233,145,10,0.2)',
          }}>
            <View style={{
              width: 32, height: 32, borderRadius: 9,
              backgroundColor: C.orange,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: 9, fontWeight: '900', color: '#fff',
                fontFamily: 'Urbanist_900Black',
              }}>
                MTN
              </Text>
            </View>
            <View>
              <Text style={{
                fontSize: 13, fontWeight: '700', color: C.navy,
                fontFamily: 'Urbanist_700Bold',
              }}>
                MTN Mobile Money (MoMo)
              </Text>
              <Text style={{
                fontSize: 10, color: C.muted,
                fontFamily: 'Urbanist_400Regular',
              }}>
                Ghana
              </Text>
            </View>
          </View>
        )}

        {!isMoMo && (
          <Field
            label="Product"
            required
            error={touched.product ? errs.product : ''}
          >
            <SelectSheet
              value={form.product}
              onChange={v => {
                set('product', v);
                setTouch(p => ({ ...p, product: true }));
                if (v !== 'mtn-momo') set('phoneNumber', '');
              }}
              options={[
                { value: 'momo-wallet', label: 'Mobile Money Wallet' },
                { value: 'mtn-momo', label: 'MTN Mobile Money (MoMo)' },
              ]}
              placeholder="Select product\u2026"
              error={!!(touched.product && errs.product)}
            />
          </Field>
        )}

        <Field label="Account ID">
          <SInput
            value={form.accountId}
            disabled
            icon={<User size={14} color={C.pale} />}
          />
        </Field>

        <Field
          label="Amount"
          required
          error={touched.amount ? errs.amount : ''}
        >
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            borderRadius: 12, borderWidth: 1.5,
            borderColor: touched.amount && errs.amount ? C.red : C.border,
            backgroundColor: C.white,
            paddingHorizontal: 12,
          }}>
            <Text style={{
              fontSize: 13, fontWeight: '700', color: C.muted,
              fontFamily: 'Urbanist_700Bold', marginRight: 4,
            }}>
              GH\u20B5
            </Text>
            <TextInput
              value={form.amount}
              onChangeText={v => set('amount', v)}
              onBlur={() => setTouch(p => ({ ...p, amount: true }))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={C.pale}
              style={{
                flex: 1, fontSize: 13, fontWeight: '600',
                color: C.navy, fontFamily: 'Urbanist_600SemiBold',
                paddingVertical: 11, padding: 0,
              }}
            />
          </View>
        </Field>

        {showPhone && (
          <Field
            label="Phone Number"
            required
            error={touched.phoneNumber ? errs.phoneNumber : ''}
          >
            <SInput
              value={form.phoneNumber}
              onChangeText={v => set('phoneNumber', v)}
              onBlur={() => setTouch(p => ({ ...p, phoneNumber: true }))}
              keyboardType="phone-pad"
              placeholder="e.g. 0244123456"
              icon={
                <Phone
                  size={14}
                  color={touched.phoneNumber && errs.phoneNumber ? C.red : C.pale}
                />
              }
              error={!!(touched.phoneNumber && errs.phoneNumber)}
            />
          </Field>
        )}

        <Field label="Reference ID">
          <SInput
            value={form.referenceId}
            disabled
            icon={<Hash size={14} color={C.pale} />}
            rightEl={
              <TouchableOpacity
                onPress={() => set('referenceId', genRef())}
                style={{
                  backgroundColor: 'rgba(24,120,206,0.07)',
                  borderRadius: 7, padding: 5,
                }}
              >
                <RefreshCw size={12} color={C.blue} />
              </TouchableOpacity>
            }
          />
          <Text style={{
            fontSize: 9, color: C.pale, marginTop: 3,
            fontFamily: 'Urbanist_400Regular',
          }}>
            {form.referenceId.length}/255 chars
          </Text>
        </Field>

        <TouchableOpacity
          onPress={submit}
          activeOpacity={0.85}
          style={{ marginTop: 8 }}
        >
          <LinearGradient
            colors={btnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 14, paddingVertical: 14,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{
              fontSize: 15, fontWeight: '800', color: '#fff',
              fontFamily: 'Urbanist_800ExtraBold',
            }}>
              Load
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CONFIRM SCREEN
══════════════════════════════════════════════════════════════════════════════ */
function WalletConfirm({
  formData, walletType, onConfirm, onCancel, loading,
}: {
  formData: WFState;
  walletType: WalletView;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const productLabel =
    formData.product === 'mtn-momo' ? 'MTN Mobile Money (MoMo)' :
      formData.product === 'momo-wallet' ? 'Mobile Money Wallet' : '\u2014';

  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: 'Wallet', value: walletType === 'etopup-form' ? 'e Top-Up Wallet' : 'Mobile Money Wallet' },
    { label: 'Product', value: productLabel },
    { label: 'Account ID', value: formData.accountId },
    { label: 'Amount', value: `GH\u20B5${Number(formData.amount).toFixed(2)}` },
    ...(formData.phoneNumber ? [{ label: 'Phone', value: formData.phoneNumber }] : []),
    { label: 'Reference', value: formData.referenceId, mono: true },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <View style={{
        borderRadius: 18, overflow: 'hidden',
        backgroundColor: C.white,
        borderWidth: 1, borderColor: C.border,
        marginBottom: 16, ...sd(6, C.navy, 0.04),
      }}>
        <View style={{
          padding: 14,
          borderBottomWidth: 1, borderBottomColor: C.divider,
        }}>
          <Text style={{
            fontSize: 10, fontWeight: '700', color: C.muted,
            textTransform: 'uppercase', letterSpacing: 0.8,
            fontFamily: 'Urbanist_700Bold',
          }}>
            Transaction Summary
          </Text>
        </View>
        {rows.map((r, i) => (
          <View
            key={r.label}
            style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'flex-start', padding: 12,
              borderBottomWidth: i < rows.length - 1 ? 1 : 0,
              borderBottomColor: C.divider,
            }}
          >
            <Text style={{ fontSize: 11, color: C.muted, fontFamily: 'Urbanist_500Medium' }}>
              {r.label}
            </Text>
            <Text style={{
              fontSize: r.mono ? 10 : 11, fontWeight: '700', color: C.navy,
              fontFamily: r.mono ? undefined : 'Urbanist_700Bold',
              maxWidth: '58%', textAlign: 'right',
            }}>
              {r.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={{
        borderRadius: 16, padding: 16, marginBottom: 24,
        backgroundColor: 'rgba(24,120,206,0.06)',
        borderWidth: 1.5, borderColor: 'rgba(24,120,206,0.14)',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontFamily: 'Urbanist_500Medium' }}>
          You are loading
        </Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: C.blue, fontFamily: 'Urbanist_800ExtraBold' }}>
          GH\u20B5{Number(formData.amount).toFixed(2)}
        </Text>
        <Text style={{ fontSize: 11, color: C.muted, marginTop: 2, fontFamily: 'Urbanist_500Medium' }}>
          into your wallet
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={onCancel}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            flex: 1, paddingVertical: 13, borderRadius: 14,
            borderWidth: 2, borderColor: C.border,
            alignItems: 'center', justifyContent: 'center',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.mid, fontFamily: 'Urbanist_700Bold' }}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onConfirm}
          disabled={loading}
          activeOpacity={0.85}
          style={{ flex: 2 }}
        >
          <LinearGradient
            colors={loading ? [C.pale, C.pale] : [C.gradientStart, C.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 14, paddingVertical: 13,
              alignItems: 'center', justifyContent: 'center',
              flexDirection: 'row', gap: 8,
            }}
          >
            {loading && <ActivityIndicator size="small" color="#fff" />}
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff', fontFamily: 'Urbanist_800ExtraBold' }}>
              {loading ? 'Processing\u2026' : 'Confirm'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SUCCESS SCREEN
══════════════════════════════════════════════════════════════════════════════ */
function WalletSuccess({
  amount, reference, onDone,
}: {
  amount: string;
  reference: string;
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
        <View style={{
          width: 90, height: 90, borderRadius: 45,
          backgroundColor: 'rgba(13,168,112,0.1)',
          borderWidth: 3, borderColor: C.green,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle2 size={44} color={C.green} />
        </View>
      </Animated.View>

      <Animated.Text style={{
        fontSize: 20, fontWeight: '800', color: C.navy,
        marginBottom: 6, fontFamily: 'Urbanist_800ExtraBold',
        opacity: fade, transform: [{ translateY: slideY }],
      }}>
        Wallet Loaded!
      </Animated.Text>

      <Animated.Text style={{
        fontSize: 25, fontWeight: '800', color: C.green,
        marginBottom: 6, fontFamily: 'Urbanist_800ExtraBold',
        opacity: fade,
      }}>
        {amount}
      </Animated.Text>

      <Animated.Text style={{
        fontSize: 13, color: C.muted, marginBottom: 28,
        textAlign: 'center', lineHeight: 20,
        fontFamily: 'Urbanist_500Medium',
        opacity: fade, transform: [{ translateY: slideY }],
      }}>
        Transaction completed successfully.
      </Animated.Text>

      <Animated.View style={{
        borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18,
        backgroundColor: 'rgba(13,168,112,0.07)',
        borderWidth: 1, borderColor: 'rgba(13,168,112,0.2)',
        marginBottom: 32, opacity: fade,
      }}>
        <Text style={{ fontSize: 9, color: C.muted, marginBottom: 2, fontFamily: 'Urbanist_500Medium' }}>
          Reference
        </Text>
        <Text style={{ fontSize: 10, fontWeight: '700', color: C.navy }}>
          {reference}
        </Text>
      </Animated.View>

      <Animated.View style={{ width: '100%', opacity: fade, transform: [{ translateY: slideY }] }}>
        <TouchableOpacity onPress={onDone} activeOpacity={0.85}>
          <LinearGradient
            colors={[C.gradientStart, C.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff', fontFamily: 'Urbanist_800ExtraBold' }}>
              Done
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   WALLET SCREEN  (main export — manages sub-navigation)
══════════════════════════════════════════════════════════════════════════════ */
export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<WalletView>('home');
  const [from, setFrom] = useState<WalletView>('etopup-form');
  const [formData, setFormData] = useState<WFState | null>(null);
  const [loading, setLoading] = useState(false);

  const titles: Record<WalletView, string> = {
    home: 'Wallet',
    'etopup-form': 'Load e Top-Up Wallet',
    'momo-form': 'Load Mobile Money',
    confirm: 'Confirm Transaction',
    success: 'Success',
  };
  const backTo: Record<WalletView, WalletView> = {
    home: 'home', 'etopup-form': 'home',
    'momo-form': 'home', confirm: from, success: 'home',
  };
  const headerColors: Record<WalletView, readonly [string, string, string]> = {
    home: [C.gradientStart, C.blue, C.gradientEnd],
    'etopup-form': [C.gradientStart, C.blue, C.gradientEnd],
    'momo-form': ['#12C47E', '#0A9260', '#065C3D'],
    confirm: [C.gradientStart, C.blue, C.gradientEnd],
    success: [C.gradientStart, C.blue, C.gradientEnd],
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setView('success'); }, 1800);
  };
  const reset = () => { setView('home'); setFormData(null); };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      {view !== 'success' && (
        <GradHdr
          title={titles[view]}
          onBack={view !== 'home' ? () => setView(backTo[view]) : undefined}
          colors={headerColors[view]}
        />
      )}

      {view === 'home' && <WalletHome onSelect={setView} />}

      {(view === 'etopup-form' || view === 'momo-form') && (
        <WalletForm
          key={view}
          isMoMo={view === 'momo-form'}
          onBack={() => setView('home')}
          onSubmit={d => { setFormData(d); setFrom(view); setView('confirm'); }}
        />
      )}

      {view === 'confirm' && formData && (
        <WalletConfirm
          formData={formData}
          walletType={from}
          onConfirm={handleConfirm}
          onCancel={() => setView(from)}
          loading={loading}
        />
      )}

      {view === 'success' && formData && (
        <WalletSuccess
          amount={`GH\u20B5${Number(formData.amount).toFixed(2)}`}
          reference={formData.referenceId}
          onDone={reset}
        />
      )}
    </View>
  );
}
