import { C } from '@/theme';
import { CheckCircle2, ChevronDown } from 'lucide-react-native';
import { AlertCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const sd = (size: number, color: string, opacity: number) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: size / 2 },
      shadowOpacity: opacity,
      shadowRadius: size,
    },
    android: { elevation: Math.round(size * 0.8) },
  }) ?? {};

export function Field({
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
          <Text style={{ fontSize: 10, color: C.red, fontWeight: '600', fontFamily: 'Urbanist_600SemiBold' }}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

export function SInput({
  icon, disabled, error, rightEl, style: _style, ...props
}: {
  icon?: React.ReactNode;
  disabled?: boolean;
  error?: boolean;
  rightEl?: React.ReactNode;
} & React.ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? C.red : disabled ? C.divider : focused ? C.blue : C.border;

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
          paddingVertical: 11, padding: 0, margin: 0,
        }}
      />
      {rightEl && <View style={{ marginLeft: 8 }}>{rightEl}</View>}
    </View>
  );
}

export function SelectSheet({
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
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
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

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(7,24,48,0.5)', justifyContent: 'flex-end' }}
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
                    backgroundColor: opt.value === value ? 'rgba(24,120,206,0.05)' : 'transparent',
                    borderBottomWidth: i < options.length - 1 ? 1 : 0,
                    borderBottomColor: C.divider,
                  }}
                >
                  {opt.value === value ? (
                    <CheckCircle2 size={17} color={C.blue} />
                  ) : (
                    <View style={{ width: 17, height: 17, borderRadius: 9, borderWidth: 1.5, borderColor: C.border }} />
                  )}
                  <Text style={{
                    fontSize: 14,
                    fontWeight: opt.value === value ? '700' : '500',
                    color: opt.value === value ? C.blue : C.navy,
                    fontFamily: opt.value === value ? 'Urbanist_700Bold' : 'Urbanist_500Medium',
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
