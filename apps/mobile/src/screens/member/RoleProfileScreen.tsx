import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { Input, Button, SectionTitle, Card, Badge, useToast, ToastBanner } from '@/components/UI';
import { C } from '@/theme/colors';

const SEGMENTS = ['IT_DEVELOPERS','IT_DESIGNERS','IT_PRODUCT_OWNERS','IT_DATA_AI','NON_IT_ARTS_MEDIA','NON_IT_COMMERCE','NON_IT_EDUCATION','NON_IT_SPIRITUAL','NON_IT_MANAGEMENT','NON_IT_HEALTHCARE','NON_IT_ENGINEERING','SERVICES_CONSULTANCY','SERVICES_TRAINING','SERVICES_RECRUITMENT','SERVICES_VENDOR'];

const STATUS: Record<string,{ color:string; label:string }> = {
  PENDING:  { color:C.warn, label:'⏳ Pending Moderator Review' },
  APPROVED: { color:C.ok,   label:'✅ Live on Portal'          },
  REJECTED: { color:C.err,  label:'❌ Rejected'                },
};

export function RoleProfileScreen({ route }: any) {
  const { role } = route.params;
  const qc = useQueryClient();
  const { toast, toastMsg } = useToast();

  const [form, setForm] = useState({ fullName:'', phone:'', email:'', city:'', skills:'', summary:'', appliedFor:'', appliedAt:'', marketSegment:'IT_DEVELOPERS', payment:'PAID', certificate:'NO', workMode:'ON_SITE', employmentOption:'NOT_EXISTS' });
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ title:'', company:'', fromDate:'', description:'' });
  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const setExp = (k: string) => (v: string) => setExpForm(f => ({ ...f, [k]: v }));

  const { data: profile } = useQuery({
    queryKey: ['m-profile', role],
    queryFn:  () => profilesApi.getMineByRole(role),
    retry: false,
    onSuccess: (p: any) => {
      if (!p) return;
      setForm(f => ({ ...f, ...p, skills: p.skills?.join(', ') ?? '' }));
    },
  } as any);

  const st = (profile as any)?.status ? STATUS[(profile as any).status] : null;
  const experiences: any[] = (profile as any)?.experiences ?? [];

  const saveMut = useMutation({
    mutationFn: () => profilesApi.upsert({ ...form, roleType: role }),
    onSuccess:  () => { toast('Profile saved!'); qc.invalidateQueries({ queryKey:['m-profile', role] }); qc.invalidateQueries({ queryKey:['m-my-profiles'] }); },
    onError:    () => toast('Save failed — please try again'),
  });

  const addExpMut = useMutation({
    mutationFn: () => profilesApi.addExp(role, expForm),
    onSuccess:  () => { toast('Experience added!'); setShowExpForm(false); setExpForm({ title:'', company:'', fromDate:'', description:'' }); qc.invalidateQueries({ queryKey:['m-profile', role] }); },
  });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Status banner */}
        {st && (
          <View style={[s.statusBanner, { borderColor: st.color + '44' }]}>
            <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
            {(profile as any)?.rejectionReason && (
              <Text style={s.rejectionReason}>Reason: {(profile as any).rejectionReason}</Text>
            )}
          </View>
        )}

        {/* Personal info */}
        <Card style={s.section}>
          <SectionTitle>👤 Personal Information</SectionTitle>
          <Input label="Full Name *"    value={form.fullName} onChangeText={set('fullName')} placeholder="Your Full Name" />
          <Input label="Mobile *"       value={form.phone}    onChangeText={set('phone')}    placeholder="+91 98765 43210" keyboardType="phone-pad" />
          <Input label="Email *"        value={form.email}    onChangeText={set('email')}    placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="City"           value={form.city}     onChangeText={set('city')}     placeholder="Bengaluru, Karnataka" />
          <Input label="Key Skills"     value={form.skills}   onChangeText={set('skills')}   placeholder="Python, React, Communication…" />
          <Input label="Summary"        value={form.summary}  onChangeText={set('summary')}  placeholder="3–4 lines about yourself…" multiline numberOfLines={3} />
          <Button label={saveMut.isPending ? 'Saving…' : '💾 Save Profile'} onPress={() => saveMut.mutate()} loading={saveMut.isPending} />
        </Card>

        {/* Submission details */}
        <Card style={s.section}>
          <SectionTitle>⬛ Submission Details</SectionTitle>
          <Input label="Applied For *"       value={form.appliedFor} onChangeText={set('appliedFor')} placeholder="Specific role / position" />
          <Input label="Applied At *"        value={form.appliedAt}  onChangeText={set('appliedAt')}  placeholder="Organisation name" />
          <View style={s.row}>
            {['IT_DEVELOPERS','NON_IT_HEALTHCARE','SERVICES_CONSULTANCY'].map(seg => (
              <TouchableOpacity key={seg} onPress={() => setForm(f => ({ ...f, marketSegment: seg }))}
                style={[s.chip, form.marketSegment === seg && s.chipOn]}>
                <Text style={[s.chipTxt, form.marketSegment === seg && s.chipTxtOn]}>{seg.replace(/_/g,' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.chipHint}>More segments available on the web portal</Text>
          <Button label="✦ Submit for Review" onPress={() => saveMut.mutate()} loading={saveMut.isPending} style={{ marginTop:8 }} />
        </Card>

        {/* Experience */}
        <Card style={s.section}>
          <View style={s.expHeader}>
            <SectionTitle>Experience</SectionTitle>
            <TouchableOpacity onPress={() => setShowExpForm(v => !v)}>
              <Text style={s.addBtn}>{showExpForm ? '✕ Cancel' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>

          {experiences.map((e: any) => (
            <View key={e.id} style={s.expCard}>
              <Text style={s.expTitle}>{e.title}</Text>
              <Text style={s.expCompany}>{e.company}</Text>
              {e.description && <Text style={s.expDesc}>{e.description}</Text>}
            </View>
          ))}

          {!showExpForm && experiences.length === 0 && (
            <Text style={s.emptyText}>No entries yet. Tap + Add.</Text>
          )}

          {showExpForm && (
            <View style={s.expForm}>
              <Input label="Title *"   value={expForm.title}   onChangeText={setExp('title')}   placeholder="e.g. Full Stack Developer" />
              <Input label="Company *" value={expForm.company} onChangeText={setExp('company')} placeholder="e.g. Infosys" />
              <Input label="From Date" value={expForm.fromDate} onChangeText={setExp('fromDate')} placeholder="e.g. June 2021" />
              <Input label="Description" value={expForm.description} onChangeText={setExp('description')} multiline numberOfLines={3} placeholder="Key contributions…" />
              <Button label={addExpMut.isPending ? 'Saving…' : 'Save Entry'} onPress={() => addExpMut.mutate()} loading={addExpMut.isPending} />
            </View>
          )}
        </Card>

      </ScrollView>
      <ToastBanner message={toastMsg} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex:1, backgroundColor:C.deep },
  scroll:         { padding:16, gap:12, paddingBottom:40 },
  section:        { },
  statusBanner:   { borderRadius:12, borderWidth:1, padding:12, marginBottom:4 },
  statusText:     { fontSize:13, fontWeight:'700', textAlign:'center' },
  rejectionReason:{ fontSize:12, color:C.muted, textAlign:'center', marginTop:4 },
  row:            { flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:8 },
  chip:           { paddingHorizontal:12, paddingVertical:6, borderRadius:50, borderWidth:1, borderColor:C.bf },
  chipOn:         { backgroundColor:'rgba(212,160,23,0.12)', borderColor:C.border },
  chipTxt:        { fontSize:10, color:C.muted, fontWeight:'600' },
  chipTxtOn:      { color:C.gold3 },
  chipHint:       { fontSize:10, color:C.faint, marginBottom:12 },
  expHeader:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  addBtn:         { color:C.gold3, fontWeight:'600', fontSize:13 },
  expCard:        { borderRadius:12, backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderColor:C.bf, padding:12, marginBottom:8 },
  expTitle:       { fontSize:13, fontWeight:'700', color:C.white, marginBottom:2 },
  expCompany:     { fontSize:11, color:C.gold3, marginBottom:4 },
  expDesc:        { fontSize:11, color:C.muted, lineHeight:17 },
  emptyText:      { fontSize:12, color:C.faint, fontStyle:'italic' },
  expForm:        { marginTop:12 },
});
