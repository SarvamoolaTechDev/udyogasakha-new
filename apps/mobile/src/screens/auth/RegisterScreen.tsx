import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { Input, Button, useToast, ToastBanner } from '@/components/UI';
import { C } from '@/theme/colors';

export function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { setTokens } = useAuthStore();
  const { toast, toastMsg } = useToast();

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: any = {};
    if (!form.name.trim())                           e.name     = 'Name is required';
    if (!form.email.trim())                          e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))       e.email    = 'Enter a valid email';
    if (form.password.length < 8)                    e.password = 'Minimum 8 characters';
    if (form.confirm !== form.password)              e.confirm  = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirm, ...dto } = form;
      const tokens = await authApi.register(dto);
      await setTokens(tokens);
    } catch (err: any) {
      toast(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.logoArea}>
          <Text style={s.logoTop}>Sarva Moola</Text>
          <Text style={s.logoBottom}>Udyoga Sakha</Text>
          <Text style={s.tagline}>Join 4.8 Lakh+ professionals — it's free</Text>
        </View>

        <View style={s.card}>
          <Input label="Full Name *"      value={form.name}     onChangeText={set('name')}     placeholder="Your Full Name"        error={errors.name}     />
          <Input label="Email *"          value={form.email}    onChangeText={set('email')}    keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" error={errors.email} />
          <Input label="Mobile"           value={form.phone}    onChangeText={set('phone')}    keyboardType="phone-pad"    placeholder="+91 98765 43210" />
          <Input label="Password *"       value={form.password} onChangeText={set('password')} secureTextEntry             placeholder="Minimum 8 characters" error={errors.password} />
          <Input label="Confirm Password *" value={form.confirm} onChangeText={set('confirm')} secureTextEntry             placeholder="Re-enter password"    error={errors.confirm} />

          <Button label={loading ? 'Creating Account…' : '✦ Create My Profile'} onPress={handleRegister} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.switchLink}>
            <Text style={s.switchText}>Already registered? <Text style={s.switchAccent}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ToastBanner message={toastMsg} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.deep },
  container:   { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 40 },
  logoArea:    { alignItems: 'center', marginBottom: 28 },
  logoTop:     { fontSize: 20, fontWeight: '700', color: C.white },
  logoBottom:  { fontSize: 20, fontWeight: '700', color: C.gold2, marginBottom: 6 },
  tagline:     { fontSize: 12, color: C.muted },
  card:        { backgroundColor: C.cardBg, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 24 },
  switchLink:  { marginTop: 20, alignItems: 'center' },
  switchText:  { fontSize: 13, color: C.muted },
  switchAccent:{ color: C.gold3, fontWeight: '600' },
});
