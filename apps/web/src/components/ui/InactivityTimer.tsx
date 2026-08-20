'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const INACTIVE_MS  = 10 * 60 * 1000;  // 10 minutes idle before warning
const COUNTDOWN_S  = 120;              // 2-minute countdown before logout

export function InactivityTimer() {
  const { isAuthenticated, clearAuth } = useAuthStore();
  const router   = useRouter();
  const [visible,   setVisible]   = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_S);

  const warningTimer  = useRef<ReturnType<typeof setTimeout>>();
  const countdownRef  = useRef<ReturnType<typeof setInterval>>();
  const countdownVal  = useRef(COUNTDOWN_S);

  const logout = useCallback(() => {
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;
    clearTimeout(warningTimer.current);
    clearInterval(countdownRef.current);
    setVisible(false);
    setCountdown(COUNTDOWN_S);
    countdownVal.current = COUNTDOWN_S;

    warningTimer.current = setTimeout(() => {
      setVisible(true);
      countdownRef.current = setInterval(() => {
        countdownVal.current -= 1;
        setCountdown(countdownVal.current);
        if (countdownVal.current <= 0) {
          clearInterval(countdownRef.current);
          logout();
        }
      }, 1000);
    }, INACTIVE_MS);
  }, [isAuthenticated, logout]);

  const stayActive = () => {
    resetTimer();
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => resetTimer();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      clearTimeout(warningTimer.current);
      clearInterval(countdownRef.current);
    };
  }, [isAuthenticated, resetTimer]);

  if (!visible || !isAuthenticated) return null;

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid rgba(200,146,10,0.3)', padding: '36px 32px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '44px', marginBottom: '14px' }}>⏳</div>
        <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: '18px', fontWeight: 700, color: 'var(--offwhite)', marginBottom: '10px' }}>
          Still There?
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '20px' }}>
          You've been inactive. For your security you'll be logged out in:
        </p>
        <div style={{ fontFamily: 'Cinzel,serif', fontSize: '48px', fontWeight: 700, color: countdown <= 30 ? 'var(--err)' : 'var(--offwhite)', marginBottom: '24px', letterSpacing: '2px' }}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={stayActive}
            className="btn-gold"
            style={{ padding: '14px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '13px', fontFamily: 'Raleway,sans-serif', fontWeight: 700 }}>
            Keep Me Logged In
          </button>
          <button onClick={logout}
            style={{ padding: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--muted)', fontFamily: 'Raleway,sans-serif' }}>
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}