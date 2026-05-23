'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { notificationsApi } from '@/lib/api';

const NAV = [
  { href:'/',       label:'Home'        },
  { href:'/jobs',   label:'Browse Jobs' },
  { href:'/post',   label:'Post a Job'  },
  { href:'/profile',label:'My Profile'  },
];

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['notif-count'],
    queryFn:  () => notificationsApi.unreadCount(),
    refetchInterval: 30_000,   // poll every 30 s
    staleTime: 15_000,
  });

  const count = data?.count ?? 0;

  return (
    <Link href="/notifications" style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', width:'36px', height:'36px', borderRadius:'50%', textDecoration:'none', background:'rgba(255,255,255,0.04)', border:'1px solid var(--bf)', transition:'all 0.2s' }}>
      <span style={{ fontSize:'15px' }}>🔔</span>
      {count > 0 && (
        <span style={{
          position:'absolute', top:'-3px', right:'-3px',
          minWidth:'16px', height:'16px', borderRadius:'50%', padding:'0 4px',
          background:'linear-gradient(135deg,var(--gold),var(--gold2))',
          color:'var(--navy)', fontSize:'9px', fontWeight:800,
          display:'flex', alignItems:'center', justifyContent:'center',
          lineHeight:1, fontFamily:'Raleway,sans-serif',
        }}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

export function Navbar() {
  const path   = usePathname();
  const router = useRouter();
  const { isAuthenticated, isModerator, clearAuth } = useAuthStore();

  const handleLogout = () => { clearAuth(); router.push('/'); };

  const active = (href: string) =>
    href === '/' ? path === '/' : path === href || path.startsWith(href + '/');

  const linkStyle = (href: string): React.CSSProperties => ({
    padding:'8px 15px', borderRadius:'50px', fontSize:'11px', fontWeight:600,
    fontFamily:'Raleway,sans-serif', letterSpacing:'0.5px', textDecoration:'none',
    transition:'all 0.2s',
    color:      active(href) ? 'var(--gold3)'              : 'var(--muted)',
    background: active(href) ? 'rgba(212,160,23,0.08)'     : 'transparent',
    border:     active(href) ? '1px solid var(--border)'   : '1px solid transparent',
  });

  return (
    <nav style={{
      position:'sticky', top:0, zIndex:50,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 4%', height:'68px',
      background:'rgba(3,9,26,0.94)', backdropFilter:'blur(20px)',
      borderBottom:'1px solid var(--border)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration:'none' }}>
        <div style={{ fontFamily:'Cinzel,serif', fontWeight:700, fontSize:'12px', lineHeight:1.45, color:'#fff' }}>
          Sarva Moola<br />
          <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Udyoga Sakha
          </span>
        </div>
      </Link>

      {/* Links */}
      <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
        {NAV.map(l => <Link key={l.href} href={l.href} style={linkStyle(l.href)}>{l.label}</Link>)}

        {isModerator && (
          <Link href="/moderator" style={{
            padding:'8px 15px', borderRadius:'50px', fontSize:'11px', fontWeight:600,
            fontFamily:'Raleway,sans-serif', textDecoration:'none', transition:'all 0.2s',
            color:'var(--info)',
            background: path.startsWith('/moderator') ? 'rgba(96,165,250,0.15)' : 'rgba(96,165,250,0.08)',
            border:`1px solid rgba(96,165,250,${path.startsWith('/moderator') ? '0.5' : '0.3'})`,
          }}>
            🛡️ Moderator
          </Link>
        )}

        {/* Notification bell — only shown when logged in */}
        {isAuthenticated && <NotificationBell />}

        {/* Settings icon */}
        {isAuthenticated && (
          <Link href="/settings" style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:'36px', height:'36px', borderRadius:'50%', textDecoration:'none', fontSize:'15px',
            background: path === '/settings' ? 'rgba(212,160,23,0.12)' : 'rgba(255,255,255,0.04)',
            border:`1px solid ${path === '/settings' ? 'var(--border)' : 'var(--bf)'}`,
            transition:'all 0.2s',
          }}>
            ⚙️
          </Link>
        )}

        {isAuthenticated ? (
          <button onClick={handleLogout} style={{
            padding:'8px 15px', borderRadius:'50px', fontSize:'11px', fontWeight:600,
            fontFamily:'Raleway,sans-serif', background:'transparent', border:'none',
            color:'var(--muted)', cursor:'pointer', transition:'all 0.2s',
          }}>
            Sign Out
          </button>
        ) : (
          <Link href="/login" style={{
            padding:'8px 16px', borderRadius:'50px', fontSize:'11px', fontWeight:700,
            fontFamily:'Raleway,sans-serif', textDecoration:'none',
            background:'linear-gradient(135deg,var(--gold),var(--gold2))',
            color:'var(--navy)', boxShadow:'0 4px 14px var(--goldglow)',
            textTransform:'uppercase', letterSpacing:'0.8px',
          }}>
            Sign In →
          </Link>
        )}
      </div>
    </nav>
  );
}
