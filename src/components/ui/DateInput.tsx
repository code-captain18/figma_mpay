import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { C, F } from '@/theme';

interface DateInputProps {
  value: string; // 'MM/DD/YYYY' or ''
  onChange: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

function parseValue(v: string): Date {
  if (!v) return new Date();
  const [m, d, y] = v.split('/').map(Number);
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? new Date() : date;
}

function formatDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${m}/${day}/${d.getFullYear()}`;
}

export function DateInput({ value, onChange, placeholder = 'MM/DD/YYYY', style }: DateInputProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (_e: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (date) onChange(formatDate(date));
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={[{
          flexDirection: 'row',
          alignItems: 'center',
          height: 42,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: C.border,
          backgroundColor: C.white,
          paddingHorizontal: 12,
          gap: 8,
        }, style]}
      >
        <Text style={{
          flex: 1,
          fontSize: 13,
          fontFamily: F.regular,
          color: value ? C.navy : C.pale,
        }}>
          {value || placeholder}
        </Text>
        <Calendar size={14} color={C.pale} />
      </TouchableOpacity>

      {open && (
        <DateTimePicker
          mode="date"
          value={parseValue(value)}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );
}
