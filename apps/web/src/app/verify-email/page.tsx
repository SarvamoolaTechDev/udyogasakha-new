'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function VerifyEmailPage() {
  const params  = useSearchParams();
  const token   = params.get('token');
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', padding:'40px', textAlign:'center' }}>
      {status === 'loading' && (
        <>
          <div style={{ fontSize:'48px' }}>⏳</div>
          <p style={{ color:'var(--muted)', fontSize:'13px' }}>Verifying your email…</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div style={{ fontSize:'48px' }}>✅</div>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'22px', fontWeight:700, color:'var(--offwhite)' }}>Email Verified</h2>
          <p style={{ color:'var(--muted)', fontSize:'13px' }}>Your email address has been verified successfully.</p>
          <Link href="/profile" className="btn-gold" style={{ padding:'12px 28px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>
            Continue →
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize:'48px' }}>❌</div>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'22px', fontWeight:700, color:'var(--offwhite)' }}>Link Invalid or Expired</h2>
          <p style={{ color:'var(--muted)', fontSize:'13px' }}>This verification link has expired or already been used.</p>
          <Link href="/profile" className="btn-gold" style={{ padding:'12px 28px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>
            Go to Profile →
          </Link>
        </>
      )}
    </div>
  );
}