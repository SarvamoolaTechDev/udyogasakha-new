'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { talentApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { SkeletonCard } from '@/components/ui/Skeleton';

const ROLE_FILTERS = [
  ['', 'All Roles'], ['JOB_SEEKER','Job Seeker'], ['FRESHER','Fresher'],
  ['INTERN','Intern'], ['CONSULTANT','Consultant'], ['TRAINER','Trainer'],
  ['RECRUITER','Recruiter'], ['VENDOR','Vendor'],
];
const MARKET_FILTERS = [['','Any Market'],['IT_FIELD','IT Field'],['NON_IT_FIELD','Non-IT'],['SERVICES','Services']];
const MODE_FILTERS   = [['','Any Mode'],['WFH','WFH'],['ON_SITE','On-Site'],['HYBRID','Hybrid'],];

const MARKET_COLOR: Record<string, string> = {
  IT_FIELD:     'rgba(37,99,235,0.1)',
  NON_IT_FIELD: 'rgba(217,119,6,0.1)',
  SERVICES:     'rgba(22,163,74,0.1)',
};

export default function TalentPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [search,  setSearch]  = useState('');
  const [query,   setQuery]   = useState('');
  const [role,    setRole]    = useState('');
  const [market,  setMarket]  = useState('');
  const [mode,    setMode]    = useState('');
  const [page,    setPage]    = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['talent', query, role, market, mode, page],
    queryFn:  () => talentApi.browse({ search: query||undefined, roleType: role||undefined, marketField: market||undefined, workMode: mode||undefined, page, limit: 18 }),
    enabled:  isAuthenticated,
  });

  const candidates: any[] = (data as any)?.data ?? [];
  const total: number     = (data as any)?.total ?? 0;
  const totalPages        = (data as any)?.totalPages ?? 1;

  if (!isAuthenticated) return (
    <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', padding:'40px' }}>
      <div style={{ fontSize:'48px' }}>🔐</div>
      <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, color:'var(--offwhite)' }}>Sign In to Find Talent</h2>
      <p style={{ color:'var(--muted)', fontSize:'14px', textAlign:'center', maxWidth:'400px', lineHeight:1.7 }}>
        Browse verified candidate profiles across all 11 role types. Unlock contact details with your wallet points.
      </p>
      <Link href="/login?from=/talent" className="btn-gold" style={{ padding:'12px 28px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>Sign In →</Link>
    </div>
  );

  return (
    <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'36px 4%' }}>
      {/* Header */}
      <div style={{ marginBottom:'32px' }}>
        <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--gold2)' }}>Talent Search</span>
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(24px,3vw,40px)', fontWeight:700, color:'var(--offwhite)', marginTop:'6px', marginBottom:'8px' }}>
          Find <span style={{ background:'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Talent</span>
        </h1>
        <p style={{ fontSize:'13px', color:'var(--muted)' }}>{total} verified candidates · Unlock contact details for 30 points</p>
      </div>

      {/* Search bar */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:'240px', display:'flex', alignItems:'center', gap:'8px', background:'#fff', border:'1px solid var(--border)', borderRadius:'50px', padding:'10px 18px' }}>
          <span style={{ color:'var(--faint)', fontSize:'14px' }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') { setQuery(search); setPage(1); } }}
            placeholder="Search by name, skills, city…"
            style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:'13px', color:'var(--offwhite)' }}
          />
          {search && <button onClick={() => { setSearch(''); setQuery(''); setPage(1); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--faint)', fontSize:'16px' }}>✕</button>}
        </div>
        <button onClick={() => { setQuery(search); setPage(1); }} className="btn-gold" style={{ padding:'10px 20px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>Search</button>
      </div>

      {/* Role pills */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px' }}>
        {ROLE_FILTERS.map(([v,l]) => (
          <button key={v} onClick={() => { setRole(v); setPage(1); }} style={{
            padding:'6px 14px', borderRadius:'50px', border:'1px solid', fontSize:'11px', fontWeight:600, cursor:'pointer',
            background:  role===v ? 'rgba(200,146,10,0.1)' : 'transparent',
            borderColor: role===v ? 'var(--border)' : 'var(--bf)',
            color:       role===v ? 'var(--gold3)' : 'var(--muted)',
          }}>{l}</button>
        ))}
      </div>

      {/* Market + Mode filters */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px' }}>
        {[...MARKET_FILTERS, ...MODE_FILTERS].map(([v,l]) => {
          const isMarket = MARKET_FILTERS.some(f => f[0]===v);
          const active   = isMarket ? market===v : mode===v;
          const toggle   = () => { if (isMarket) { setMarket(v); } else { setMode(v); } setPage(1); };
          return (
            <button key={v+l} onClick={toggle} style={{ padding:'5px 12px', borderRadius:'50px', border:'1px solid', fontSize:'10px', fontWeight:600, cursor:'pointer', background: active?'rgba(200,146,10,0.08)':'transparent', borderColor: active?'var(--border)':'var(--bf)', color: active?'var(--gold3)':'var(--muted)' }}>{l}</button>
          );
        })}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
          {Array.from({length:9}).map((_,i) => <SkeletonCard key={i} height="160px" />)}
        </div>
      ) : candidates.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--muted)' }}>No candidates found matching your filters.</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
          {candidates.map((c: any) => (
            <Link key={c.id} href={`/talent/${c.id}`} style={{ textDecoration:'none' }}>
              <div className="gc gc-hover" style={{ padding:'22px', cursor:'pointer', height:'100%' }}>
                {/* Role + market badge */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <span style={{ padding:'3px 10px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:'rgba(200,146,10,0.08)', color:'var(--gold3)', border:'1px solid var(--border)' }}>
                    {c.roleType?.replace(/_/g,' ')}
                  </span>
                  <span style={{ padding:'3px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background: MARKET_COLOR[c.marketField] ?? 'rgba(0,0,0,0.04)', color:'var(--muted)', border:'1px solid var(--bf)' }}>
                    {c.marketField?.replace('_FIELD','').replace('_',' ')}
                  </span>
                </div>

                {/* Name */}
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'var(--offwhite)', marginBottom:'4px' }}>{c.fullName}</div>

                {/* Location + work mode */}
                <div style={{ fontSize:'11px', color:'var(--muted)', marginBottom:'10px' }}>
                  {c.city && `📍 ${c.city} · `}{c.workMode?.replace(/_/g,' ')}
                </div>

                {/* Skills */}
                {c.skills?.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'10px' }}>
                    {c.skills.slice(0,4).map((s: string) => (
                      <span key={s} style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'9px', background:'rgba(0,0,0,0.04)', border:'1px solid var(--bf)', color:'var(--muted)' }}>{s}</span>
                    ))}
                    {c.skills.length > 4 && <span style={{ fontSize:'9px', color:'var(--faint)' }}>+{c.skills.length-4}</span>}
                  </div>
                )}

                <div style={{ fontSize:'10px', color:'var(--faint)', marginTop:'auto', paddingTop:'10px', borderTop:'1px solid var(--bf)', display:'flex', alignItems:'center', gap:'6px' }}>
                  <span>🔒</span> Unlock contact details · 30 pts
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'32px' }}>
          <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={{ padding:'8px 16px', borderRadius:'50px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'12px', opacity:page===1?0.4:1 }}>← Prev</button>
          <span style={{ padding:'8px 16px', fontSize:'12px', color:'var(--muted)' }}>Page {page} of {totalPages}</span>
          <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} style={{ padding:'8px 16px', borderRadius:'50px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'12px', opacity:page===totalPages?0.4:1 }}>Next →</button>
        </div>
      )}
    </div>
  );
}
