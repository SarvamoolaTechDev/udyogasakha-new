import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api';
import { Input, Button, useToast, ToastBanner } from '@/components/UI';
import { C } from '@/theme/colors';

export function LoginScreen({ navigation }: any) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState<any>({});
  const [loading,  setLoading]  = useState(false);
  const { setTokens } = useAuthStore();
  const { toast, toastMsg } = useToast();

  const validate = () => {
    const e: any = {};
    if (!email.trim())     e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password.trim())  e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const tokens = await authApi.login({ email: email.trim(), password });
      await setTokens(tokens);
    } catch {
      toast('Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.logoArea}>
          <Text style={s.logoTop}>Sarvamoola</Text>
          <Text style={s.logoBottom}>Udyoga Sakha</Text>
          <Text style={s.tagline}>Sign in to your career profile</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Input label="Email Address" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
            placeholder="you@example.com" error={errors.email} />
          <Input label="Password" value={password} onChangeText={setPassword}
            secureTextEntry placeholder="••••••••" error={errors.password} />

          <Button label={loading ? 'Signing In…' : 'Sign In →'} onPress={handleLogin} loading={loading} />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={[s.switchLink, { marginTop: 14 }]}>
            <Text style={s.forgotTxt}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.switchLink}>
            <Text style={s.switchText}>No account? <Text style={s.switchAccent}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ToastBanner message={toastMsg} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.deep },
  container:   { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoArea:    { alignItems: 'center', marginBottom: 32 },
  logoTop:     { fontSize: 22, fontWeight: '700', color: C.white },
  logoBottom:  { fontSize: 22, fontWeight: '700', color: C.gold2, marginBottom: 8 },
  tagline:     { fontSize: 13, color: C.muted },
  card:        { backgroundColor: C.cardBg, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 24 },
  switchLink:  { marginTop: 20, alignItems: 'center' },
  switchText:  { fontSize: 13, color: C.muted },
  switchAccent:{ color: C.gold3, fontWeight: '600' },
  forgotTxt:   { fontSize: 12, color: C.faint },
});
