'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { useAdminAuthStore } from '@/store/auth.store';
import { PasswordInput } from '@/components/ui/PasswordInput';

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{msg}</p> : null;

export default function AdminLoginPage() {
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]         = useState(false);
  const router = useRouter();
  const { setTokens } = useAdminAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true); setServerError('');
    try {
      const tokens = await authApi.login(data);
      setTokens(tokens);
      // setTokens will reject if role is not MODERATOR/ADMIN
      const { isAuthenticated } = useAdminAuthStore.getState();
      if (!isAuthenticated) {
        setServerError('Access denied. This portal is for Moderators and Admins only.');
      } else {
        router.push('/moderation');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      if (status === 401) {
        setServerError('Invalid credentials. Please try again.');
      } else if (serverMsg) {
        setServerError(`Server error: ${Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg}`);
      } else if (err?.message === 'Network Error' || !err?.response) {
        setServerError('Could not reach the server. Check your connection or try again shortly.');
      } else {
        setServerError(`Unexpected error (status ${status ?? 'unknown'}). Please try again.`);
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', background:'var(--deep)' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'#fff' }}>Sarva Moola</div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'10px' }}>
            Udyoga Sakha
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'4px 14px', borderRadius:'50px', background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.3)', fontSize:'10px', fontWeight:700, color:'var(--err)', letterSpacing:'1.5px', textTransform:'uppercase' }}>
            🔐 Admin Portal
          </div>
        </div>

        <div className="gc" style={{ padding:'32px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label className="il">Email Address</label>
              <input
                {...register('email', { required:'Email is required', pattern: { value:/^\S+@\S+\.\S+$/, message:'Enter a valid email' } })}
                type="email" className="fi" placeholder="admin@udyogasakha.in"
                style={{ borderColor: errors.email ? 'var(--err)' : undefined }}
              />
              <Err msg={errors.email?.message} />
            </div>
            <div>
              <label className="il">Password</label>
              <PasswordInput
                {...register('password', { required:'Password is required' })}
                className="fi" placeholder="••••••••"
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
              {loading ? 'Signing In…' : 'Sign In to Admin Portal →'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:'14px' }}>
            <Link href="/forgot-password" style={{ color:'var(--faint)', textDecoration:'none', fontSize:'11px' }}>Forgot password?</Link>
          </div>

          <p style={{ textAlign:'center', marginTop:'18px', fontSize:'11px', color:'var(--faint)', lineHeight:1.6 }}>
            Access restricted to Moderators and Admins only.<br />
            Member portal: <a href="http://localhost:3000" style={{ color:'var(--gold3)', textDecoration:'none' }}>localhost:3000</a>
          </p>
        </div>
      </div>
    </div>
  );
}
