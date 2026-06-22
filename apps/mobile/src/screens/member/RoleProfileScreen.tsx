import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi, docsApi } from '@/lib/api';
import { Input, Button, SectionTitle, Card, useToast, ToastBanner } from '@/components/UI';
import { PickerField } from '@/components/PickerField';
import { C } from '@/theme/colors';

const ROLE_INFO: Record<string, { icon:string; fields:[string,string][]; expLabel:string }> = {
  INTERN:         { icon:'🎓', fields:[['rf0','College Name'],['rf1','Course & Year'],['rf2','Internship Area'],['rf3','Duration Preference']], expLabel:'Academic Projects & Internships' },
  FRESHER:        { icon:'🌱', fields:[['rf0','Qualification'],['rf1','Branch / Spec'],['rf2','Campus'],['rf3','CGPA / %']], expLabel:'Academic Projects & Certifications' },
  JOB_SEEKER:     { icon:'🔍', fields:[['rf0','Current Designation'],['rf1','Current Company'],['rf2','Notice Period'],['rf3','Expected CTC']], expLabel:'Work Experience' },
  FREELANCER:     { icon:'💻', fields:[['rf0','Portfolio URL'],['rf1','Hourly Rate'],['rf2','Availability'],['rf3','Project Duration']], expLabel:'Freelance Projects' },
  CONSULTANT:     { icon:'🧑‍💼', fields:[['rf0','Domain of Expertise'],['rf1','Consulting Rate'],['rf2','Industries Served'],['rf3','Engagement Type']], expLabel:'Consulting Engagements' },
  HIRING_MANAGER: { icon:'📊', fields:[['rf0','Organisation'],['rf1','Department'],['rf2','Team Size'],['rf3','Current Openings']], expLabel:'Teams Built' },
  RECRUITER:      { icon:'🤝', fields:[['rf0','Agency / Company'],['rf1','Specialisation'],['rf2','Placements Made'],['rf3','ATS / Tools']], expLabel:'Recruitment Experience' },
  TRAINER:        { icon:'📚', fields:[['rf0','Training Domains'],['rf1','Certifications'],['rf2','Participants Trained'],['rf3','Delivery Mode']], expLabel:'Training Programs' },
  VENDOR:         { icon:'🏭', fields:[['rf0','Business Name'],['rf1','Products / Services'],['rf2','GST Number'],['rf3','Target Clients']], expLabel:'Projects Delivered' },
  MODERATOR_ROLE: { icon:'🛡️', fields:[['rf0','Domain Expertise'],['rf1','Languages Known'],['rf2','Availability'],['rf3','Prior Experience']], expLabel:'Review Experience' },
  RFP_PROVIDER:   { icon:'📋', fields:[['rf0','Organisation Name'],['rf1','RFP Title'],['rf2','Budget Range'],['rf3','Submission Deadline']], expLabel:'Previous RFPs' },
};

const SEGMENT_OPTIONS = [
  { value:'IT_DEVELOPERS',         label:'Developers',          group:'IT Field'     },
  { value:'IT_DESIGNERS',          label:'Designers',           group:'IT Field'     },
  { value:'IT_PRODUCT_OWNERS',     label:'Product Owners',      group:'IT Field'     },
  { value:'IT_DATA_AI',            label:'Data / AI',           group:'IT Field'     },
  { value:'NON_IT_ARTS_MEDIA',     label:'Arts & Media',        group:'Non-IT Field' },
  { value:'NON_IT_COMMERCE',       label:'Commerce',            group:'Non-IT Field' },
  { value:'NON_IT_EDUCATION',      label:'Education',           group:'Non-IT Field' },
  { value:'NON_IT_SPIRITUAL',      label:'Spiritual',           group:'Non-IT Field' },
  { value:'NON_IT_MANAGEMENT',     label:'Management',          group:'Non-IT Field' },
  { value:'NON_IT_HEALTHCARE',     label:'Healthcare',          group:'Non-IT Field' },
  { value:'NON_IT_ENGINEERING',    label:'Engineering',         group:'Non-IT Field' },
  { value:'SERVICES_CONSULTANCY',  label:'Consultancy',         group:'Services'     },
  { value:'SERVICES_TRAINING',     label:'Training',            group:'Services'     },
  { value:'SERVICES_RECRUITMENT',  label:'Recruitment',         group:'Services'     },
  { value:'SERVICES_VENDOR',       label:'Vendor',               group:'Services'     },
];

const DEGREE_OPTIONS = ['10th / SSLC','12th / PUC','Diploma','B.A. / B.Sc. / B.Com.','B.Tech / B.E.','MBBS','MBA / MCA / M.Tech','CA / CS','Ph.D.','Other'].map(d => ({ value:d, label:d }));
const PAYMENT_OPTIONS = [['PAID','Paid'],['UNPAID','Unpaid'],['STIPEND','Stipend'],['NEGOTIABLE','Negotiable']].map(([value,label])=>({value,label}));
const CERT_OPTIONS    = [['YES','Yes'],['NO','No']].map(([value,label])=>({value,label}));
const MODE_OPTIONS    = [['WFH','WFH'],['ON_SITE','On-Site'],['OFF_SITE','Off-Site'],['HYBRID','Hybrid']].map(([value,label])=>({value,label}));
const EMP_OPTIONS     = [['EXISTS','Exists — Interested'],['NOT_EXISTS','Not Exists / Not Required']].map(([value,label])=>({value,label}));

const DOC_DEFS = [
  { key:'RESUME',       label:'Resume / CV',        icon:'📄', mime:['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  { key:'CERTIFICATE',  label:'Certificates',        icon:'📜', mime:['application/pdf','image/jpeg','image/png'] },
  { key:'PORTFOLIO',    label:'Portfolio / Samples', icon:'💼', mime:['application/pdf','application/zip'] },
  { key:'COVER_LETTER', label:'Cover Letter',        icon:'✉️', mime:['application/pdf','application/msword'] },
];

const STATUS: Record<string,{ color:string; label:string }> = {
  PENDING:  { color:C.warn, label:'⏳ Pending Moderator Review' },
  APPROVED: { color:C.ok,   label:'✅ Live on Portal'          },
  REJECTED: { color:C.err,  label:'❌ Rejected'                },
};

export function RoleProfileScreen({ route }: any) {
  const { role } = route.params;
  const ri = ROLE_INFO[role] ?? ROLE_INFO['JOB_SEEKER'];
  const qc = useQueryClient();
  const { toast, toastMsg } = useToast();

  const [form, setForm] = useState<Record<string, any>>({
    fullName:'', phone:'', email:'', city:'', skills:'', summary:'',
    highestDegree:'', specialization:'', institution:'', yearOfPassing:'', grade:'',
    roleFields: {},
    appliedFor:'', appliedAt:'', marketSegment:'IT_DEVELOPERS',
    payment:'PAID', certificate:'NO', workMode:'ON_SITE', employmentOption:'NOT_EXISTS',
  });
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState({ title:'', company:'', fromDate:'', description:'' });
  const [uploading, setUploading] = useState<string | null>(null);

  const set    = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const setRf  = (key: string) => (v: string) => setForm(f => ({ ...f, roleFields: { ...f.roleFields, [key]: v } }));
  const setExp = (k: string) => (v: string) => setExpForm(f => ({ ...f, [k]: v }));

  const { data: profile } = useQuery({
    queryKey: ['m-profile', role],
    queryFn:  () => profilesApi.getMineByRole(role),
    retry: false,
    onSuccess: (p: any) => {
      if (!p) return;
      setForm(f => ({ ...f, ...p, skills: p.skills?.join(', ') ?? '', roleFields: p.roleFields ?? {} }));
    },
  } as any);

  const profileId = (profile as any)?.id;
  const { data: existingDocs = [] } = useQuery({
    queryKey: ['m-docs', profileId],
    queryFn:  () => docsApi.getForProfile(profileId),
    enabled:  !!profileId,
  });

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

  const delExpMut = useMutation({
    mutationFn: (id: string) => profilesApi.deleteExp ? profilesApi.deleteExp(id) : Promise.reject('not available'),
    onSuccess:  () => { toast('Experience removed'); qc.invalidateQueries({ queryKey:['m-profile', role] }); },
    onError:    () => toast('Could not remove entry'),
  });

  const handleDeleteExp = (id: string) => {
    Alert.alert('Remove entry?', 'This experience entry will be permanently deleted.', [
      { text:'Cancel', style:'cancel' },
      { text:'Remove', style:'destructive', onPress:()=>delExpMut.mutate(id) },
    ]);
  };

  const handlePickDocument = async (docKey: string, mimeTypes: string[]) => {
    if (!profileId) { toast('Save your profile first before uploading documents'); return; }
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: mimeTypes, copyToCacheDirectory: true });
      if (result.canceled) return;
      const file = result.assets[0];
      setUploading(docKey);
      await docsApi.upload(profileId, docKey, { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' } as any);
      toast(`${file.name} uploaded!`);
      qc.invalidateQueries({ queryKey:['m-docs', profileId] });
    } catch (e) {
      toast('Upload failed — please try again');
    } finally { setUploading(null); }
  };

  const handleDeleteDoc = (docId: string) => {
    Alert.alert('Remove document?', '', [
      { text:'Cancel', style:'cancel' },
      { text:'Remove', style:'destructive', onPress: async () => {
          await docsApi.delete(docId);
          toast('Document removed');
          qc.invalidateQueries({ queryKey:['m-docs', profileId] });
        } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Status banner */}
        {st && (
          <View style={[s.statusBanner, { borderColor: st.color + '44' }]}>
            <Text style={[s.statusText, { color: st.color }]}>{ri.icon} {st.label}</Text>
            {(profile as any)?.rejectionReason && (
              <Text style={s.rejectionReason}>Reason: {(profile as any).rejectionReason}</Text>
            )}
          </View>
        )}

        {/* Personal info */}
        <Card>
          <SectionTitle>👤 Personal Information</SectionTitle>
          <Input label="Full Name *"    value={form.fullName} onChangeText={set('fullName')} placeholder="Your Full Name" />
          <Input label="Mobile *"       value={form.phone}    onChangeText={set('phone')}    placeholder="+91 98765 43210" keyboardType="phone-pad" />
          <Input label="Email *"        value={form.email}    onChangeText={set('email')}    placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="City"           value={form.city}     onChangeText={set('city')}     placeholder="Bengaluru, Karnataka" />

          {/* Role-specific fields */}
          {ri.fields.map(([key, label]) => (
            <Input key={key} label={label} value={form.roleFields?.[key] ?? ''} onChangeText={setRf(key)} placeholder={label} />
          ))}

          <Input label="Key Skills"     value={form.skills}   onChangeText={set('skills')}   placeholder="Python, React, Communication…" />
          <Input label="Summary"        value={form.summary}  onChangeText={set('summary')}  placeholder="3–4 lines about yourself…" multiline numberOfLines={3} />
        </Card>

        {/* Education */}
        <Card style={s.section}>
          <SectionTitle>🎓 Education & Qualifications</SectionTitle>
          <PickerField label="Highest Degree" value={form.highestDegree} onChange={set('highestDegree')} options={DEGREE_OPTIONS} />
          <Input label="Specialization"  value={form.specialization} onChangeText={set('specialization')} placeholder="e.g. Computer Science" />
          <Input label="Institution"     value={form.institution}    onChangeText={set('institution')}    placeholder="e.g. IIT Bombay" />
          <Input label="Year of Passing" value={String(form.yearOfPassing ?? '')} onChangeText={set('yearOfPassing')} placeholder="e.g. 2022" keyboardType="number-pad" />
          <Input label="Grade / CGPA"    value={form.grade}          onChangeText={set('grade')}          placeholder="e.g. 8.4 CGPA" />
          <Button label={saveMut.isPending ? 'Saving…' : '💾 Save Profile'} onPress={() => saveMut.mutate()} loading={saveMut.isPending} />
        </Card>

        {/* Experience */}
        <Card style={s.section}>
          <View style={s.expHeader}>
            <SectionTitle>{ri.expLabel}</SectionTitle>
            <TouchableOpacity onPress={() => setShowExpForm(v => !v)}>
              <Text style={s.addBtn}>{showExpForm ? '✕ Cancel' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>

          {experiences.map((e: any) => (
            <View key={e.id} style={s.expCard}>
              <View style={{ flex:1 }}>
                <Text style={s.expTitle}>{e.title}</Text>
                <Text style={s.expCompany}>{e.company}</Text>
                {e.description && <Text style={s.expDesc}>{e.description}</Text>}
              </View>
              <TouchableOpacity onPress={() => handleDeleteExp(e.id)} style={s.expDeleteBtn}>
                <Text style={s.expDeleteTxt}>✕</Text>
              </TouchableOpacity>
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

        {/* Documents */}
        <Card style={s.section}>
          <SectionTitle>📎 Documents & Portfolio</SectionTitle>
          <View style={s.docGrid}>
            {DOC_DEFS.map(d => {
              const uploaded = (existingDocs as any[]).find(doc => doc.documentType === d.key);
              const isUploading = uploading === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => handlePickDocument(d.key, d.mime)}
                  style={[s.docCard, uploaded && s.docCardDone]}
                  disabled={isUploading}
                >
                  <Text style={{ fontSize:24, marginBottom:6 }}>{isUploading ? '⏳' : uploaded ? '✅' : d.icon}</Text>
                  <Text style={s.docLabel}>{d.label}</Text>
                  <Text style={[s.docStatus, uploaded && { color:C.ok }]} numberOfLines={1}>
                    {isUploading ? 'Uploading…' : uploaded ? uploaded.filename : 'Tap to upload'}
                  </Text>
                  {uploaded && (
                    <TouchableOpacity onPress={() => handleDeleteDoc(uploaded.id)} style={{ marginTop:6 }}>
                      <Text style={{ fontSize:10, color:C.err, fontWeight:'600' }}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={s.docHint}>⚠️ Documents are visible only to you and the Admin until your profile is approved.</Text>
        </Card>

        {/* Submission details */}
        <Card style={s.section}>
          <SectionTitle>⬛ Submission Details</SectionTitle>
          <Input label="Applied For *"       value={form.appliedFor} onChangeText={set('appliedFor')} placeholder="Specific role / position" />
          <Input label="Applied At *"        value={form.appliedAt}  onChangeText={set('appliedAt')}  placeholder="Organisation name" />
          <PickerField label="Payment Type"        value={form.payment}          onChange={set('payment')}          options={PAYMENT_OPTIONS} />
          <PickerField label="Certificate Required" value={form.certificate}      onChange={set('certificate')}      options={CERT_OPTIONS} />
          <PickerField label="Mode of Work"        value={form.workMode}         onChange={set('workMode')}         options={MODE_OPTIONS} />
          <PickerField label="Post-Engagement Employment" value={form.employmentOption} onChange={set('employmentOption')} options={EMP_OPTIONS} />
          <PickerField label="Market Segment *"     value={form.marketSegment}    onChange={set('marketSegment')}    options={SEGMENT_OPTIONS} />

          <Button label={saveMut.isPending ? 'Submitting…' : '✦ Submit for Moderator Review'} onPress={() => saveMut.mutate()} loading={saveMut.isPending} style={{ marginTop:8 }} />
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
  expHeader:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  addBtn:         { color:C.gold3, fontWeight:'600', fontSize:13 },
  expCard:        { flexDirection:'row', alignItems:'flex-start', borderRadius:12, backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderColor:C.bf, padding:12, marginBottom:8 },
  expTitle:       { fontSize:13, fontWeight:'700', color:C.white, marginBottom:2 },
  expCompany:     { fontSize:11, color:C.gold3, marginBottom:4 },
  expDesc:        { fontSize:11, color:C.muted, lineHeight:17 },
  expDeleteBtn:   { padding:4, marginLeft:8 },
  expDeleteTxt:   { color:C.err, fontSize:14, fontWeight:'700' },
  emptyText:      { fontSize:12, color:C.faint, fontStyle:'italic' },
  expForm:        { marginTop:12 },
  docGrid:        { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:12 },
  docCard:        { width:'47%', borderRadius:14, borderWidth:2, borderColor:'rgba(212,160,23,0.3)', borderStyle:'dashed', padding:14, alignItems:'center' },
  docCardDone:    { borderColor:'rgba(74,222,128,0.4)', borderStyle:'solid' },
  docLabel:       { fontSize:11, fontWeight:'700', color:C.white, marginBottom:3, textAlign:'center' },
  docStatus:      { fontSize:10, color:C.muted, textAlign:'center' },
  docHint:        { fontSize:11, color:C.muted, lineHeight:17, backgroundColor:'rgba(245,158,11,0.06)', borderWidth:1, borderColor:'rgba(245,158,11,0.2)', borderRadius:10, padding:10 },
});
