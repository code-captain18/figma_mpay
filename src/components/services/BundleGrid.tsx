import { Colors } from '@/theme';
import type { SvcBundle } from '@/types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BundleGridProps {
  bundles: SvcBundle[];
  selected: string | null;
  accent?: string;
  onSelect: (bundle: SvcBundle) => void;
}

export function BundleGrid({ bundles, selected, accent = Colors.primary, onSelect }: BundleGridProps) {
  return (
    <View style={styles.grid}>
      {bundles.map(b => {
        const active = selected === b.id;
        return (
          <TouchableOpacity
            key={b.id}
            onPress={() => onSelect(b)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${b.label} – GHS ${b.price.toFixed(2)}`}
            style={[
              styles.card,
              active && { borderColor: accent, backgroundColor: accent + '12' },
            ]}
          >
            {b.tag && (
              <View style={[styles.tag, { backgroundColor: accent }]}>
                <Text style={styles.tagText}>{b.tag}</Text>
              </View>
            )}
            <Text style={[styles.label, active && { color: accent }]}>{b.label}</Text>
            <Text style={[styles.price, active && { color: accent }]}>
              {b.priceLabel ?? `GHS ${b.price.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  card: {
    width: '47.8%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  tag: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Urbanist_700Bold',
    color: '#fff',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 4,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontFamily: 'Urbanist_800ExtraBold',
    color: Colors.textPrimary,
  },
});
