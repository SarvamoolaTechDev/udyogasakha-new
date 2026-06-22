import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { C } from '@/theme/colors';

export interface PickerOption { label: string; value: string; group?: string; }

interface PickerFieldProps {
  label:     string;
  value:     string;
  options:   PickerOption[];
  onChange:  (value: string) => void;
  placeholder?: string;
}

/**
 * Native replacement for HTML <select>.
 * Tapping the field opens a full-screen modal with a scrollable list.
 * Supports grouped options (renders group headers) for the 15-segment market picker.
 */
export function PickerField({ label, value, options, onChange, placeholder = 'Select…' }: PickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  // Build a flat list with group header markers interspersed
  const rows: ({ type: 'header'; label: string } | { type: 'option'; opt: PickerOption })[] = [];
  let lastGroup: string | undefined;
  options.forEach(opt => {
    if (opt.group && opt.group !== lastGroup) {
      rows.push({ type: 'header', label: opt.group });
      lastGroup = opt.group;
    }
    rows.push({ type: 'option', opt });
  });

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={s.field} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={selected ? s.fieldText : s.placeholder}>{selected ? selected.label : placeholder}</Text>
        <Text style={s.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.sheet} onStartShouldSetResponder={() => true}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
            </View>
            <FlatList
              data={rows}
              keyExtractor={(item, i) => (item.type === 'header' ? `h-${item.label}` : item.opt.value) + i}
              renderItem={({ item }) =>
                item.type === 'header' ? (
                  <Text style={s.groupHeader}>{item.label}</Text>
                ) : (
                  <TouchableOpacity
                    style={[s.option, item.opt.value === value && s.optionOn]}
                    onPress={() => { onChange(item.opt.value); setOpen(false); }}
                  >
                    <Text style={[s.optionText, item.opt.value === value && s.optionTextOn]}>{item.opt.label}</Text>
                    {item.opt.value === value && <Text style={s.check}>✓</Text>}
                  </TouchableOpacity>
                )
              }
              style={{ maxHeight: 420 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  label:       { color: C.muted, fontSize: 11, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  field:       { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.bf, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldText:   { color: C.offwhite, fontSize: 13 },
  placeholder: { color: C.faint, fontSize: 13 },
  chevron:     { color: C.muted, fontSize: 12 },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: C.cardBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: C.border, paddingBottom: 24, maxHeight: '70%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: C.bf },
  sheetTitle:  { color: C.white, fontSize: 14, fontWeight: '700' },
  closeBtn:    { color: C.muted, fontSize: 16 },
  groupHeader: { color: C.gold3, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 },
  option:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 13 },
  optionOn:    { backgroundColor: 'rgba(212,160,23,0.08)' },
  optionText:  { color: C.offwhite, fontSize: 13 },
  optionTextOn:{ color: C.gold2, fontWeight: '600' },
  check:       { color: C.gold2, fontSize: 14, fontWeight: '700' },
});
