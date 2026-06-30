'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';

type FormValues = { email: string };

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{msg}</p> : null;

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try { await authApi.forgotPassword(data.email); }
    catch { /* always show generic confirmation regardless of outcome */ }
    finally { setLoading(false); setDone(true); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px', background:'var(--deep)' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'#fff' }}>Sarvamoola</div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'10px' }}>Udyoga Sakha</div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'4px 14px', borderRadius:'50px', background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.3)', fontSize:'10px', fontWeight:700, color:'var(--err)', letterSpacing:'1.5px', textTransform:'uppercase' }}>
            🔐 Admin Portal
          </div>
        </div>

        <div className="gc" style={{ padding:'32px' }}>
          {done ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'40px', marginBottom:'14px' }}>📧</div>
              <p style={{ fontSize:'14px', color:'var(--offwhite)', lineHeight:1.8, marginBottom:'8px' }}>
                If an account exists with that email, a reset link has been sent.
              </p>
              <p style={{ fontSize:'12px', color:'var(--muted)', lineHeight:1.7 }}>
                Check your inbox and click the link to set a new password. The link expires in 1 hour.
              </p>
              <Link href="/login" style={{ display:'inline-block', marginTop:'22px', color:'var(--gold3)', fontWeight:600, textDecoration:'none', fontSize:'12px' }}>
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.7, marginBottom:'20px' }}>
                Enter the email associated with your moderator/admin account.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div>
                  <label className="il">Email Address</label>
                  <input
                    {...register('email', { required:'Email is required', pattern:{ value:/^\S+@\S+\.\S+$/, message:'Enter a valid email address' } })}
                    type="email" className="fi" placeholder="admin@udyogasakha.in"
                    style={{ borderColor: errors.email ? 'var(--err)' : undefined }}
                  />
                  <Err msg={errors.email?.message} />
                </div>
                <button type="submit" disabled={loading} className="btn-gold" style={{ padding:'13px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', opacity:loading?0.6:1 }}>
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </form>
              <div style={{ textAlign:'center', marginTop:'20px' }}>
                <Link href="/login" style={{ color:'var(--gold3)', fontWeight:600, textDecoration:'none', fontSize:'12px' }}>← Back to Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
