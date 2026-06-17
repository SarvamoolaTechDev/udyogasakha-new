import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usersApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Input, Button, SectionTitle, Card, useToast, ToastBanner } from '@/components/UI';
import { C } from '@/theme/colors';

export function SettingsScreen() {
  const { clearAuth } = useAuthStore();
  const { toast, toastMsg } = useToast();
  const [form, setForm] = useState({ name:'', phone:'', city:'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const setPw = (k: string) => (v: string) => setPwForm(f => ({ ...f, [k]: v }));

  const { data: me } = useQuery({ queryKey:['m-me'], queryFn: usersApi.getMe });

  useEffect(() => {
    if (!me) return;
    const u = me as any;
    setForm({ name: u.name ?? '', phone: u.phone ?? '', city: u.city ?? '' });
  }, [me]);

  const updateMut = useMutation({
    mutationFn: () => usersApi.updateMe(form),
    onSuccess:  () => toast('Account updated!'),
    onError:    () => toast('Update failed — please try again'),
  });

  const changePwMut = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    onSuccess:  () => { toast('Password changed. Signing out…'); setTimeout(() => clearAuth(), 1500); },
    onError:    (e:any) => toast(e?.response?.data?.message ?? 'Change failed'),
  });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Account info */}
        <Card>
          <SectionTitle>Account Information</SectionTitle>
          {[['📧 Email',(me as any)?.email],['🛡️ Roles',((me as any)?.roles??[]).join(', ')],['📅 Joined',(me as any)?.createdAt?new Date((me as any).createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'long', year:'numeric'}):'—']].map(([l,v])=>(
            <View key={String(l)} style={s.infoRow}>
              <Text style={s.infoLabel}>{l}</Text>
              <Text style={s.infoValue}>{v||'—'}</Text>
            </View>
          ))}
        </Card>

        {/* Edit profile */}
        <Card style={s.section}>
          <SectionTitle>Edit Profile</SectionTitle>
          <Input label="Full Name" value={form.name}  onChangeText={set('name')}  placeholder="Your full name" />
          <Input label="Mobile"    value={form.phone} onChangeText={set('phone')} placeholder="+91 98765 43210" keyboardType="phone-pad" />
          <Input label="City"      value={form.city}  onChangeText={set('city')}  placeholder="Bengaluru, Karnataka" />
          <Button label={updateMut.isPending ? 'Saving…' : 'Save Changes'} onPress={() => updateMut.mutate()} loading={updateMut.isPending} />
        </Card>

        {/* Change password */}
        <Card style={s.section}>
          <SectionTitle>Change Password</SectionTitle>
          <Input label="Current Password" value={pwForm.currentPassword} onChangeText={setPw('currentPassword')} secureTextEntry placeholder="••••••••" />
          <Input label="New Password"     value={pwForm.newPassword}     onChangeText={setPw('newPassword')}     secureTextEntry placeholder="Minimum 8 characters" />
          <Input label="Confirm New"      value={pwForm.confirm}         onChangeText={setPw('confirm')}         secureTextEntry placeholder="Re-enter new password" />
          <Text style={s.pwWarn}>⚠️ This will sign you out of all devices.</Text>
          <Button
            label={changePwMut.isPending ? 'Updating…' : 'Change Password'}
            variant="outline"
            loading={changePwMut.isPending}
            onPress={() => {
              if (pwForm.newPassword.length < 8) { toast('Min 8 characters'); return; }
              if (pwForm.newPassword !== pwForm.confirm) { toast('Passwords do not match'); return; }
              changePwMut.mutate();
            }}
          />
        </Card>

        {/* Sign out */}
        <Button label="Sign Out" variant="danger" onPress={clearAuth} style={s.section} />

      </ScrollView>
      <ToastBanner message={toastMsg} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex:1, backgroundColor:C.deep },
  scroll:    { padding:16, gap:12, paddingBottom:40 },
  section:   { },
  infoRow:   { flexDirection:'row', justifyContent:'space-between', paddingVertical:10, borderBottomWidth:1, borderBottomColor:C.bf },
  infoLabel: { fontSize:12, color:C.muted },
  infoValue: { fontSize:12, color:C.offwhite, fontWeight:'500', flex:1, textAlign:'right' },
  pwWarn:    { fontSize:11, color:C.warn, marginBottom:12 },
});
