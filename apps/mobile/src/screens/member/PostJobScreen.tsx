import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { Input, Button, SectionTitle, useToast, ToastBanner } from '@/components/UI';
import { C, cardStyle } from '@/theme/colors';
import { useAuthStore } from '@/store/auth.store';

export function PostJobScreen({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();
  const { toast, toastMsg } = useToast();
  const [done, setDone] = useState(false);
  const [ref,  setRef]  = useState('');
  const [form, setForm] = useState({
    organisationName:'', contactEmail:'', title:'', location:'',
    salary:'', skills:'', description:'',
    listingType:'JOB_OPENING', targetRoleType:'JOB_SEEKER',
    industry:'IT_SOFTWARE', payment:'PAID', workMode:'ON_SITE',
    certificateProvided:'NO', employmentOption:'NOT_EXISTS',
    experienceRequired:'ANY', duration:'PERMANENT',
  });

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const mut = useMutation({
    mutationFn: () => listingsApi.post({
      ...form,
      marketField: form.industry === 'IT_SOFTWARE' ? 'IT_FIELD' : form.industry === 'SERVICES' ? 'SERVICES' : 'NON_IT_FIELD',
    }),
    onSuccess: () => { setRef('UDYG-' + Math.floor(Math.random()*90000+10000)); setDone(true); },
    onError: () => toast('Submission failed — please check all required fields.'),
  });

  if (!isAuthenticated) return (
    <SafeAreaView style={s.safe}>
      <View style={s.authGate}>
        <Text style={{ fontSize:40, marginBottom:16 }}>🔐</Text>
        <Text style={s.gateTitle}>Sign In to Post</Text>
        <Text style={s.gateBody}>You need a free account to post a job or RFP.</Text>
        <Button label="Sign In →" onPress={() => navigation.navigate('Auth', { screen:'Login' })} style={{ marginTop:16 }} />
        <Button label="Create Account" onPress={() => navigation.navigate('Auth', { screen:'Register' })} variant="outline" style={{ marginTop:10 }} />
      </View>
    </SafeAreaView>
  );

  if (done) return (
    <SafeAreaView style={s.safe}>
      <View style={s.authGate}>
        <Text style={{ fontSize:48, marginBottom:16 }}>✅</Text>
        <Text style={s.gateTitle}>Posting Submitted!</Text>
        <Text style={s.gateBody}>Reference: <Text style={{ color:C.gold2, fontWeight:'700' }}>{ref}</Text>{'\n'}Will be reviewed and published within 2–4 hours.</Text>
        <Button label="Browse Jobs →" onPress={() => { setDone(false); navigation.navigate('Jobs'); }} style={{ marginTop:20 }} />
        <Button label="Post Another" variant="outline" onPress={() => setDone(false)} style={{ marginTop:10 }} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <View style={cardStyle}>
          <SectionTitle>🏢 Organisation Details</SectionTitle>
          <Input label="Organisation Name *" value={form.organisationName} onChangeText={set('organisationName')} placeholder="TCS, Apollo Hospital…" />
          <Input label="Contact Email *"     value={form.contactEmail}    onChangeText={set('contactEmail')}    placeholder="hr@company.com" keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={[cardStyle, { marginTop:12 }]}>
          <SectionTitle>📌 Job Details</SectionTitle>
          <Input label="Job / RFP Title *"  value={form.title}       onChangeText={set('title')}       placeholder="e.g. Senior React Developer" />
          <Input label="Location *"         value={form.location}    onChangeText={set('location')}    placeholder="Bengaluru, Karnataka" />
          <Input label="Salary / Budget"    value={form.salary}      onChangeText={set('salary')}      placeholder="₹18–28 LPA" />
          <Input label="Key Skills"         value={form.skills}      onChangeText={set('skills')}      placeholder="React, Node.js, Python…" />
          <Input label="Job Description *"  value={form.description} onChangeText={set('description')} placeholder="Describe the role…" multiline numberOfLines={4} style={{ minHeight:90 }} />
        </View>

        <Button
          label={mut.isPending ? 'Submitting…' : '✦ Submit for Moderator Review'}
          onPress={() => {
            if (!form.organisationName || !form.title || !form.description || !form.location) {
              toast('Please fill all required fields.');
              return;
            }
            mut.mutate();
          }}
          loading={mut.isPending}
          style={{ marginTop:16 }}
        />
      </ScrollView>
      <ToastBanner message={toastMsg} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex:1, backgroundColor:C.deep },
  scroll:    { padding:16, paddingBottom:40 },
  authGate:  { flex:1, alignItems:'center', justifyContent:'center', padding:32 },
  gateTitle: { fontSize:22, fontWeight:'700', color:C.white, marginBottom:10, textAlign:'center' },
  gateBody:  { fontSize:14, color:C.muted, textAlign:'center', lineHeight:22 },
});
