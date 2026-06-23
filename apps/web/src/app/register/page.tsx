'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { PasswordInput } from '@/components/ui/PasswordInput';

type FormValues = { name: string; email: string; phone?: string; password: string; confirm: string };

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{msg}</p> : null;

export default function RegisterPage() {
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setTokens } = useAuthStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const password = watch('password');

  const onSubmit = async ({ confirm: _, ...data }: FormValues) => {
    setLoading(true); setServerError('');
    try {
      const tokens = await authApi.register(data);
      setTokens(tokens);
      router.push('/profile');
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 16px', background:'var(--deep)' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'#fff' }}>Sarva Moola</div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'8px' }}>Udyoga Sakha</div>
          <p style={{ fontSize:'12px', color:'var(--muted)' }}>Join 4.8 Lakh+ professionals — it&apos;s free</p>
        </div>

        <div className="gc" style={{ padding:'32px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div>
              <label className="il">Full Name *</label>
              <input {...register('name', { required:'Name is required', maxLength:{ value:100, message:'Name too long' } })} className="fi" placeholder="Your Full Name" style={{ borderColor: errors.name ? 'var(--err)' : undefined }} />
              <Err msg={errors.name?.message} />
            </div>
            <div>
              <label className="il">Email *</label>
              <input {...register('email', { required:'Email is required', pattern:{ value:/^\S+@\S+\.\S+$/, message:'Enter a valid email' } })} type="email" className="fi" placeholder="you@example.com" style={{ borderColor: errors.email ? 'var(--err)' : undefined }} />
              <Err msg={errors.email?.message} />
            </div>
            <div>
              <label className="il">Mobile</label>
              <input {...register('phone', { maxLength:{ value:20, message:'Phone number too long' } })} className="fi" placeholder="+91 98765 43210" />
              <Err msg={errors.phone?.message} />
            </div>
            <div>
              <label className="il">Password *</label>
              <PasswordInput {...register('password', { required:'Password is required', minLength:{ value:8, message:'Minimum 8 characters' } })} className="fi" placeholder="Minimum 8 characters" style={{ borderColor: errors.password ? 'var(--err)' : undefined }} />
              <Err msg={errors.password?.message} />
            </div>
            <div>
              <label className="il">Confirm Password *</label>
              <PasswordInput {...register('confirm', { required:'Please confirm your password', validate: v => v === password || 'Passwords do not match' })} className="fi" placeholder="Re-enter password" style={{ borderColor: errors.confirm ? 'var(--err)' : undefined }} />
              <Err msg={errors.confirm?.message} />
            </div>

            {serverError && (
              <div style={{ padding:'10px 14px', borderRadius:'10px', background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.3)', fontSize:'12px', color:'var(--err)' }}>
                {serverError}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold" style={{ padding:'13px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', marginTop:'4px', opacity:loading?0.6:1 }}>
              {loading ? 'Creating Account…' : '✦ Create My Profile'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'12px', color:'var(--muted)' }}>
            Already registered?{' '}
            <Link href="/login" style={{ color:'var(--gold3)', fontWeight:600, textDecoration:'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
