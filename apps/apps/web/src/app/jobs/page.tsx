'use client';
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { JobCard } from '@/components/ui/JobCard';

const ROLES    = [['INTERN','🎓 Intern'],['FRESHER','🌱 Fresher'],['JOB_SEEKER','🔍 Job Seeker'],['FREELANCER','💻 Freelancer'],['CONSULTANT','🧑‍💼 Consultant'],['TRAINER','📚 Trainer'],['RFP_PROVIDER','📋 RFP']];
const MARKETS  = [['IT_FIELD','🌐 IT Field'],['NON_IT_FIELD','🎨 Non-IT'],['SERVICES','🤝 Services']];
const MODES    = [['WFH','🏠 WFH'],['ON_SITE','🏢 On-Site'],['HYBRID','🔀 Hybrid'],['OFF_SITE','🌍 Off-Site']];
const PAYMENTS = [['PAID','💰 Paid'],['STIPEND','🎓 Stipend'],['UNPAID','🆓 Unpaid']];
const CERTS    = [['YES','📜 Certificate']];

function Pill({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
  return (
    <div onClick={onClick} className={`filter-pill ${active ? 'filter-pill-on' : 'filter-pill-off'}`}>
      {label}
    </div>
  );
}

export default function JobsPage() {
  const [search, setSearch]   = useState('');
  const [view, setView]       = useState<'grid'|'list'>('grid');
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState<Record<string,string>>({});
  const debRef = useRef<ReturnType<typeof setTimeout>>();

  const { data, isLoading } = useQuery({
    queryKey: ['listings', filters, page],
    queryFn:  () => listingsApi.browse({ ...filters, page, limit:20 }),
    placeholderData: (prev: any) => prev,
  });

  const listings   = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const toggle = (key: string, val: string) =>
    setFilters(f => { const n={...f}; f[key]===val ? delete n[key] : (n[key]=val); setPage(1); return n; });

  const onSearch = (v: string) => {
    setSearch(v);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      setFilters(f => { const n={...f}; v ? n.search=v : delete n.search; return n; });
      setPage(1);
    }, 400);
  };

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 68px)' }}>
      {/* Sidebar */}
      <div style={{ width:'260px', flexShrink:0, display:'flex', flexDirection:'column', background:'linear-gradient(180deg,rgba(6,13,42,0.99),rgba(3,9,26,1))', borderRight:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', borderBottom:'1px solid var(--bf)', position:'sticky', top:'68px', background:'rgba(6,13,42,0.99)', zIndex:10 }}>
          <span style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'#fff' }}>🔧 Filters</span>
          <span onClick={()=>{setFilters({}); setPage(1);}} style={{ fontSize:'10px', color:'var(--gold3)', cursor:'pointer', padding:'3px 10px', borderRadius:'50px', background:'rgba(212,160,23,0.08)', border:'1px solid var(--border)' }}>Clear</span>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
          {([['Role Type',ROLES,'role'],['Market',MARKETS,'market'],['Mode',MODES,'mode'],['Payment',PAYMENTS,'paid'],['Certificate',CERTS,'cert']] as [string,[string,string][],string][]).map(([label, items, key]) => (
            <div key={key} style={{ marginBottom:'20px' }}>
              <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--gold3)', marginBottom:'10px' }}>{label}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                {items.map(([val,lbl]) => <Pill key={val} label={lbl} active={filters[key]===val} onClick={()=>toggle(key,val)} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
        {/* Topbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px', padding:'16px 24px', position:'sticky', top:'68px', zIndex:10, background:'rgba(6,13,42,0.7)', backdropFilter:'blur(10px)', borderBottom:'1px solid var(--bf)' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#fff' }}>
            Showing <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{total}</span> Listings
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {/* Search */}
            <div style={{ display:'flex', alignItems:'center', gap:'7px', borderRadius:'50px', padding:'8px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--bf)' }}>
              <span style={{ fontSize:'13px', color:'var(--faint)' }}>🔍</span>
              <input value={search} onChange={e=>onSearch(e.target.value)} placeholder="Search jobs, skills…"
                style={{ background:'transparent', border:'none', outline:'none', color:'var(--offwhite)', fontSize:'12px', width:'180px', fontFamily:'Raleway,sans-serif' }} />
            </div>
            {/* View toggle */}
            <div style={{ display:'flex', borderRadius:'8px', overflow:'hidden', background:'rgba(255,255,255,0.04)', border:'1px solid var(--bf)' }}>
              {(['grid','list'] as const).map(v => (
                <button key={v} onClick={()=>setView(v)} style={{ width:'32px', height:'32px', border:'none', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', background:view===v?'rgba(212,160,23,0.12)':'transparent', color:view===v?'var(--gold3)':'var(--muted)' }}>
                  {v==='grid'?'⊞':'☰'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ flex:1, padding:'20px 24px' }}>
          {isLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' }}>
              {[...Array(6)].map((_,i) => <div key={i} className="gc" style={{ height:'280px', animation:'pulse 1.5s ease infinite' }} />)}
            </div>
          ) : !listings.length ? (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:'48px', marginBottom:'14px' }}>🔍</div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>No Listings Found</div>
              <p style={{ fontSize:'13px', color:'var(--muted)' }}>Try adjusting your filters or search.</p>
            </div>
          ) : (
            <div style={{ display:view==='grid'?'grid':'flex', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', flexDirection:'column', gap:'16px' }}>
              {listings.map((j: any) => <JobCard key={j.id} job={j} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'8px', marginTop:'24px' }}>
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="btn-outline" style={{ padding:'8px 16px', borderRadius:'50px', fontSize:'12px', cursor:'pointer', opacity:page===1?0.4:1 }}>← Prev</button>
              <span style={{ fontSize:'12px', color:'var(--muted)', padding:'0 8px' }}>{page} / {totalPages}</span>
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="btn-outline" style={{ padding:'8px 16px', borderRadius:'50px', fontSize:'12px', cursor:'pointer', opacity:page===totalPages?0.4:1 }}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
