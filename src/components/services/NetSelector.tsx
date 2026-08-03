import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NetworkLogo } from '@/components/svg/NetworkLogo';
import { Colors } from '@/theme';
import { NETWORKS } from '@/constants/networks';

interface NetSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
  accent?: string;
}

export function NetSelector({ selected, onSelect, accent = Colors.primary }: NetSelectorProps) {
  return (
    <View style={styles.row}>
      {NETWORKS.map(net => {
        const active = selected === net.id;
        return (
          <TouchableOpacity
            key={net.id}
            onPress={() => onSelect(net.id)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={net.label}
            style={[
              styles.btn,
              active && { borderColor: accent, backgroundColor: accent + '18' },
            ]}
          >
            <NetworkLogo id={net.id} size={32} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  btn: {
    width: 62,
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
