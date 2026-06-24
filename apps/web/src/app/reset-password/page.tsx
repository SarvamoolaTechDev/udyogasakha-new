'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { PasswordInput } from '@/components/ui/PasswordInput';

type FormValues = { newPassword: string; confirm: string };

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{msg}</p> : null;

function ResetPasswordForm() {
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const newPassword = watch('newPassword');

  const onSubmit = async (data: FormValues) => {
    if (!token) { setServerError('Reset link is missing a token. Please request a new one.'); return; }
    setLoading(true); setServerError('');
    try {
      await authApi.resetPassword(token, data.newPassword);
      setDone(true);
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'This reset link is invalid or has expired. Please request a new one.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', background:'var(--deep)' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'#fff' }}>Sarva Moola</div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'8px' }}>Udyoga Sakha</div>
          <p style={{ fontSize:'12px', color:'var(--muted)' }}>Set a new password</p>
        </div>

        <div className="gc" style={{ padding:'32px' }}>
          {!token ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'40px', marginBottom:'14px' }}>⚠️</div>
              <p style={{ fontSize:'13px', color:'var(--err)', lineHeight:1.7, marginBottom:'18px' }}>
                This link is missing its reset token. Please request a new password reset link.
              </p>
              <Link href="/forgot-password" className="btn-gold" style={{ display:'inline-block', padding:'12px 24px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>
                Request New Link →
              </Link>
            </div>
          ) : done ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'40px', marginBottom:'14px' }}>✅</div>
              <p style={{ fontSize:'14px', color:'var(--offwhite)', lineHeight:1.8, marginBottom:'18px' }}>
                Password reset successfully. You can now sign in with your new password.
              </p>
              <Link href="/login" className="btn-gold" style={{ display:'inline-block', padding:'12px 24px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>
                Sign In →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label className="il">New Password</label>
                <PasswordInput
                  {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                  className="fi"
                  placeholder="Minimum 8 characters"
                  style={{ borderColor: errors.newPassword ? 'var(--err)' : undefined }}
                />
                <Err msg={errors.newPassword?.message} />
              </div>
              <div>
                <label className="il">Confirm New Password</label>
                <PasswordInput
                  {...register('confirm', { required: 'Please confirm your new password', validate: v => v === newPassword || 'Passwords do not match' })}
                  className="fi"
                  placeholder="Re-enter new password"
                  style={{ borderColor: errors.confirm ? 'var(--err)' : undefined }}
                />
                <Err msg={errors.confirm?.message} />
              </div>

              {serverError && (
                <div style={{ padding:'10px 14px', borderRadius:'10px', background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.3)', fontSize:'12px', color:'var(--err)' }}>
                  {serverError}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-gold" style={{ padding:'13px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', opacity:loading?0.6:1 }}>
                {loading ? 'Resetting…' : 'Reset Password →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
