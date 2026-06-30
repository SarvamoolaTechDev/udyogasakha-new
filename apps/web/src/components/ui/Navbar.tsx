'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { notificationsApi } from '@/lib/api';

const NAV = [
  { href:'/',        label:'Home'        },
  { href:'/jobs',    label:'Browse Jobs' },
  { href:'/post',    label:'Post a Job'  },
  { href:'/profile', label:'My Profile'  },
];

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['notif-count'],
    queryFn:  () => notificationsApi.unreadCount(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const count = (data as any)?.count ?? 0;

  return (
    <Link href="/notifications" style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', width:'36px', height:'36px', borderRadius:'50%', textDecoration:'none', background:'rgba(255,255,255,0.04)', border:'1px solid var(--bf)', transition:'all 0.2s', flexShrink:0 }}>
      <span style={{ fontSize:'15px' }}>🔔</span>
      {count > 0 && (
        <span style={{ position:'absolute', top:'-3px', right:'-3px', minWidth:'16px', height:'16px', borderRadius:'50%', padding:'0 4px', background:'linear-gradient(135deg,var(--gold),var(--gold2))', color:'var(--navy)', fontSize:'9px', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const path   = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => { clearAuth(); setOpen(false); router.push('/'); };
  const close = () => setOpen(false);

  const active = (href: string) =>
    href === '/' ? path === '/' : path === href || path.startsWith(href + '/');

  const linkBase: React.CSSProperties = {
    padding:'8px 15px', borderRadius:'50px', fontSize:'11px', fontWeight:600,
    fontFamily:'Raleway,sans-serif', letterSpacing:'0.5px', textDecoration:'none', transition:'all 0.2s',
  };
  const linkStyle = (href: string): React.CSSProperties => ({
    ...linkBase,
    color:      active(href) ? 'var(--gold3)' : 'var(--muted)',
    background: active(href) ? 'rgba(212,160,23,0.08)' : 'transparent',
    border:     active(href) ? '1px solid var(--border)' : '1px solid transparent',
  });

  return (
    <>
      <nav style={{ position:'sticky', top:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 4%', height:'68px', background:'rgba(3,9,26,0.94)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' }}>
        {/* Logo */}
        <Link href="/" onClick={close} style={{ textDecoration:'none', flexShrink:0 }}>
          <div style={{ fontFamily:'Cinzel,serif', fontWeight:700, fontSize:'12px', lineHeight:1.45, color:'#fff' }}>
            Sarvamoola<br />
            <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Udyoga Sakha</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="desktop-nav" style={{ display:'flex', alignItems:'center', gap:'4px' }}>
          {NAV.map(l => <Link key={l.href} href={l.href} style={linkStyle(l.href)}>{l.label}</Link>)}

          {isAuthenticated && <NotificationBell />}

          {isAuthenticated && (
            <Link href="/settings" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'36px', height:'36px', borderRadius:'50%', textDecoration:'none', fontSize:'15px', background: path==='/settings' ? 'rgba(212,160,23,0.12)' : 'rgba(255,255,255,0.04)', border:`1px solid ${path==='/settings'?'var(--border)':'var(--bf)'}`, transition:'all 0.2s', flexShrink:0 }}>
              ⚙️
            </Link>
          )}

          {isAuthenticated ? (
            <button onClick={handleLogout} style={{ ...linkBase, background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer' }}>Sign Out</button>
          ) : (
            <Link href="/login" style={{ ...linkBase, background:'linear-gradient(135deg,var(--gold),var(--gold2))', color:'var(--navy)', boxShadow:'0 4px 14px var(--goldglow)', textTransform:'uppercase', letterSpacing:'0.8px', border:'none' }}>
              Sign In →
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="mobile-nav-controls" style={{ display:'none', alignItems:'center', gap:'10px' }}>
          {isAuthenticated && <NotificationBell />}
          <button onClick={() => setOpen(v => !v)} aria-label="Toggle menu" style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', gap:'5px', padding:'4px' }}>
            <span style={{ display:'block', width:'22px', height:'2px', background: open ? 'var(--gold2)' : 'var(--muted)', borderRadius:'2px', transition:'all 0.2s', transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ display:'block', width:'22px', height:'2px', background: open ? 'transparent' : 'var(--muted)', borderRadius:'2px', transition:'all 0.2s' }} />
            <span style={{ display:'block', width:'22px', height:'2px', background: open ? 'var(--gold2)' : 'var(--muted)', borderRadius:'2px', transition:'all 0.2s', transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div style={{ position:'fixed', top:'68px', left:0, right:0, zIndex:49, background:'rgba(3,9,26,0.98)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', padding:'16px 4%', display:'flex', flexDirection:'column', gap:'6px' }}>
          {NAV.map(l => <Link key={l.href} href={l.href} onClick={close} style={{ ...linkStyle(l.href), display:'block', padding:'12px 16px' }}>{l.label}</Link>)}
          <div style={{ height:'1px', background:'var(--bf)', margin:'4px 0' }} />
          {isAuthenticated && <Link href="/settings" onClick={close} style={{ ...linkBase, display:'block', padding:'12px 16px', border:'1px solid transparent' }}>⚙️ Settings</Link>}
          {isAuthenticated ? (
            <button onClick={handleLogout} style={{ ...linkBase, textAlign:'left', background:'transparent', border:'none', color:'var(--err)', cursor:'pointer', padding:'12px 16px', width:'100%' }}>Sign Out</button>
          ) : (
            <Link href="/login" onClick={close} style={{ ...linkBase, display:'block', padding:'12px 16px', textAlign:'center', background:'linear-gradient(135deg,var(--gold),var(--gold2))', color:'var(--navy)', boxShadow:'0 4px 14px var(--goldglow)', textTransform:'uppercase', border:'none' }}>Sign In →</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-controls { display: flex !important; }
        }
      `}</style>
    </>
  );
}
