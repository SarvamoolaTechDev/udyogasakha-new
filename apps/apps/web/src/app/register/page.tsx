'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setTokens } = useAuthStore();
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[k]:e.target.value}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { const t = await authApi.register(form); setTokens(t); router.push('/profile'); }
    catch (err: any) { setError(err?.response?.data?.message ?? 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 16px', background:'var(--deep)' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'#fff' }}>Sarva Moola</div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'8px' }}>Udyoga Sakha</div>
          <p style={{ fontSize:'12px', color:'var(--muted)' }}>Join 4.8 Lakh+ professionals — it's free</p>
        </div>
        <div className="gc" style={{ padding:'32px' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div><label className="il">Full Name *</label><input value={form.name} onChange={set('name')} required className="fi" placeholder="Your Full Name" /></div>
            <div><label className="il">Email *</label><input value={form.email} onChange={set('email')} type="email" required className="fi" placeholder="you@example.com" /></div>
            <div><label className="il">Mobile</label><input value={form.phone} onChange={set('phone')} className="fi" placeholder="+91 98765 43210" /></div>
            <div><label className="il">Password *</label><input value={form.password} onChange={set('password')} type="password" required className="fi" placeholder="Minimum 8 characters" /></div>
            {error && <p style={{ color:'var(--err)', fontSize:'12px', margin:0 }}>{error}</p>}
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
