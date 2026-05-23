'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi, listingsApi, marketApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

type Tab = 'pending'|'approved'|'rejected'|'market'|'posts'|'stats';

const ICONS: Record<string,string> = { INTERN:'🎓', FRESHER:'🌱', JOB_SEEKER:'🔍', FREELANCER:'💻', CONSULTANT:'🧑‍💼', HIRING_MANAGER:'📊', RECRUITER:'🤝', TRAINER:'📚', VENDOR:'🏭', MODERATOR_ROLE:'🛡️', RFP_PROVIDER:'📋' };
const MKT: Record<string,string>   = { IT_FIELD:'IT', NON_IT_FIELD:'Non-IT', SERVICES:'Services' };

function MktPill({ f }: { f: string }) {
  const col = f?.startsWith('IT') ? { bg:'rgba(96,165,250,0.1)', bdr:'rgba(96,165,250,0.22)', c:'var(--info)' } : f?.startsWith('SERVICES') ? { bg:'rgba(245,158,11,0.1)', bdr:'rgba(245,158,11,0.2)', c:'var(--warn)' } : { bg:'rgba(74,222,128,0.1)', bdr:'rgba(74,222,128,0.2)', c:'var(--ok)' };
  return <span style={{ padding:'2px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:col.bg, border:`1px solid ${col.bdr}`, color:col.c }}>{MKT[f]||f}</span>;
}

function StatusPill({ s }: { s: string }) {
  return <span className={`status-${s.toLowerCase()}`} style={{ padding:'2px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700, display:'inline-flex', alignItems:'center', gap:'4px' }}>
    {s==='APPROVED'?'✅':s==='REJECTED'?'❌':'⏳'} {s}
  </span>;
}

function autoMF(seg: string) { return seg?.startsWith('IT') ? 'IT_FIELD' : seg?.startsWith('SERVICES') ? 'SERVICES' : 'NON_IT_FIELD'; }


function Pager({ page, total, limit, onPage }: { page:number; total:number; limit:number; onPage:(n:number)=>void }) {
  const pages = Math.max(1, Math.ceil(total/limit));
  if (pages <= 1) return null;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderTop:'1px solid var(--bf)' }}>
      <span style={{ fontSize:'11px', color:'var(--muted)' }}>{total} total · page {page} of {pages}</span>
      <div style={{ display:'flex', gap:'6px' }}>
        <button disabled={page===1} onClick={()=>onPage(page-1)} style={{ padding:'4px 10px', borderRadius:'6px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'11px', opacity:page===1?0.4:1 }}>← Prev</button>
        <button disabled={page===pages} onClick={()=>onPage(page+1)} style={{ padding:'4px 10px', borderRadius:'6px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'11px', opacity:page===pages?0.4:1 }}>Next →</button>
      </div>
    </div>
  );
}

const TABS: { key:Tab; label:string }[] = [
  { key:'pending',  label:'⏳ Pending Review' },
  { key:'approved', label:'✅ Approved'       },
  { key:'rejected', label:'❌ Rejected'       },
  { key:'market',   label:'📊 Market Mapping' },
  { key:'posts',    label:'📋 Job Posts'      },
  { key:'stats',    label:'📈 Statistics'     },
];

export default function ModeratorPage() {
  const [tab, setTab]   = useState<Tab>('pending');
  const [sel, setSel]   = useState<any>(null);
  const [pPage, setPPage] = useState(1);
  const [aPage, setAPage] = useState(1);
  const [rPage, setRPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const { toast }       = useToast();
  const qc              = useQueryClient();

  const pending  = useQuery({ queryKey:['mod','pending',pPage],  queryFn:()=>profilesApi.getPending({ page:pPage, limit:20 }) });
  const approved = useQuery({ queryKey:['mod','approved',aPage], queryFn:()=>profilesApi.getApproved({ page:aPage, limit:20 }) });
  const rejected = useQuery({ queryKey:['mod','rejected',rPage], queryFn:()=>profilesApi.getRejected({ page:rPage, limit:20 }) });
  const posts    = useQuery({ queryKey:['mod','posts',postsPage],queryFn:()=>listingsApi.getPending({ page:postsPage, limit:20 }) });
  const mktStats = useQuery({ queryKey:['mod','mktStats'], queryFn:marketApi.getStats,       enabled:tab==='market' });
  const mktAll   = useQuery({ queryKey:['mod','mktAll'],   queryFn:marketApi.getAllApproved, enabled:tab==='market' });
  const byRole   = useQuery({ queryKey:['mod','byRole'],   queryFn:marketApi.getByRole,      enabled:tab==='stats'  });

  const inv = () => { qc.invalidateQueries({ queryKey:['mod'] }); setSel(null); };

  const appMut = useMutation({ mutationFn:({ id,mf }:{id:string;mf:string})=>profilesApi.approve(id,mf), onSuccess:()=>{ toast('Profile approved!','ok'); inv(); } });
  const rejMut = useMutation({ mutationFn:({ id,r  }:{id:string;r:string})=>profilesApi.reject(id,r),   onSuccess:()=>{ toast('Profile rejected.','ok'); inv(); } });
  const reactMut = useMutation({ mutationFn:(id:string)=>profilesApi.reactivate(id), onSuccess:()=>{ toast('Re-opened for review.','ok'); inv(); } });
  const appPostMut = useMutation({ mutationFn:(id:string)=>listingsApi.approve(id), onSuccess:()=>{ toast('Post approved!','ok'); qc.invalidateQueries({ queryKey:['mod','posts'] }); } });

  const approve = (p: any) => appMut.mutate({ id:p.id, mf:autoMF(p.marketSegment) });
  const reject  = (p: any) => { const r=prompt('Reason for rejection:'); if(r?.trim()) rejMut.mutate({ id:p.id, r:r.trim() }); };

  function ProfileTable({ data, mode }: { data:any[]; mode:'approve'|'reactivate'|'view' }) {
    if (!data.length) return <div style={{ padding:'24px', textAlign:'center', fontSize:'12px', color:'var(--muted)' }}>No profiles found.</div>;
    return (
      <div style={{ overflowX:'auto' }}>
        <table className="rt">
          <thead>
            <tr>{['Name','Role','Applied For','Applied At','Market','Mode','Cert','Actions'].map(h=><th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((p:any) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight:600, color:'#fff' }}>{p.fullName}</div>
                  <div style={{ fontSize:'10px', color:'var(--muted)' }}>{p.city} · {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString('en-IN') : ''}</div>
                </td>
                <td><span style={{ padding:'2px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700, color:'var(--gold3)', background:'rgba(212,160,23,0.1)', border:'1px solid rgba(212,160,23,0.22)' }}>{ICONS[p.roleType]} {p.roleType?.replace(/_/g,' ')}</span></td>
                <td style={{ color:'var(--gold3)', fontWeight:600 }}>{p.appliedFor}</td>
                <td style={{ fontSize:'11px' }}>{p.appliedAt}</td>
                <td>{p.marketField ? <MktPill f={p.marketField} /> : <span style={{ color:'var(--faint)' }}>—</span>}</td>
                <td style={{ fontSize:'11px' }}>{p.workMode?.replace(/_/g,' ')}</td>
                <td style={{ fontSize:'11px' }}>{p.certificate}</td>
                <td>
                  <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                    <button onClick={()=>setSel(p)} style={{ padding:'5px 12px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.25)', color:'var(--info)' }}>👁</button>
                    {mode==='approve' && <>
                      <button onClick={()=>approve(p)} style={{ padding:'5px 12px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', color:'var(--ok)' }}>✅</button>
                      <button onClick={()=>reject(p)} style={{ padding:'5px 12px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.25)', color:'var(--err)' }}>❌</button>
                    </>}
                    {mode==='reactivate' && <button onClick={()=>reactMut.mutate(p.id)} style={{ padding:'5px 12px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)', color:'var(--info)' }}>🔄</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const pCount = pending.data?.total  ?? 0;
  const aCount = approved.data?.total ?? 0;
  const rCount = rejected.data?.total ?? 0;

  return (
    <div style={{ display:'flex', minHeight:'calc(100vh - 68px)' }}>
      {/* Sidebar */}
      <div style={{ width:'240px', flexShrink:0, padding:'20px 0', background:'linear-gradient(180deg,rgba(6,13,42,0.99),rgba(3,9,26,1))', borderRight:'1px solid var(--border)' }}>
        <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', fontWeight:700, color:'#fff', padding:'0 20px 14px', marginBottom:'10px', borderBottom:'1px solid var(--bf)', letterSpacing:'1px' }}>🛡️ Moderator Panel</div>
        {TABS.map(t=>(
          <div key={t.key} onClick={()=>setTab(t.key)} style={{
            display:'flex', alignItems:'center', gap:'10px', padding:'10px 20px',
            fontSize:'12px', fontWeight:500, cursor:'pointer', transition:'all 0.2s', position:'relative',
            color:tab===t.key?'var(--gold3)':'var(--muted)',
            background:tab===t.key?'rgba(212,160,23,0.07)':'transparent',
          }}>
            {tab===t.key && <span style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:'3px', borderRadius:'0 3px 3px 0', background:'linear-gradient(to bottom,var(--gold),var(--gold2))' }} />}
            {t.label}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex:1, overflowY:'auto', padding:'28px' }}>
        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'24px' }}>
          {[['⏳ Pending',pCount,'var(--warn)'],['✅ Approved',aCount,'var(--ok)'],['❌ Rejected',rCount,'var(--err)'],['Role Types',11,'var(--gold3)']].map(([l,n,c])=>(
            <div key={String(l)} className="gc" style={{ padding:'18px', textAlign:'center' }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'26px', fontWeight:700, lineHeight:1, marginBottom:'4px', background:`linear-gradient(135deg,${c},${c})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{n}</div>
              <div style={{ fontSize:'11px', color:'var(--muted)' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Tab content */}
        {tab==='pending' && <>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'18px' }}>⏳ Pending — Validate Profile Details</h2>
          <div className="gc" style={{ overflow:'hidden' }}>
            {pending.isLoading ? <div style={{ padding:'24px', textAlign:'center', color:'var(--muted)' }}>Loading…</div> : <><ProfileTable data={pending.data?.data??[]} mode="approve" /><Pager page={pPage} total={pending.data?.total??0} limit={20} onPage={setPPage} /></>}
          </div>
        </>}

        {tab==='approved' && <>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'18px' }}>✅ Approved & Published Profiles</h2>
          <div className="gc" style={{ overflow:'hidden' }}>
            {approved.isLoading ? <div style={{ padding:'24px', textAlign:'center', color:'var(--muted)' }}>Loading…</div> : <><ProfileTable data={approved.data?.data??[]} mode="view" /><Pager page={aPage} total={approved.data?.total??0} limit={20} onPage={setAPage} /></>}
          </div>
        </>}

        {tab==='rejected' && <>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'18px' }}>❌ Rejected Profiles</h2>
          <div className="gc" style={{ overflow:'hidden' }}>
            {rejected.isLoading ? <div style={{ padding:'24px', textAlign:'center', color:'var(--muted)' }}>Loading…</div> : <><ProfileTable data={rejected.data?.data??[]} mode="reactivate" /><Pager page={rPage} total={rejected.data?.total??0} limit={20} onPage={setRPage} /></>}
          </div>
        </>}

        {tab==='market' && <>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'18px' }}>📊 Market Mapping</h2>
          {mktStats.data && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'18px', marginBottom:'24px' }}>
              {[
                { icon:'🌐', label:'IT Field',     n:mktStats.data.profilesByMarket?.IT_FIELD??0,     desc:'Developers · Designers · Product Owners · AI/ML' },
                { icon:'🎨', label:'Non-IT Field', n:mktStats.data.profilesByMarket?.NON_IT_FIELD??0, desc:'Arts · Commerce · Education · Healthcare · Engineering' },
                { icon:'🤝', label:'Services',     n:mktStats.data.profilesByMarket?.SERVICES??0,     desc:'Consultancy · Training · Recruitment · Vendor' },
              ].map(s=>(
                <div key={s.label} className="gc" style={{ padding:'22px' }}>
                  <div style={{ fontSize:'28px', marginBottom:'8px' }}>{s.icon}</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>{s.label}</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'30px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'8px' }}>{s.n}</div>
                  <div style={{ fontSize:'11px', color:'var(--muted)', lineHeight:1.6, fontWeight:300 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          )}
          {mktAll.data && (
            <div className="gc" style={{ overflow:'hidden' }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#fff', padding:'22px 22px 16px' }}>All Approved Profiles</div>
              <div style={{ overflowX:'auto' }}>
                <table className="rt">
                  <thead><tr>{['Name','Role','Applied For','Applied At','Market','Mode','Cert','Employment'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(mktAll.data?.data??[]).map((p:any)=>(
                      <tr key={p.id}>
                        <td style={{ fontWeight:600, color:'#fff' }}>{p.fullName}</td>
                        <td><span style={{ padding:'2px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700, color:'var(--gold3)', background:'rgba(212,160,23,0.1)', border:'1px solid rgba(212,160,23,0.22)' }}>{ICONS[p.roleType]} {p.roleType?.replace(/_/g,' ')}</span></td>
                        <td style={{ color:'var(--gold3)' }}>{p.appliedFor}</td>
                        <td style={{ fontSize:'11px' }}>{p.appliedAt}</td>
                        <td>{p.marketField && <MktPill f={p.marketField} />}</td>
                        <td style={{ fontSize:'11px' }}>{p.workMode?.replace(/_/g,' ')}</td>
                        <td style={{ fontSize:'11px', color:p.certificate==='YES'?'var(--ok)':'var(--muted)' }}>{p.certificate}</td>
                        <td style={{ fontSize:'11px', color:p.employmentOption==='EXISTS'?'var(--ok)':'var(--muted)' }}>{p.employmentOption?.replace(/_/g,' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>}

        {tab==='posts' && <>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'18px' }}>📋 Job Posts Review</h2>
          <div className="gc" style={{ overflow:'hidden' }}>
            {posts.isLoading ? <div style={{ padding:'24px', textAlign:'center', color:'var(--muted)' }}>Loading…</div> : !posts.data?.length ? (
              <div style={{ padding:'24px', textAlign:'center', fontSize:'12px', color:'var(--muted)' }}>No pending posts.</div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table className="rt">
                  <thead><tr>{['Organisation','Title','Role','Mode','Payment','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(posts.data?.data??[]).map((p:any)=>(
                      <tr key={p.id}>
                        <td style={{ fontWeight:600, color:'#fff' }}>{p.organisationName}</td>
                        <td style={{ color:'var(--gold3)' }}>{p.title}</td>
                        <td><span style={{ padding:'2px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700, color:'var(--gold3)', background:'rgba(212,160,23,0.1)', border:'1px solid rgba(212,160,23,0.22)' }}>{p.targetRoleType?.replace(/_/g,' ')}</span></td>
                        <td style={{ fontSize:'11px' }}>{p.workMode?.replace(/_/g,' ')}</td>
                        <td style={{ fontSize:'11px' }}>{p.payment}</td>
                        <td><StatusPill s={p.status} /></td>
                        <td><button onClick={()=>appPostMut.mutate(p.id)} style={{ padding:'5px 12px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', color:'var(--ok)' }}>✅ Approve</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>}

        {tab==='stats' && <>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'18px' }}>📈 Profiles by Role Type</h2>
          {byRole.isLoading ? <div style={{ color:'var(--muted)' }}>Loading…</div> : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:'14px' }}>
              {(byRole.data??[]).map((r:any)=>(
                <div key={r.role} className="gc" style={{ padding:'18px', textAlign:'center' }}>
                  <div style={{ fontSize:'28px', marginBottom:'8px' }}>{ICONS[r.role]||'💼'}</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', fontWeight:700, color:'#fff', marginBottom:'6px' }}>{r.role?.replace(/_/g,' ')}</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{r.count}</div>
                  <div style={{ fontSize:'10px', color:'var(--ok)', marginTop:'4px' }}>✅ approved</div>
                </div>
              ))}
            </div>
          )}
        </>}
      </div>

      {/* Profile detail modal */}
      {sel && (
        <div onClick={()=>setSel(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e=>e.stopPropagation()} style={{ borderRadius:'22px', width:'100%', maxWidth:'720px', maxHeight:'88vh', overflowY:'auto', position:'relative', background:'linear-gradient(160deg,rgba(13,30,90,0.98),rgba(6,13,42,0.99))', border:'1px solid var(--border)', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', borderRadius:'22px 22px 0 0', background:'linear-gradient(90deg,transparent,var(--gold),var(--gold3),var(--gold),transparent)' }} />
            <button onClick={()=>setSel(null)} style={{ position:'absolute', top:'14px', right:'14px', width:'30px', height:'30px', borderRadius:'50%', border:'1px solid var(--bf)', background:'rgba(255,255,255,0.06)', color:'var(--muted)', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>✕</button>
            <div style={{ padding:'26px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', marginBottom:'20px', paddingBottom:'18px', borderBottom:'1px solid var(--bf)' }}>
                <div style={{ width:'80px', height:'80px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'34px', flexShrink:0, background:'linear-gradient(135deg,rgba(29,62,160,0.5),rgba(45,107,228,0.4))', border:'3px solid var(--border)' }}>{ICONS[sel.roleType]}</div>
                <div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'3px' }}>{sel.fullName}</div>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, color:'var(--gold3)', background:'rgba(212,160,23,0.1)', border:'1px solid rgba(212,160,23,0.25)', marginBottom:'6px' }}>{ICONS[sel.roleType]} {sel.roleType?.replace(/_/g,' ')}</span>
                  <div style={{ fontSize:'12px', color:'var(--muted)' }}>📍 {sel.city} · Submitted {sel.submittedAt ? new Date(sel.submittedAt).toLocaleDateString('en-IN') : '—'} · ID: <strong style={{ color:'var(--gold3)' }}>{sel.id?.slice(-8)}</strong></div>
                </div>
              </div>

              <div style={{ fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, color:'var(--gold3)', marginBottom:'10px', paddingBottom:'7px', borderBottom:'1px solid rgba(212,160,23,0.1)' }}>⬛ Submission Details</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px' }}>
                {[['📌 Applied For',sel.appliedFor],['🏢 Applied At',sel.appliedAt],['💰 Payment',sel.payment],['📜 Certificate',sel.certificate],['🏠 Mode',sel.workMode?.replace(/_/g,' ')],['➡️ Employment',sel.employmentOption?.replace(/_/g,' ')],['📊 Market Seg',sel.marketSegment?.replace(/_/g,' ')],['🛠 Skills',(sel.skills??[]).join(', ')||'—']].map(([l,v])=>(
                  <div key={String(l)}>
                    <div style={{ fontSize:'9px', fontWeight:700, color:'var(--faint)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'3px' }}>{l}</div>
                    <div style={{ fontSize:'12px', color:'var(--offwhite)', fontWeight:500 }}>{v||'—'}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:'10px', paddingTop:'18px', borderTop:'1px solid var(--bf)' }}>
                <button onClick={()=>approve(sel)} style={{ flex:1, padding:'12px', borderRadius:'11px', border:'none', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, letterSpacing:'1px', color:'var(--navy)', background:'linear-gradient(135deg,var(--ok),#22C55E)', boxShadow:'0 4px 14px rgba(74,222,128,0.3)' }}>✅ Approve</button>
                <button onClick={()=>reject(sel)}  style={{ flex:1, padding:'12px', borderRadius:'11px', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, letterSpacing:'1px', color:'var(--err)', background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.3)' }}>❌ Reject</button>
                <button onClick={()=>setSel(null)} style={{ flex:1, padding:'12px', borderRadius:'11px', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, color:'var(--muted)', background:'rgba(255,255,255,0.05)', border:'1px solid var(--bf)' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
