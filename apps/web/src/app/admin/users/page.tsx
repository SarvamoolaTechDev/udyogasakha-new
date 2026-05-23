'use client';
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usersApi } from '@/lib/api';
import { SkeletonRow } from '@/components/ui/Skeleton';

const ROLE_STYLE: Record<string,{ bg:string; color:string }> = {
  ADMIN:       { bg:'rgba(255,107,107,0.12)', color:'var(--err)'  },
  MODERATOR:   { bg:'rgba(96,165,250,0.12)',  color:'var(--info)' },
  PARTICIPANT: { bg:'rgba(212,160,23,0.08)',  color:'var(--gold3)'},
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [query,  setQuery]  = useState('');
  const [page,   setPage]   = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', query, page],
    queryFn:  () => usersApi.list({ search: query || undefined, page, limit: 25 }),
    placeholderData: (prev: any) => prev,
  });

  const users: any[]  = (data as any)?.data       ?? [];
  const total: number = (data as any)?.total       ?? 0;
  const totalPages    = (data as any)?.totalPages  ?? 1;

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setQuery(v); setPage(1); }, 400);
  };

  return (
    <section style={{ padding:'48px 4%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(20px,3vw,32px)', fontWeight:700, color:'#fff', margin:0 }}>
            User <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Management</span>
          </h1>
          <p style={{ fontSize:'12px', color:'var(--muted)', marginTop:'4px' }}>{total} registered users</p>
        </div>

        {/* Search */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', borderRadius:'50px', padding:'9px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--bf)' }}>
          <span style={{ fontSize:'13px', color:'var(--faint)' }}>🔍</span>
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            style={{ background:'transparent', border:'none', outline:'none', color:'var(--offwhite)', fontSize:'12px', width:'220px', fontFamily:'Raleway,sans-serif' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="gc" style={{ overflow:'hidden' }}>
        <div className="table-scroll">
          <table className="rt">
            <thead>
              <tr>
                {['Name & Email','Phone','City','Roles','Profiles','Joined',''].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'32px', color:'var(--muted)' }}>No users found.</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight:600, color:'#fff' }}>{u.name}</div>
                      <div style={{ fontSize:'10px', color:'var(--muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ fontSize:'11px', color:'var(--muted)' }}>{u.phone || '—'}</td>
                    <td style={{ fontSize:'11px', color:'var(--muted)' }}>{u.city  || '—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                        {(u.roles ?? []).map((r: string) => {
                          const s = ROLE_STYLE[r] ?? { bg:'rgba(255,255,255,0.05)', color:'var(--muted)' };
                          return (
                            <span key={r} style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:s.bg, color:s.color }}>
                              {r}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ fontSize:'11px', color:'var(--muted)', textAlign:'center' }}>
                      {u.profiles?.length ?? '—'}
                    </td>
                    <td style={{ fontSize:'11px', color:'var(--muted)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' }) : '—'}
                    </td>
                    <td>
                      <Link href={`/admin/users/${u.id}`} style={{ fontSize:'10px', color:'var(--gold3)', textDecoration:'none', fontWeight:600 }}>View →</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderTop:'1px solid var(--bf)' }}>
            <span style={{ fontSize:'11px', color:'var(--muted)' }}>{total} users · page {page} of {totalPages}</span>
            <div style={{ display:'flex', gap:'6px' }}>
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ padding:'5px 12px', borderRadius:'8px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'11px', opacity:page===1?0.4:1 }}>← Prev</button>
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} style={{ padding:'5px 12px', borderRadius:'8px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'11px', opacity:page===totalPages?0.4:1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
