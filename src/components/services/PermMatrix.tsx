import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { C, F } from '@/theme';
import { PERM_SECTIONS } from '@/data';
import type { PermMap, PermKey } from '@/types';

// Short column labels
const COL_LABELS: Record<PermKey, string> = {
  view:    'View',
  create:  'Add',
  approve: 'OK',
  export:  'Exp',
  delete:  'Del',
};

interface PermMatrixProps {
  perms:    PermMap;
  onChange: (perms: PermMap) => void;
}

export function PermMatrix({ perms, onChange }: PermMatrixProps) {
  const toggle = (key: string, col: PermKey) => {
    onChange({
      ...perms,
      [key]: { ...perms[key], [col]: !perms[key]?.[col] },
    });
  };

  return (
    <View style={s.root}>
      {PERM_SECTIONS.map(sec => (
        <View key={sec.key} style={s.section}>
          {/* Section header row */}
          <View style={s.sectionHdr}>
            <Text style={s.sectionKey}>{sec.key.toUpperCase()}</Text>
            <View style={s.colLabelRow}>
              {sec.cols.map(col => (
                <Text key={col} style={s.colLabel}>
                  {COL_LABELS[col]}
                </Text>
              ))}
            </View>
          </View>

          {/* Module rows */}
          {sec.modules.map((mod, mi) => {
            const rowKey = `${sec.key}:${mod}`;
            const row    = perms[rowKey] ?? { view: false, create: false, approve: false, export: false, delete: false };
            return (
              <View
                key={rowKey}
                style={[s.moduleRow, mi < sec.modules.length - 1 && s.moduleRowBorder]}
              >
                <Text style={s.modLabel}>{mod}</Text>
                <View style={s.colLabelRow}>
                  {sec.cols.map(col => {
                    const on = row[col];
                    return (
                      <TouchableOpacity
                        key={col}
                        onPress={() => toggle(rowKey, col)}
                        activeOpacity={0.7}
                        style={[s.cell, on && s.cellOn]}
                      >
                        {on && <View style={s.cellDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_W = 38;

const s = StyleSheet.create({
  root:          { gap: 10 },
  section:       { borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, overflow: 'hidden' },
  sectionHdr:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(24,120,206,0.05)', borderBottomWidth: 1, borderBottomColor: C.divider },
  sectionKey:    { fontSize: 11, fontFamily: F.semibold, color: C.blue, letterSpacing: 0.6 },
  colLabelRow:   { flexDirection: 'row', gap: 4 },
  colLabel:      { width: CELL_W, textAlign: 'center', fontSize: 10, fontFamily: F.semibold, color: C.mid },
  moduleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  moduleRowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
  modLabel:      { fontSize: 11, fontFamily: F.medium, color: C.navy, textTransform: 'capitalize', flex: 1 },
  cell:          { width: CELL_W - 4, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  cellOn:        { borderColor: C.blue, backgroundColor: 'rgba(24,120,206,0.12)' },
  cellDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: C.blue },
});
