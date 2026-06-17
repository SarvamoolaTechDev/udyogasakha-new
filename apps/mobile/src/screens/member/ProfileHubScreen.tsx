import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { C, cardStyle } from '@/theme/colors';
import { Button } from '@/components/UI';

const ROLES = [
  { slug:'INTERN',         icon:'🎓', name:'Intern',        sub:'Certificate · Stipend'          },
  { slug:'FRESHER',        icon:'🌱', name:'Fresher',       sub:'Entry-level · 0–1 yr'           },
  { slug:'JOB_SEEKER',     icon:'🔍', name:'Job Seeker',    sub:'Experienced · Switch'           },
  { slug:'FREELANCER',     icon:'💻', name:'Freelancer',    sub:'Project · Hourly · Remote'      },
  { slug:'CONSULTANT',     icon:'🧑‍💼', name:'Consultant', sub:'Advisory · Contract'            },
  { slug:'HIRING_MANAGER', icon:'📊', name:'Hiring Mgr',   sub:'Team Builder · JD'              },
  { slug:'RECRUITER',      icon:'🤝', name:'Recruiter',     sub:'Sourcing · Placement'           },
  { slug:'TRAINER',        icon:'📚', name:'Trainer',       sub:'Corporate · Online'             },
  { slug:'VENDOR',         icon:'🏭', name:'Vendor',        sub:'B2B · Products'                 },
  { slug:'MODERATOR_ROLE', icon:'🛡️', name:'Moderator',    sub:'Validator · Review'             },
  { slug:'RFP_PROVIDER',   icon:'📋', name:'RFP Provider',  sub:'Tender · Publisher'             },
];

const STATUS: Record<string,{ color:string; label:string }> = {
  PENDING:  { color:C.warn,  label:'⏳ Pending'  },
  APPROVED: { color:C.ok,    label:'✅ Live'     },
  REJECTED: { color:C.err,   label:'❌ Rejected' },
};

export function ProfileHubScreen({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();

  const { data: myProfiles = [] } = useQuery({
    queryKey: ['m-my-profiles'],
    queryFn:  profilesApi.getMine,
    enabled:  isAuthenticated,
  });

  const byRole = Object.fromEntries((myProfiles as any[]).map(p => [p.roleType, p]));

  if (!isAuthenticated) return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={{ fontSize:32, marginBottom:14 }}>👤</Text>
        <Text style={s.gateTitle}>Sign In to View Your Profile</Text>
        <Text style={s.gateBody}>Choose a role type and create your verified career profile.</Text>
        <Button label="Sign In →" onPress={() => navigation.navigate('Auth', { screen:'Login' })} style={{ marginTop:16 }} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={ROLES}
        keyExtractor={r => r.slug}
        numColumns={2}
        contentContainerStyle={s.grid}
        ListHeaderComponent={
          <View style={s.header}>
            <Text style={s.title}>My Career Profiles</Text>
            <Text style={s.sub}>Select a role to create or update your profile</Text>
          </View>
        }
        columnWrapperStyle={{ gap:10 }}
        renderItem={({ item: r }) => {
          const profile = byRole[r.slug];
          const st = profile ? STATUS[profile.status] : null;
          return (
            <TouchableOpacity activeOpacity={0.85} style={[cardStyle, s.roleCard]}
              onPress={() => navigation.navigate('RoleProfile', { role: r.slug })}>
              <Text style={{ fontSize:28, marginBottom:8 }}>{r.icon}</Text>
              <Text style={s.roleName}>{r.name}</Text>
              {st
                ? <Text style={[s.statusBadge, { color:st.color }]}>{st.label}</Text>
                : <Text style={s.subText}>{r.sub}</Text>
              }
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex:1, backgroundColor:C.deep },
  center:      { flex:1, alignItems:'center', justifyContent:'center', padding:32 },
  gateTitle:   { fontSize:20, fontWeight:'700', color:C.white, marginBottom:8, textAlign:'center' },
  gateBody:    { fontSize:13, color:C.muted, textAlign:'center', lineHeight:20 },
  grid:        { padding:16, gap:10, paddingBottom:40 },
  header:      { marginBottom:16 },
  title:       { fontSize:20, fontWeight:'700', color:C.white, marginBottom:4 },
  sub:         { fontSize:13, color:C.muted },
  roleCard:    { flex:1, alignItems:'center', padding:16 },
  roleName:    { fontSize:12, fontWeight:'700', color:C.white, textAlign:'center', marginBottom:4 },
  subText:     { fontSize:10, color:C.muted, textAlign:'center', lineHeight:15 },
  statusBadge: { fontSize:10, fontWeight:'700', marginTop:4 },
});
