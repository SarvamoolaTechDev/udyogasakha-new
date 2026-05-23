'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router       = useRouter();
  const params       = useSearchParams();
  const { setTokens } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const tokens = await authApi.login({ email, password });
      setTokens(tokens);
      router.push(params.get('from') ?? '/profile');
    } catch {
      setError('Invalid credentials. Please check and try again.');
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
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label className="il">Email Address</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="fi" placeholder="you@example.com" />
            </div>
            <div>
              <label className="il">Password</label>
              <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="fi" placeholder="••••••••" />
            </div>
            {error && <p style={{ color:'var(--err)', fontSize:'12px', margin:0 }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn-gold" style={{ padding:'13px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', marginTop:'4px', opacity:loading?0.6:1 }}>
              {loading ? 'Signing In…' : 'Sign In →'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'12px', color:'var(--muted)' }}>
            No account?{' '}
            <Link href="/register" style={{ color:'var(--gold3)', fontWeight:600, textDecoration:'none' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
