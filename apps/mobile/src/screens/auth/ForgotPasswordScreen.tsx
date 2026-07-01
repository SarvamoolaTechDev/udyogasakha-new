import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '@/lib/api';
import { Input, Button, useToast, ToastBanner } from '@/components/UI';
import { C } from '@/theme/colors';

export function ForgotPasswordScreen({ navigation }: any) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');
  const { toast, toastMsg } = useToast();

  const handleSubmit = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
    } catch {
      // Intentionally ignore server errors — always show the same generic
      // confirmation to prevent account enumeration (same as web behaviour).
    } finally {
      setLoading(false);
      setDone(true);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoArea}>
          <Text style={s.logoTop}>Sarvamoola</Text>
          <Text style={s.logoBottom}>Udyoga Sakha</Text>
          <Text style={s.tagline}>Reset your password</Text>
        </View>

        <View style={s.card}>
          {done ? (
            /* Success state — generic message regardless of whether email exists */
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 40, marginBottom: 16 }}>📧</Text>
              <Text style={s.successTitle}>Check your inbox</Text>
              <Text style={s.successBody}>
                If an account exists with that email, a password reset link has been sent. The link expires in 1 hour.
              </Text>
              <Text style={s.successNote}>
                The reset link will open the Sarvamoola Udyoga Sakha website — complete the reset there, then sign in here with your new password.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.backLink}>
                <Text style={s.backLinkTxt}>← Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Form state */
            <>
              <Text style={s.helpText}>
                Enter the email associated with your account and we'll send you a link to reset your password.
              </Text>

              <Input
                label="Email Address"
                value={email}
                onChangeText={v => { setEmail(v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="you@example.com"
                error={error}
              />

              <Button
                label={loading ? 'Sending…' : 'Send Reset Link →'}
                onPress={handleSubmit}
                loading={loading}
              />

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.backLink}>
                <Text style={s.backLinkTxt}>← Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <ToastBanner message={toastMsg} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.deep },
  scroll:       { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 40 },
  logoArea:     { alignItems: 'center', marginBottom: 28 },
  logoTop:      { fontSize: 20, fontWeight: '700', color: C.white },
  logoBottom:   { fontSize: 20, fontWeight: '700', color: C.gold2, marginBottom: 6 },
  tagline:      { fontSize: 12, color: C.muted },
  card:         { backgroundColor: C.cardBg, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 24 },
  helpText:     { fontSize: 13, color: C.muted, lineHeight: 20, marginBottom: 20 },
  successTitle: { fontSize: 18, fontWeight: '700', color: C.white, marginBottom: 10, textAlign: 'center' },
  successBody:  { fontSize: 13, color: C.offwhite, lineHeight: 20, textAlign: 'center', marginBottom: 14 },
  successNote:  { fontSize: 11, color: C.muted, lineHeight: 18, textAlign: 'center', backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 10, padding: 12, marginBottom: 20 },
  backLink:     { alignItems: 'center', marginTop: 20 },
  backLinkTxt:  { fontSize: 13, color: C.gold3, fontWeight: '600' },
});
