import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, cardStyle } from '@/theme/colors';

const EXP: Record<string, string> = { ANY:'Any', FRESHER_0_1:'0–1 yr', EXP_1_3:'1–3 yrs', EXP_3_5:'3–5 yrs', EXP_5_8:'5–8 yrs', EXP_8_PLUS:'8+ yrs' };
const DUR: Record<string, string> = { SHORT_TERM:'1–3 mo', MEDIUM_TERM:'3–6 mo', LONG_TERM:'6+ mo', PERMANENT:'Permanent', PROJECT_BASED:'Project' };

interface JobCardProps {
  job: any;
  onPress: () => void;
}

export function JobCard({ job, onPress }: JobCardProps) {
  const desc = (job.description || '').slice(0, 90);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[cardStyle, s.card]}>
      {/* Header row */}
      <View style={s.headerRow}>
        <View style={s.iconBox}>
          <Text style={{ fontSize: 20 }}>{job.icon || '💼'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.org} numberOfLines={1}>{job.organisationName}</Text>
          <Text style={s.title} numberOfLines={1}>{job.title}</Text>
        </View>
        <Text style={s.date}>{new Date(job.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
      </View>

      {/* Meta */}
      <Text style={s.meta}>📍 {job.location}  ·  ⏱️ {EXP[job.experienceRequired] ?? job.experienceRequired}  ·  📅 {DUR[job.duration] ?? job.duration}</Text>

      {/* Tags */}
      <View style={s.tags}>
        <View style={s.tag}><Text style={s.tagTxt}>{job.workMode?.replace('_', ' ')}</Text></View>
        <View style={[s.tag, job.payment === 'PAID' && s.tagPaid]}><Text style={s.tagTxt}>{job.payment}</Text></View>
        {job.certificateProvided === 'YES' && <View style={s.tagCert}><Text style={s.tagTxt}>📜 Cert</Text></View>}
      </View>

      {/* Description */}
      <Text style={s.desc} numberOfLines={2}>{desc}{desc.length === 90 ? '…' : ''}</Text>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.salary}>{job.salary || 'Competitive'}</Text>
        <View style={s.applyBtn}><Text style={s.applyTxt}>View →</Text></View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:      { marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  iconBox:   { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(212,160,23,0.12)', borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  org:       { fontSize: 10, color: C.muted, marginBottom: 2 },
  title:     { fontSize: 14, fontWeight: '700', color: C.white },
  date:      { fontSize: 10, color: C.faint, flexShrink: 0 },
  meta:      { fontSize: 11, color: C.muted, marginBottom: 10 },
  tags:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag:       { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3 },
  tagPaid:   { backgroundColor: 'rgba(74,222,128,0.1)' },
  tagCert:   { backgroundColor: 'rgba(212,160,23,0.1)', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3 },
  tagTxt:    { fontSize: 10, color: C.offwhite, fontWeight: '600' },
  desc:      { fontSize: 11, color: C.muted, lineHeight: 17, marginBottom: 12 },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(212,160,23,0.08)' },
  salary:    { fontSize: 13, fontWeight: '700', color: C.gold2 },
  applyBtn:  { backgroundColor: C.gold2, borderRadius: 50, paddingHorizontal: 14, paddingVertical: 6 },
  applyTxt:  { fontSize: 11, fontWeight: '700', color: C.navy },
});
