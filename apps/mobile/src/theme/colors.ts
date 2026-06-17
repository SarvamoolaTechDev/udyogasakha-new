export const C = {
  deep:     '#030917',
  navy:     '#0D1E5A',
  card:     'rgba(13,30,90,0.85)',
  cardBg:   '#0A1540',
  gold:     '#F5D07A',
  gold2:    '#D4A017',
  gold3:    '#C8912B',
  goldGlow: 'rgba(212,160,23,0.35)',
  muted:    '#8896B3',
  faint:    '#4A5580',
  offwhite: '#E8EDF5',
  white:    '#FFFFFF',
  border:   'rgba(212,160,23,0.18)',
  bf:       'rgba(255,255,255,0.07)',
  err:      '#FF6B6B',
  ok:       '#4ADE80',
  warn:     '#F59E0B',
  info:     '#60A5FA',
} as const;

export const FONT = {
  heading: 'serif',   // Cinzel not bundled by default — falls back to system serif
  body:    'System',
} as const;

/** Reusable card style */
export const cardStyle = {
  backgroundColor: C.cardBg,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: C.border,
  padding: 16,
} as const;

/** Gold gradient simulation for RN (LinearGradient if added, otherwise flat gold) */
export const goldBtnStyle = {
  backgroundColor: C.gold2,
  borderRadius: 50,
  paddingVertical: 13,
  paddingHorizontal: 24,
  alignItems: 'center' as const,
};

export const goldBtnText = {
  color: C.navy,
  fontWeight: '700' as const,
  fontSize: 13,
  letterSpacing: 0.5,
};
