'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { SkeletonCard } from '@/components/ui/Skeleton';

const WMODE_LABELS: Record<string,string> = { WFH:'WFH', ON_SITE:'On-Site', HYBRID:'Hybrid', OFF_SITE:'Off-Site' };
const MF_LABELS:    Record<string,string> = { IT_FIELD:'IT', NON_IT_FIELD:'Non-IT', SERVICES:'Services' };
const MF_COLORS:    Record<string,string> = { IT_FIELD:'rgba(37,99,235,0.08)', NON_IT_FIELD:'rgba(217,119,6,0.08)', SERVICES:'rgba(22,163,74,0.08)' };
const MF_TEXT:      Record<string,string> = { IT_FIELD:'var(--info)', NON_IT_FIELD:'var(--warn)', SERVICES:'var(--ok)' };

export default function BrowseAdsPage() {
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch]   = useState('');
  const [query,  setQuery]    = useState('');
  const [mode,   setMode]     = useState('');
  const [page,   setPage]     = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['ads-browse', query, mode, page],
    queryFn:  () => adsApi.browse({ search: query||undefined, workMode: mode||undefined, page, limit: 18 }),
    enabled:  isAuthenticated,
  });

  const ads: any[]    = (data as any)?.data ?? [];
  const totalPages    = (data as any)?.totalPages ?? 1;
  const total: number = (data as any)?.total ?? 0;

  if (!isAuthenticated) return (
    <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px', gap:'16px' }}>
      <div style={{ fontSize:'48px' }}>🔐</div>
      <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, color:'var(--offwhite)' }}>Sign In to Browse Ads</h2>
      <Link href="/login?from=/ads" className="btn-gold" style={{ padding:'12px 28px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>Sign In →</Link>
    </div>
  );

  return (
    <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'36px 4%' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--gold2)' }}>Job Seekers</span>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,3vw,38px)', fontWeight:700, color:'var(--offwhite)', marginTop:'6px', marginBottom:'6px' }}>
            Browse <span style={{ background:'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Ads</span>
          </h1>
          <p style={{ fontSize:'12px', color:'var(--muted)' }}>{total} active ads · Click an ad to view full details</p>
        </div>
        <Link href="/ads/create" className="btn-gold" style={{ padding:'10px 22px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>+ Post My Ad</Link>
      </div>

      {/* Search + filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:'220px', display:'flex', alignItems:'center', gap:'8px', background:'#fff', border:'1px solid var(--border)', borderRadius:'50px', padding:'10px 18px' }}>
          <span style={{ color:'var(--faint)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') { setQuery(search); setPage(1); } }}
            placeholder="Search by title, skill, location…"
            style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:'13px', color:'var(--offwhite)' }} />
          {search && <button onClick={() => { setSearch(''); setQuery(''); setPage(1); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--faint)', fontSize:'16px' }}>✕</button>}
        </div>
        <button onClick={() => { setQuery(search); setPage(1); }} className="btn-gold" style={{ padding:'10px 20px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>Search</button>
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
        {[['','All Modes'],['WFH','WFH'],['ON_SITE','On-Site'],['HYBRID','Hybrid'],['OFF_SITE','Off-Site']].map(([v,l]) => (
          <button key={v} onClick={() => { setMode(v); setPage(1); }} style={{
            padding:'5px 14px', borderRadius:'50px', border:'1px solid', fontSize:'11px', fontWeight:600, cursor:'pointer',
            background:  mode===v ? 'rgba(200,146,10,0.1)' : 'transparent',
            borderColor: mode===v ? 'var(--border)' : 'var(--bf)',
            color:       mode===v ? 'var(--gold3)' : 'var(--muted)',
          }}>{l}</button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' }}>
          {Array.from({length:6}).map((_,i) => <SkeletonCard key={i} height="180px" />)}
        </div>
      ) : ads.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--muted)' }}>No ads found. Be the first to post one!</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' }}>
          {ads.map((ad: any) => (
            <Link key={ad.id} href={`/ads/${ad.id}`} style={{ textDecoration:'none' }}>
              <div className="gc gc-hover" style={{ padding:'22px', cursor:'pointer', height:'100%' }}>
                {/* Market + mode */}
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                  <span style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background: MF_COLORS[ad.marketField], color: MF_TEXT[ad.marketField], border:`1px solid ${MF_TEXT[ad.marketField]}33` }}>
                    {MF_LABELS[ad.marketField] ?? ad.marketField}
                  </span>
                  <span style={{ fontSize:'10px', color: ad.daysRemaining <= 3 ? 'var(--warn)' : 'var(--faint)' }}>
                    {ad.daysRemaining}d left
                  </span>
                </div>

                <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'var(--offwhite)', marginBottom:'4px' }}>{ad.title}</h3>
                <div style={{ fontSize:'11px', color:'var(--muted)', marginBottom:'8px' }}>
                  {ad.user?.name} · {WMODE_LABELS[ad.workMode]} {ad.location && `· 📍 ${ad.location}`}
                </div>

                {ad.salaryExpect && (
                  <div style={{ fontSize:'12px', fontWeight:600, color:'var(--gold3)', marginBottom:'8px' }}>{ad.salaryExpect}</div>
                )}

                {/* Skills */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'12px' }}>
                  {(ad.skills as string[]).slice(0,4).map((s:string) => (
                    <span key={s} style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'9px', background:'rgba(0,0,0,0.04)', border:'1px solid var(--bf)', color:'var(--muted)' }}>{s}</span>
                  ))}
                  {(ad.skills as string[]).length > 4 && <span style={{ fontSize:'9px', color:'var(--faint)' }}>+{(ad.skills as string[]).length-4}</span>}
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'10px', borderTop:'1px solid var(--bf)', fontSize:'10px', color:'var(--faint)' }}>
                  <span>👁 {ad.viewCount} views · 📇 {ad.unlockCount} contact views</span>
                  <span style={{ color:'var(--gold3)', fontWeight:600 }}>View →</span>
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
