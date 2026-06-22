import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { C, cardStyle } from '@/theme/colors';
import { Button, Badge } from '@/components/UI';

const EXP: Record<string,string> = { ANY:'Any', FRESHER_0_1:'0–1 yr', EXP_1_3:'1–3 yrs', EXP_3_5:'3–5 yrs', EXP_5_8:'5–8 yrs', EXP_8_PLUS:'8+ yrs' };
const DUR: Record<string,string> = { SHORT_TERM:'1–3 months', MEDIUM_TERM:'3–6 months', LONG_TERM:'6+ months', PERMANENT:'Permanent', PROJECT_BASED:'Project Based' };

export function JobDetailScreen({ route, navigation }: any) {
  const { jobId, role } = route.params;
  const { data: job, isLoading } = useQuery({ queryKey:['m-job', jobId], queryFn:()=>listingsApi.getById(jobId) });
  const { data: similar = [] } = useQuery({
    queryKey: ['m-job-similar', jobId, (job as any)?.targetRoleType],
    queryFn:  () => listingsApi.getSimilar(jobId, (job as any).targetRoleType),
    enabled:  !!job,
  });

  if (isLoading) return <View style={s.center}><ActivityIndicator color={C.gold2} size="large" /></View>;
  if (!job)      return <View style={s.center}><Text style={{ color:C.muted }}>Listing not found.</Text></View>;

  const j = job as any;
  const skills     = Array.isArray(j.skills)     ? j.skills     : (j.skills||'').split(',');
  const facilities = Array.isArray(j.facilities) ? j.facilities : (j.facilities||'').split(',');

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header card */}
        <View style={cardStyle}>
          <View style={s.iconRow}>
            <View style={s.iconBox}><Text style={{ fontSize:26 }}>{j.icon||'💼'}</Text></View>
            <View style={{ flex:1 }}>
              <Text style={s.org}>{j.organisationName}</Text>
              <Text style={s.title}>{j.title}</Text>
            </View>
          </View>

          <View style={s.metaRow}>
            {[['📍',j.location],['⏱️',EXP[j.experienceRequired]],['📅',DUR[j.duration]],['🏠',j.workMode?.replace('_',' ')]].map(([icon,val])=>(
              <View key={String(icon)} style={s.metaChip}>
                <Text style={s.metaText}>{icon} {val}</Text>
              </View>
            ))}
          </View>

          <View style={s.tags}>
            <Badge label={j.workMode?.replace('_',' ')} />
            <Badge label={j.payment} bg="rgba(74,222,128,0.1)" color={C.ok} />
            {j.certificateProvided==='YES' && <Badge label="📜 Certificate" />}
            {j.employmentOption==='EXISTS'  && <Badge label="➡️ Post-Employment" />}
          </View>

          <Text style={s.salary}>{j.salary || 'Competitive'}</Text>
        </View>

        {/* Description */}
        <View style={[cardStyle, s.section]}>
          <Text style={s.sHead}>About the Role</Text>
          <Text style={s.body}>{j.description}</Text>
        </View>

        {/* Skills */}
        {skills.filter((sk:string)=>sk.trim()).length > 0 && (
          <View style={[cardStyle, s.section]}>
            <Text style={s.sHead}>Skills Required</Text>
            <View style={s.tags}>
              {skills.filter((sk:string)=>sk.trim()).map((sk:string)=>(
                <View key={sk} style={s.skillChip}><Text style={s.skillTxt}>{sk.trim()}</Text></View>
              ))}
            </View>
          </View>
        )}

        {/* Responsibilities */}
        {j.responsibilities?.length > 0 && (
          <View style={[cardStyle, s.section]}>
            <Text style={s.sHead}>Key Responsibilities</Text>
            {j.responsibilities.map((r:string, i:number)=>(
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>✦</Text>
                <Text style={s.bulletTxt}>{r}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Requirements */}
        {j.requirements?.length > 0 && (
          <View style={[cardStyle, s.section]}>
            <Text style={s.sHead}>Requirements & Qualifications</Text>
            {j.requirements.map((r:string, i:number)=>(
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>✦</Text>
                <Text style={s.bulletTxt}>{r}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Facilities */}
        {facilities.filter((f:string)=>f.trim()).length > 0 && (
          <View style={[cardStyle, s.section]}>
            <Text style={s.sHead}>Facilities & Benefits</Text>
            <View style={s.tags}>
              {facilities.filter((f:string)=>f.trim()).map((f:string)=>(
                <View key={f} style={s.facilityChip}><Text style={s.skillTxt}>🎁 {f.trim()}</Text></View>
              ))}
            </View>
          </View>
        )}

        {/* Apply */}
        <Button label={`Apply as ${j.targetRoleType?.replace(/_/g,' ')} →`}
          onPress={() => navigation.navigate('ProfileTab', { screen:'ProfileHub' })}
          style={s.applyBtn} />

        {/* Similar jobs */}
        {similar.length > 0 && (
          <View style={s.section}>
            <Text style={s.similarHead}>Similar Listings</Text>
            {(similar as any[]).map(sj => (
              <TouchableOpacity key={sj.id} style={[cardStyle, s.similarCard]}
                onPress={() => navigation.push('JobDetail', { jobId: sj.id, role: sj.targetRoleType })}>
                <Text style={s.similarTitle}>{sj.title}</Text>
                <Text style={s.similarOrg}>{sj.organisationName} · {sj.workMode?.replace('_',' ')}</Text>
                <Text style={s.similarSalary}>{sj.salary || 'Competitive'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex:1, backgroundColor:C.deep },
  scroll:    { padding:16, gap:12, paddingBottom:40 },
  center:    { flex:1, alignItems:'center', justifyContent:'center' },
  iconRow:   { flexDirection:'row', gap:12, alignItems:'flex-start', marginBottom:12 },
  iconBox:   { width:48, height:48, borderRadius:12, backgroundColor:'rgba(212,160,23,0.1)', borderWidth:1, borderColor:C.border, alignItems:'center', justifyContent:'center' },
  org:       { fontSize:11, color:C.muted, marginBottom:2 },
  title:     { fontSize:17, fontWeight:'700', color:C.white },
  metaRow:   { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:12 },
  metaChip:  { backgroundColor:'rgba(255,255,255,0.06)', borderRadius:50, paddingHorizontal:12, paddingVertical:5 },
  metaText:  { fontSize:11, color:C.muted },
  tags:      { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:12 },
  salary:    { fontSize:18, fontWeight:'700', color:C.gold2 },
  section:   { marginTop:0 },
  sHead:     { fontSize:13, fontWeight:'700', color:C.gold3, marginBottom:10 },
  body:      { fontSize:13, color:C.offwhite, lineHeight:21 },
  skillChip: { backgroundColor:'rgba(255,255,255,0.06)', borderRadius:50, paddingHorizontal:12, paddingVertical:5 },
  facilityChip: { backgroundColor:'rgba(212,160,23,0.08)', borderRadius:50, paddingHorizontal:12, paddingVertical:5 },
  skillTxt:  { fontSize:11, color:C.offwhite },
  bulletRow: { flexDirection:'row', gap:8, marginBottom:8 },
  bullet:    { fontSize:10, color:C.gold2, marginTop:3 },
  bulletTxt: { flex:1, fontSize:13, color:C.offwhite, lineHeight:20 },
  applyBtn:  { marginTop:8 },
  similarHead:  { fontSize:14, fontWeight:'700', color:C.white, marginBottom:10 },
  similarCard:  { marginBottom:10 },
  similarTitle: { fontSize:13, fontWeight:'700', color:C.white, marginBottom:3 },
  similarOrg:   { fontSize:11, color:C.muted, marginBottom:6 },
  similarSalary:{ fontSize:12, fontWeight:'700', color:C.gold2 },
});
