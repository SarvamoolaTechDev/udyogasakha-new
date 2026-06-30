'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/auth.store';

const LINKS = [
  { href: '/moderation', icon: '🛡️', label: 'Moderation' },
  { href: '/users',      icon: '👥', label: 'Users'       },
  { href: '/payments',   icon: '💳', label: 'Payments'    },
  { href: '/audit',      icon: '📋', label: 'Audit Log'   },
];

export function AdminNav() {
  const path   = usePathname();
  const router = useRouter();
  const { clearAuth, isAdmin } = useAdminAuthStore();

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  return (
    <aside style={{
      width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg,rgba(6,13,42,0.99),rgba(3,9,26,1))',
      borderRight: '1px solid var(--border)', minHeight: '100vh',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--bf)' }}>
        <div style={{ fontFamily: 'Cinzel,serif', fontSize: '11px', fontWeight: 700, color: '#fff', lineHeight: 1.5 }}>
          Sarva Moola<br />
          <span style={{ background: 'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Udyoga Sakha
          </span>
        </div>
        <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 9px', borderRadius: '50px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', fontSize: '9px', fontWeight: 700, color: 'var(--err)' }}>
          🔐 {isAdmin ? 'ADMIN' : 'MODERATOR'} PORTAL
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '14px 0' }}>
        {LINKS.map(l => {
          const on = path === l.href || path.startsWith(l.href + '/');
          return (
            <Link key={l.href} href={l.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px',
              fontSize: '12px', fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s', position: 'relative',
              color: on ? 'var(--gold3)' : 'var(--muted)',
              background: on ? 'rgba(212,160,23,0.07)' : 'transparent',
            }}>
              {on && <span style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '3px', borderRadius: '0 3px 3px 0', background: 'linear-gradient(to bottom,var(--gold),var(--gold2))' }} />}
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--bf)' }}>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '9px', borderRadius: '50px', border: '1px solid var(--bf)',
          background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
          fontSize: '11px', fontFamily: 'Raleway,sans-serif', fontWeight: 600,
        }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

/**
 * AdminShell — renders sidebar + content for all routes EXCEPT /login.
 * Must be a client component to read the pathname.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isLoginPage = path === '/login';

  if (isLoginPage) {
    // Login page: full-screen, no sidebar
    return (
      <div style={{ minHeight: '100vh', background: 'var(--deep)' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminNav />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--deep)' }}>
        {children}
      </main>
    </div>
  );
}
