import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity, Text, TextInput, View, StyleSheet,
  ActivityIndicator, TextInputProps, ViewStyle, TextStyle,
} from 'react-native';
import { C, goldBtnStyle, goldBtnText, cardStyle } from '@/theme/colors';

// ── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps {
  label:      string;
  onPress:    () => void;
  loading?:   boolean;
  disabled?:  boolean;
  variant?:   'gold' | 'outline' | 'ghost' | 'danger';
  style?:     ViewStyle;
}

export function Button({ label, onPress, loading, disabled, variant = 'gold', style }: ButtonProps) {
  const base: ViewStyle = {
    borderRadius: 50, paddingVertical: 13, paddingHorizontal: 24,
    alignItems: 'center', opacity: disabled || loading ? 0.55 : 1,
  };

  const variantStyle: Record<string, ViewStyle> = {
    gold:    { backgroundColor: C.gold2 },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.border },
    ghost:   { backgroundColor: 'transparent' },
    danger:  { backgroundColor: 'rgba(255,107,107,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  };
  const labelStyle: Record<string, TextStyle> = {
    gold:    { color: C.navy,    fontWeight: '700', fontSize: 13 },
    outline: { color: C.gold3,   fontWeight: '600', fontSize: 13 },
    ghost:   { color: C.muted,   fontWeight: '600', fontSize: 13 },
    danger:  { color: C.err,     fontWeight: '700', fontSize: 13 },
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled || loading} style={[base, variantStyle[variant], style]}>
      {loading
        ? <ActivityIndicator color={variant === 'gold' ? C.navy : C.gold2} size="small" />
        : <Text style={labelStyle[variant]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────

interface InputProps extends TextInputProps {
  label?:   string;
  error?:   string;
  style?:   ViewStyle;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && <Text style={s.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={C.faint}
        {...props}
        style={[s.input, error ? { borderColor: C.err } : {}, props.style]}
      />
      {error && <Text style={s.errText}>{error}</Text>}
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[cardStyle, style]}>{children}</View>;
}

// ── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps { label: string; color?: string; bg?: string; }
export function Badge({ label, color = C.gold3, bg = 'rgba(212,160,23,0.1)' }: BadgeProps) {
  return (
    <View style={{ backgroundColor: bg, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

export function SectionTitle({ children }: { children: string }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

// ── Toast hook ────────────────────────────────────────────────────────────────

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useCallback((text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 3000);
  }, []);
  return { toast, toastMsg: msg };
}

export function ToastBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={s.toast} pointerEvents="none">
      <Text style={s.toastText}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  label:        { color: C.muted, fontSize: 11, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  input:        { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.bf, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: C.offwhite, fontSize: 13 },
  errText:      { color: C.err, fontSize: 11, marginTop: 4 },
  sectionTitle: { color: C.gold3, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  toast:        { position: 'absolute', bottom: 40, left: 24, right: 24, backgroundColor: C.cardBg, borderRadius: 50, paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderColor: C.border, alignItems: 'center', zIndex: 999 },
  toastText:    { color: C.gold3, fontSize: 13, fontWeight: '600' },
});
