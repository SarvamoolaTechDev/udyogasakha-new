import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { C, cardStyle } from '@/theme/colors';
import { Badge, Button } from '@/components/UI';

const ROLE_ICONS: Record<string,string> = {
  INTERN:'🎓', FRESHER:'🌱', JOB_SEEKER:'🔍', FREELANCER:'💻', CONSULTANT:'🧑‍💼',
  HIRING_MANAGER:'📊', RECRUITER:'🤝', TRAINER:'📚', VENDOR:'🏭', MODERATOR_ROLE:'🛡️', RFP_PROVIDER:'📋',
};
const MF_COLOR: Record<string,string> = { IT_FIELD: C.info, NON_IT_FIELD: C.ok, SERVICES: C.warn };

type Tab = 'pending' | 'approved' | 'rejected';

export function ModerationQueueScreen({ navigation }: any) {
  const [tab,  setTab]  = useState<Tab>('pending');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['m-mod', tab, page],
    queryFn:  () => tab === 'pending' ? profilesApi.getPending({ page, limit:20 })
                  : tab === 'approved' ? profilesApi.getApproved({ page, limit:20 })
                  : profilesApi.getRejected({ page, limit:20 }),
  });

  const profiles: any[] = (query.data as any)?.data      ?? [];
  const total:    number = (query.data as any)?.total     ?? 0;
  const totalPages       = (query.data as any)?.totalPages ?? 1;

  const inv = () => { qc.invalidateQueries({ queryKey:['m-mod'] }); };

  const appMut = useMutation({ mutationFn:(id:string)=>profilesApi.approve(id), onSuccess:inv });
  const rejMut = useMutation({ mutationFn:({id,r}:{id:string;r:string})=>profilesApi.reject(id,r), onSuccess:inv });
  const reactMut = useMutation({ mutationFn:(id:string)=>profilesApi.reactivate(id), onSuccess:inv });

  const handleApprove = (profile: any) => {
    Alert.alert('Approve Profile', `Approve ${profile.fullName}'s ${profile.roleType?.replace(/_/g,' ')} profile?\n\nMarket: ${profile.marketField?.replace(/_/g,' ') ?? 'from candidate selection'}`, [
      { text:'Cancel', style:'cancel' },
      { text:'✅ Approve', onPress:()=>appMut.mutate(profile.id) },
    ]);
  };

  const handleReject = (profile: any) => {
    Alert.prompt('Reject Profile', 'Enter reason for rejection:', [
      { text:'Cancel', style:'cancel' },
      { text:'❌ Reject', style:'destructive', onPress:(r)=>{ if(r?.trim()) rejMut.mutate({ id:profile.id, r:r.trim() }); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Tab strip */}
      <View style={s.tabs}>
        {(['pending','approved','rejected'] as Tab[]).map(t => (
          <TouchableOpacity key={t} onPress={() => { setTab(t); setPage(1); }}
            style={[s.tab, tab===t && s.tabOn]}>
            <Text style={[s.tabTxt, tab===t && s.tabTxtOn]}>
              {t==='pending'?'⏳ Pending':t==='approved'?'✅ Approved':'❌ Rejected'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.countTxt}>{total} profiles</Text>

      {query.isLoading ? (
        <View style={s.center}><ActivityIndicator color={C.gold2} size="large" /></View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item:any) => item.id}
          contentContainerStyle={{ padding:16, gap:12, paddingBottom:40 }}
          refreshing={query.isLoading}
          onRefresh={query.refetch}
          ListEmptyComponent={<View style={s.center}><Text style={{ color:C.muted }}>No profiles here.</Text></View>}
          renderItem={({ item: p }) => (
            <View style={cardStyle}>
              {/* Profile header */}
              <View style={s.profHeader}>
                <Text style={{ fontSize:28 }}>{ROLE_ICONS[p.roleType]||'💼'}</Text>
                <View style={{ flex:1 }}>
                  <Text style={s.profName}>{p.fullName}</Text>
                  <Text style={s.profRole}>{p.roleType?.replace(/_/g,' ')}</Text>
                  <Text style={s.profCity}>📍 {p.city || '—'}</Text>
                </View>
                {/* Market field — set by candidate */}
                {p.marketField && (
                  <Badge label={p.marketField?.replace('_FIELD','').replace('_',' ')} color={MF_COLOR[p.marketField]} bg={MF_COLOR[p.marketField]+'22'} />
                )}
              </View>

              {/* Submission details */}
              <View style={s.details}>
                <Text style={s.detail}>Applied for: <Text style={{ color:C.gold3 }}>{p.appliedFor}</Text></Text>
                <Text style={s.detail}>At: {p.appliedAt}</Text>
                <Text style={s.detail}>Mode: {p.workMode?.replace(/_/g,' ')} · {p.payment} · Cert: {p.certificate}</Text>
                <Text style={s.detail}>Segment: {p.marketSegment?.replace(/_/g,' ')}</Text>
                {p.rejectionReason && <Text style={[s.detail, { color:C.err }]}>Reason: {p.rejectionReason}</Text>}
              </View>

              {/* Action row */}
              <View style={s.actions}>
                <TouchableOpacity onPress={() => navigation.navigate('ProfileReview', { profile: p })} style={s.viewBtn}>
                  <Text style={s.viewBtnTxt}>👁 View Full</Text>
                </TouchableOpacity>

                {tab === 'pending' && (
                  <>
                    <TouchableOpacity onPress={() => handleApprove(p)} style={s.approveBtn}>
                      <Text style={s.approveTxt}>✅ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleReject(p)} style={s.rejectBtn}>
                      <Text style={s.rejectTxt}>❌ Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
                {tab === 'rejected' && (
                  <TouchableOpacity onPress={() => reactMut.mutate(p.id)} style={s.viewBtn}>
                    <Text style={s.viewBtnTxt}>🔄 Re-review</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListFooterComponent={totalPages > 1 ? (
            <View style={s.pagRow}>
              <Button label="← Prev" variant="outline" onPress={()=>setPage(p=>p-1)} disabled={page===1} style={{ flex:1 }} />
              <Text style={{ color:C.muted, fontSize:12, flex:0.6, textAlign:'center' }}>{page}/{totalPages}</Text>
              <Button label="Next →" variant="outline" onPress={()=>setPage(p=>p+1)} disabled={page===totalPages} style={{ flex:1 }} />
            </View>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:C.deep },
  tabs:       { flexDirection:'row', borderBottomWidth:1, borderBottomColor:C.bf },
  tab:        { flex:1, paddingVertical:12, alignItems:'center' },
  tabOn:      { borderBottomWidth:2, borderBottomColor:C.gold2 },
  tabTxt:     { fontSize:11, color:C.muted, fontWeight:'600' },
  tabTxtOn:   { color:C.gold2 },
  countTxt:   { fontSize:11, color:C.muted, paddingHorizontal:16, paddingVertical:8 },
  center:     { flex:1, alignItems:'center', justifyContent:'center', padding:40 },
  profHeader: { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:12 },
  profName:   { fontSize:15, fontWeight:'700', color:C.white },
  profRole:   { fontSize:11, color:C.gold3, marginBottom:2 },
  profCity:   { fontSize:11, color:C.muted },
  details:    { gap:4, marginBottom:12, paddingTop:10, borderTopWidth:1, borderTopColor:C.bf },
  detail:     { fontSize:12, color:C.muted },
  actions:    { flexDirection:'row', gap:8, paddingTop:12, borderTopWidth:1, borderTopColor:C.bf },
  viewBtn:    { flex:1, padding:8, borderRadius:50, borderWidth:1, borderColor:C.bf, alignItems:'center' },
  viewBtnTxt: { fontSize:11, color:C.muted, fontWeight:'600' },
  approveBtn: { flex:1, padding:8, borderRadius:50, backgroundColor:'rgba(74,222,128,0.12)', borderWidth:1, borderColor:'rgba(74,222,128,0.3)', alignItems:'center' },
  approveTxt: { fontSize:11, color:C.ok, fontWeight:'700' },
  rejectBtn:  { flex:1, padding:8, borderRadius:50, backgroundColor:'rgba(255,107,107,0.1)', borderWidth:1, borderColor:'rgba(255,107,107,0.3)', alignItems:'center' },
  rejectTxt:  { fontSize:11, color:C.err, fontWeight:'700' },
  pagRow:     { flexDirection:'row', alignItems:'center', gap:10, marginTop:12 },
});
