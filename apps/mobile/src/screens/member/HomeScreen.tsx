import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { C, cardStyle } from '@/theme/colors';
import { Button } from '@/components/UI';
import { useAuthStore } from '@/store/auth.store';

const ROLES = [
  { icon:'🎓', name:'Intern',       slug:'INTERN'         },
  { icon:'🌱', name:'Fresher',      slug:'FRESHER'        },
  { icon:'🔍', name:'Job Seeker',   slug:'JOB_SEEKER'     },
  { icon:'💻', name:'Freelancer',   slug:'FREELANCER'     },
  { icon:'🧑‍💼',name:'Consultant', slug:'CONSULTANT'     },
  { icon:'📊', name:'Hiring Mgr',   slug:'HIRING_MANAGER' },
  { icon:'🤝', name:'Recruiter',    slug:'RECRUITER'      },
  { icon:'📚', name:'Trainer',      slug:'TRAINER'        },
  { icon:'🏭', name:'Vendor',       slug:'VENDOR'         },
  { icon:'🛡️', name:'Moderator',   slug:'MODERATOR_ROLE' },
  { icon:'📋', name:'RFP Provider', slug:'RFP_PROVIDER'   },
];

export function HomeScreen({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();
  const { data } = useQuery({ queryKey:['listings-count'], queryFn:()=>listingsApi.browse({ limit:1 }) });
  const total = (data as any)?.total ?? '12,400+';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroSub}>India's Unified Employment Ecosystem</Text>
          <Text style={s.heroTitle}>One Platform.{'\n'}<Text style={{ color: C.gold2 }}>Infinite Careers.</Text></Text>
          <Text style={s.heroBody}>For Interns to Consultants, Freshers to Hiring Managers — every professional finds their opportunity here.</Text>

          <View style={s.statRow}>
            {[['12,400+','Jobs'],['4.8L+','Professionals'],['11','Role Types']].map(([n,l])=>(
              <View key={l} style={s.stat}>
                <Text style={s.statN}>{n}</Text>
                <Text style={s.statL}>{l}</Text>
              </View>
            ))}
          </View>

          <View style={s.heroBtns}>
            <Button label="Browse Jobs →" onPress={() => navigation.navigate('Jobs')} style={{ flex:1 }} />
            <Button label="My Profile"    onPress={() => navigation.navigate('ProfileTab')} variant="outline" style={{ flex:1 }} />
          </View>
        </View>

        {/* 11 Roles */}
        <Text style={s.sectionHead}>11 Professional Roles</Text>
        <View style={s.rolesGrid}>
          {ROLES.map(r => (
            <TouchableOpacity key={r.slug} activeOpacity={0.8}
              onPress={() => navigation.navigate('ProfileTab', { screen:'RoleProfile', params:{ role:r.slug } })}
              style={[cardStyle, s.roleCard]}>
              <Text style={{ fontSize: 26, marginBottom: 6 }}>{r.icon}</Text>
              <Text style={s.roleName}>{r.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        {!isAuthenticated && (
          <View style={[cardStyle, s.cta]}>
            <Text style={s.ctaTitle}>Start Today — It's Free</Text>
            <Text style={s.ctaBody}>Join 4.8 Lakh+ professionals. Profiles published only after Moderator Approval.</Text>
            <Button label="Create My Profile" onPress={() => navigation.navigate('Auth', { screen:'Register' })} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex:1, backgroundColor:C.deep },
  scroll:     { padding:20, paddingBottom:40 },
  hero:       { marginBottom:32 },
  heroSub:    { fontSize:10, fontWeight:'700', letterSpacing:2, textTransform:'uppercase', color:C.gold2, marginBottom:10 },
  heroTitle:  { fontSize:28, fontWeight:'700', color:C.white, lineHeight:36, marginBottom:12 },
  heroBody:   { fontSize:13, color:C.muted, lineHeight:20, marginBottom:20 },
  statRow:    { flexDirection:'row', gap:24, marginBottom:20 },
  stat:       { alignItems:'center' },
  statN:      { fontSize:22, fontWeight:'700', color:C.gold2 },
  statL:      { fontSize:10, color:C.muted, marginTop:2 },
  heroBtns:   { flexDirection:'row', gap:10 },
  sectionHead:{ fontSize:16, fontWeight:'700', color:C.white, marginBottom:14 },
  rolesGrid:  { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:28 },
  roleCard:   { width:'30%', alignItems:'center', padding:14 },
  roleName:   { fontSize:11, fontWeight:'700', color:C.white, textAlign:'center' },
  cta:        { padding:24, alignItems:'center', gap:12 },
  ctaTitle:   { fontSize:18, fontWeight:'700', color:C.white, textAlign:'center' },
  ctaBody:    { fontSize:13, color:C.muted, textAlign:'center', lineHeight:20 },
});
