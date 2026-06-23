'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { PasswordInput } from '@/components/ui/PasswordInput';

type FormValues = { email: string; password: string };

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{msg}</p> : null;

function LoginForm() {
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const { setTokens } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true); setServerError('');
    try {
      const tokens = await authApi.login(data);
      setTokens(tokens);
      router.push(params.get('from') ?? '/profile');
    } catch {
      setServerError('Invalid credentials. Please check your email and password.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', background:'var(--deep)' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'#fff' }}>Sarva Moola</div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'8px' }}>Udyoga Sakha</div>
          <p style={{ fontSize:'12px', color:'var(--muted)' }}>Sign in to access your career profile</p>
        </div>

        <div className="gc" style={{ padding:'32px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label className="il">Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern:  { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
                type="email"
                className="fi"
                placeholder="you@example.com"
                style={{ borderColor: errors.email ? 'var(--err)' : undefined }}
              />
              <Err msg={errors.email?.message} />
            </div>
            <div>
              <label className="il">Password</label>
              <PasswordInput
                {...register('password', { required: 'Password is required' })}
                className="fi"
                placeholder="••••••••"
                style={{ borderColor: errors.password ? 'var(--err)' : undefined }}
              />
              <Err msg={errors.password?.message} />
            </div>

            {serverError && (
              <div style={{ padding:'10px 14px', borderRadius:'10px', background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.3)', fontSize:'12px', color:'var(--err)' }}>
                {serverError}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold" style={{ padding:'13px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', marginTop:'4px', opacity:loading?0.6:1 }}>
              {loading ? 'Signing In…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:'20px' }}>
            <span style={{ fontSize:'12px', color:'var(--muted)' }}>No account? </span>
            <Link href="/register" style={{ color:'var(--gold3)', fontWeight:600, textDecoration:'none', fontSize:'12px' }}>Register</Link>
          </div>
          <div style={{ textAlign:'center', marginTop:'10px' }}>
            <Link href="/settings" style={{ color:'var(--faint)', textDecoration:'none', fontSize:'11px' }}>Forgot password? Change it in Settings after login.</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
