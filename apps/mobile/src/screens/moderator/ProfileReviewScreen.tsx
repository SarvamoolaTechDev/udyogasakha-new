import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { C, cardStyle } from '@/theme/colors';
import { Button, Badge, SectionTitle } from '@/components/UI';

const ROLE_ICONS: Record<string,string> = {
  INTERN:'🎓', FRESHER:'🌱', JOB_SEEKER:'🔍', FREELANCER:'💻', CONSULTANT:'🧑‍💼',
  HIRING_MANAGER:'📊', RECRUITER:'🤝', TRAINER:'📚', VENDOR:'🏭', MODERATOR_ROLE:'🛡️', RFP_PROVIDER:'📋',
};

export function ProfileReviewScreen({ route, navigation }: any) {
  const { profile: p } = route.params;
  const qc = useQueryClient();
  const inv = () => { qc.invalidateQueries({ queryKey:['m-mod'] }); navigation.goBack(); };

  const appMut = useMutation({ mutationFn:()=>profilesApi.approve(p.id), onSuccess:inv });
  const rejMut = useMutation({ mutationFn:(r:string)=>profilesApi.reject(p.id,r), onSuccess:inv });

  const handleReject = () => {
    Alert.prompt('Reject Profile', 'Please enter a reason for rejection:', [
      { text:'Cancel', style:'cancel' },
      { text:'Reject', style:'destructive', onPress:(r)=>{ if(r?.trim()) rejMut.mutate(r.trim()); } },
    ]);
  };

  const rows = [
    ['Applied For',    p.appliedFor],
    ['Applied At',     p.appliedAt],
    ['Payment',        p.payment],
    ['Certificate',    p.certificate],
    ['Mode of Work',   p.workMode?.replace(/_/g,' ')],
    ['Employment',     p.employmentOption?.replace(/_/g,' ')],
    ['Market Segment', p.marketSegment?.replace(/_/g,' ')  + ' (candidate selected)'],
    ['Market Field',   p.marketField?.replace(/_/g,' ')    + ' (auto-derived)'],
    ['Skills',         (p.skills||[]).join(', ') || '—'],
    ['City',           p.city || '—'],
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[cardStyle, s.heroCard]}>
          <View style={s.heroRow}>
            <View style={s.avatarBox}>
              <Text style={{ fontSize:32 }}>{ROLE_ICONS[p.roleType]||'💼'}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={s.name}>{p.fullName}</Text>
              <Text style={s.roleLabel}>{p.roleType?.replace(/_/g,' ')}</Text>
              <Text style={s.submittedAt}>Submitted: {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' }) : '—'}</Text>
            </View>
          </View>
          {p.summary && <Text style={s.summary}>{p.summary}</Text>}
        </View>

        {/* Submission details */}
        <View style={cardStyle}>
          <SectionTitle>⬛ Submission Details</SectionTitle>
          {rows.map(([l,v]) => (
            <View key={String(l)} style={s.detailRow}>
              <Text style={s.detailLabel}>{l}</Text>
              <Text style={s.detailValue}>{v||'—'}</Text>
            </View>
          ))}
        </View>

        {/* Experience */}
        {p.experiences?.length > 0 && (
          <View style={cardStyle}>
            <SectionTitle>Experience</SectionTitle>
            {p.experiences.map((e:any) => (
              <View key={e.id} style={s.expCard}>
                <Text style={s.expTitle}>{e.title}</Text>
                <Text style={s.expCompany}>{e.company}</Text>
                {e.description && <Text style={s.expDesc}>{e.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Actions — only for pending */}
        {p.status === 'PENDING' && (
          <View style={s.actionRow}>
            <Button
              label={appMut.isPending ? 'Approving…' : '✅ Approve'}
              onPress={() => appMut.mutate()}
              loading={appMut.isPending}
              style={{ flex:1 }}
            />
            <Button
              label="❌ Reject"
              variant="danger"
              onPress={handleReject}
              disabled={rejMut.isPending}
              style={{ flex:1 }}
            />
          </View>
        )}

        {p.status === 'REJECTED' && (
          <View style={[cardStyle, s.rejBanner]}>
            <Text style={{ color:C.err, fontWeight:'700', marginBottom:4 }}>Rejection Reason</Text>
            <Text style={{ color:C.muted, fontSize:13 }}>{p.rejectionReason}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:C.deep },
  scroll:     { padding:16, gap:12, paddingBottom:40 },
  heroCard:   { },
  heroRow:    { flexDirection:'row', alignItems:'flex-start', gap:14, marginBottom:12 },
  avatarBox:  { width:60, height:60, borderRadius:30, backgroundColor:'rgba(29,62,160,0.4)', borderWidth:2, borderColor:C.border, alignItems:'center', justifyContent:'center' },
  name:       { fontSize:18, fontWeight:'700', color:C.white, marginBottom:2 },
  roleLabel:  { fontSize:12, color:C.gold3, marginBottom:2 },
  submittedAt:{ fontSize:11, color:C.muted },
  summary:    { fontSize:13, color:C.offwhite, lineHeight:20, paddingTop:12, borderTopWidth:1, borderTopColor:C.bf },
  detailRow:  { flexDirection:'row', justifyContent:'space-between', paddingVertical:9, borderBottomWidth:1, borderBottomColor:C.bf },
  detailLabel:{ fontSize:11, color:C.muted, flex:1 },
  detailValue:{ fontSize:11, color:C.offwhite, fontWeight:'500', flex:1.5, textAlign:'right' },
  expCard:    { paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.bf },
  expTitle:   { fontSize:13, fontWeight:'700', color:C.white, marginBottom:2 },
  expCompany: { fontSize:11, color:C.gold3, marginBottom:4 },
  expDesc:    { fontSize:11, color:C.muted, lineHeight:17 },
  actionRow:  { flexDirection:'row', gap:10 },
  rejBanner:  { borderColor:'rgba(255,107,107,0.3)' },
});
