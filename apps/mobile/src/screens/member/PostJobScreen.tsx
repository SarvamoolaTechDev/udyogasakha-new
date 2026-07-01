import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import RazorpayCheckout from 'react-native-razorpay';
import { listingsApi, paymentsApi } from '@/lib/api';
import { Input, Button, SectionTitle, Card, useToast, ToastBanner } from '@/components/UI';
import { PickerField } from '@/components/PickerField';
import { C } from '@/theme/colors';
import { useAuthStore } from '@/store/auth.store';

const LISTING_TYPES = [['JOB_OPENING','Job Opening'],['INTERNSHIP','Internship'],['RFP_TENDER','RFP / Tender'],['TRAINING_PROGRAM','Training Program'],['CONSULTANCY_NEED','Consultancy Need'],['VENDOR_REQUIREMENT','Vendor Requirement']];
const ROLE_TYPES    = [['JOB_SEEKER','Job Seeker'],['INTERN','Intern'],['FRESHER','Fresher'],['FREELANCER','Freelancer'],['CONSULTANT','Consultant'],['TRAINER','Trainer'],['RECRUITER','Recruiter'],['VENDOR','Vendor']];
const INDUSTRIES     = [['IT_SOFTWARE','IT / Software'],['HEALTHCARE','Healthcare'],['FINANCE_BANKING','Finance / Banking'],['GOVERNMENT_PSU','Government / PSU'],['EDUCATION','Education'],['ENGINEERING','Engineering'],['MARKETING','Marketing'],['SERVICES','Services'],['OTHER','Other']];
const PAYMENTS       = [['PAID','Paid'],['UNPAID','Unpaid'],['STIPEND','Stipend'],['NEGOTIABLE','Negotiable']];
const WORK_MODES      = [['WFH','WFH'],['ON_SITE','On-Site'],['HYBRID','Hybrid'],['OFF_SITE','Off-Site']];
const CERT_OPTS       = [['YES','Yes'],['NO','No']];
const EMP_OPTS        = [['EXISTS','Exists'],['NOT_EXISTS','Not Exists']];
const EXP_LEVELS       = [['ANY','Any'],['FRESHER_0_1','Fresher / 0–1 yr'],['EXP_1_3','1–3 yrs'],['EXP_3_5','3–5 yrs'],['EXP_5_8','5–8 yrs'],['EXP_8_PLUS','8+ yrs']];
const DURATIONS        = [['PERMANENT','Permanent'],['SHORT_TERM','Short Term'],['MEDIUM_TERM','Medium Term'],['LONG_TERM','Long Term'],['PROJECT_BASED','Project Based']];

const opts = (arr: string[][]) => arr.map(([value, label]) => ({ value, label }));

export function PostJobScreen({ navigation }: any) {
  const { isAuthenticated } = useAuthStore();
  const { toast, toastMsg } = useToast();
  const [done,      setDone]      = useState(false);
  const [ref,       setRef]       = useState('');
  const [listingId, setListingId] = useState<string | null>(null);
  const [featured,  setFeatured]  = useState(false);
  const [featuring, setFeaturing] = useState(false);
  const [form, setForm] = useState({
    organisationName:'', contactPerson:'', contactEmail:'', contactPhone:'',
    title:'', location:'', salary:'', skills:'', facilities:'', description:'', experienceDetail:'',
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
    onSuccess: (created: any) => {
      setRef('UDYG-' + Math.floor(Math.random()*90000+10000));
      setListingId(created?.id ?? null);
      setDone(true);
    },
    onError: () => toast('Submission failed — please check all required fields.'),
  });

  const handleFeatureListing = async () => {
    if (!listingId) return;
    setFeaturing(true);
    try {
      // Step 1 — create the Razorpay order on our backend
      const order = await paymentsApi.createOrder({
        purpose:     'LISTING_FEATURE',
        referenceId: listingId,
        amount:      499, // ⚠️ placeholder — final pricing is a pending product decision
        currency:    'INR',
      });

      // Step 2 — open Razorpay native checkout.
      // No `method` restriction — all enabled payment methods (UPI, cards,
      // netbanking, wallets, EMI, pay later) are shown automatically.
      const response = await RazorpayCheckout.open({
        description:  'Feature this listing for 30 days',
        currency:     order.currency,
        key:          order.razorpayKeyId,
        amount:       order.amount,
        order_id:     order.orderId,
        name:         'Sarvamoola Udyoga Sakha',
        prefill:      { name: '', email: '', contact: '' },
        theme:        { color: '#D4A017' },
      });

      // Step 3 — verify the signature on our backend
      await paymentsApi.verify({
        razorpay_order_id:   response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature:  response.razorpay_signature,
      });

      setFeatured(true);
      toast('Listing featured for 30 days! 🌟');
    } catch (err: any) {
      if (err?.code !== 'PAYMENT_CANCELLED') {
        toast('Payment failed — please try again.');
      }
    } finally {
      setFeaturing(false);
    }
  };

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

        {/* Optional paid promotion — UPI, cards, netbanking, wallets, EMI and pay
            later all shown automatically by Razorpay Checkout on both iOS and Android */}
        {listingId && !featured && (
          <View style={s.featureCard}>
            <Text style={s.featureTitle}>🌟 Feature This Listing</Text>
            <Text style={s.featureBody}>
              Get priority placement for 30 days. Pay via UPI, card, netbanking, wallet or any method at checkout.
            </Text>
            <Button
              label={featuring ? 'Opening checkout…' : 'Feature for ₹499 →'}
              onPress={handleFeatureListing}
              loading={featuring}
              style={{ marginTop: 12 }}
            />
          </View>
        )}
        {featured && (
          <View style={s.featuredBanner}>
            <Text style={s.featuredText}>✅ Listing featured for 30 days</Text>
          </View>
        )}

        <Button label="Browse Jobs →" onPress={() => { setDone(false); navigation.navigate('Jobs'); }} style={{ marginTop:20 }} />
        <Button label="Post Another" variant="outline" onPress={() => setDone(false)} style={{ marginTop:10 }} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <Card>
          <SectionTitle>🏢 Organisation Details</SectionTitle>
          <Input label="Organisation Name *" value={form.organisationName} onChangeText={set('organisationName')} placeholder="TCS, Apollo Hospital…" />
          <Input label="Contact Person"       value={form.contactPerson}   onChangeText={set('contactPerson')}   placeholder="HR Manager / Admin" />
          <Input label="Contact Email *"      value={form.contactEmail}    onChangeText={set('contactEmail')}    placeholder="hr@company.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Contact Phone"        value={form.contactPhone}    onChangeText={set('contactPhone')}    placeholder="+91 98765 43210" keyboardType="phone-pad" />
        </Card>

        <Card style={s.section}>
          <SectionTitle>📌 Job Details</SectionTitle>
          <PickerField label="Posting Type"    value={form.listingType}    onChange={set('listingType')}    options={opts(LISTING_TYPES)} />
          <PickerField label="For Role Type"   value={form.targetRoleType} onChange={set('targetRoleType')} options={opts(ROLE_TYPES)} />
          <Input label="Job / RFP Title *"  value={form.title}       onChangeText={set('title')}       placeholder="e.g. Senior React Developer" />
          <PickerField label="Industry"        value={form.industry}        onChange={set('industry')}        options={opts(INDUSTRIES)} />
          <Input label="Location *"         value={form.location}    onChangeText={set('location')}    placeholder="Bengaluru, Karnataka" />
          <PickerField label="Payment Type"    value={form.payment}         onChange={set('payment')}         options={opts(PAYMENTS)} />
          <Input label="Salary / Budget"    value={form.salary}      onChangeText={set('salary')}      placeholder="₹18–28 LPA · ₹15,000 Stipend/Month" />
          <PickerField label="Mode of Work"    value={form.workMode}        onChange={set('workMode')}        options={opts(WORK_MODES)} />
          <PickerField label="Certificate Provided"    value={form.certificateProvided} onChange={set('certificateProvided')} options={opts(CERT_OPTS)} />
          <PickerField label="Post-Engagement Employment" value={form.employmentOption} onChange={set('employmentOption')} options={opts(EMP_OPTS)} />
          <PickerField label="Experience Required"     value={form.experienceRequired}  onChange={set('experienceRequired')}  options={opts(EXP_LEVELS)} />
          <PickerField label="Duration"        value={form.duration}        onChange={set('duration')}        options={opts(DURATIONS)} />
          <Input label="Key Skills"         value={form.skills}      onChangeText={set('skills')}      placeholder="React, Node.js, Python…" />
          <Input label="Facilities / Benefits" value={form.facilities} onChangeText={set('facilities')} placeholder="Health Insurance, PF, Laptop…" />
          <Input label="Job Description *"  value={form.description} onChangeText={set('description')} placeholder="Describe the role…" multiline numberOfLines={4} style={{ minHeight:90 }} />
          <Input label="Experience Details" value={form.experienceDetail} onChangeText={set('experienceDetail')} placeholder="Describe required experience in detail…" multiline numberOfLines={3} />
        </Card>

        <Button
          label={mut.isPending ? 'Submitting…' : '✦ Submit for Moderator Review'}
          onPress={() => {
            if (!form.organisationName || !form.title || !form.description || !form.location || !form.contactEmail) {
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
  scroll:    { padding:16, gap:12, paddingBottom:40 },
  section:      { },
  authGate:     { flex:1, alignItems:'center', justifyContent:'center', padding:32 },
  gateTitle:    { fontSize:22, fontWeight:'700', color:C.white, marginBottom:10, textAlign:'center' },
  gateBody:     { fontSize:14, color:C.muted, textAlign:'center', lineHeight:22 },
  featureCard:  { marginTop:20, padding:16, borderRadius:14, backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderColor:C.border, width:'100%' },
  featureTitle: { fontSize:14, fontWeight:'700', color:C.white, marginBottom:6 },
  featureBody:  { fontSize:12, color:C.muted, lineHeight:18 },
  featuredBanner:{ marginTop:20, padding:12, borderRadius:12, backgroundColor:'rgba(74,222,128,0.08)', borderWidth:1, borderColor:'rgba(74,222,128,0.3)' },
  featuredText: { fontSize:13, fontWeight:'700', color:C.ok, textAlign:'center' },
});
