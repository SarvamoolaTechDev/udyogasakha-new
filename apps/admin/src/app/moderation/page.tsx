'use client';
import React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi, listingsApi, marketApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { SkeletonRow } from '@/components/ui/Skeleton';

type Tab = 'pending' | 'approved' | 'rejected' | 'market' | 'posts' | 'stats';

const TABS: { key: Tab; label: string }[] = [
  { key:'pending',  label:'⏳ Pending'        },
  { key:'approved', label:'✅ Approved'        },
  { key:'rejected', label:'❌ Rejected'        },
  { key:'market',   label:'📊 Market Mapping'  },
  { key:'posts',    label:'📋 Job Posts'       },
  { key:'stats',    label:'📈 Statistics'      },
];

const MF_LABEL: Record<string,string> = { IT_FIELD:'IT', NON_IT_FIELD:'Non-IT', SERVICES:'Services' };
const MF_COLOR: Record<string,{ bg:string; border:string; color:string }> = {
  IT_FIELD:     { bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.22)',  color:'var(--info)' },
  NON_IT_FIELD: { bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.2)',   color:'var(--ok)'   },
  SERVICES:     { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.2)',   color:'var(--warn)' },
};
const ROLE_ICONS: Record<string,string> = {
  INTERN:'🎓', FRESHER:'🌱', JOB_SEEKER:'🔍', FREELANCER:'💻', CONSULTANT:'🧑‍💼',
  HIRING_MANAGER:'📊', RECRUITER:'🤝', TRAINER:'📚', VENDOR:'🏭', MODERATOR_ROLE:'🛡️', RFP_PROVIDER:'📋',
};

function MktPill({ f }: { f?: string }) {
  if (!f) return <span style={{ fontSize:'13px', color:'var(--faint)' }}>—</span>;
  const s = MF_COLOR[f] ?? { bg:'rgba(255,255,255,0.05)', border:'var(--bf)', color:'var(--muted)' };
  return <span style={{ padding:'2px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>{MF_LABEL[f] ?? f}</span>;
}

function Pager({ page, total, limit, onPage }: { page:number; total:number; limit:number; onPage:(n:number)=>void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderTop:'1px solid var(--bf)' }}>
      <span style={{ fontSize:'13px', color:'var(--muted)' }}>{total} total · page {page} of {pages}</span>
      <div style={{ display:'flex', gap:'6px' }}>
        <button disabled={page===1} onClick={()=>onPage(page-1)} style={{ padding:'4px 10px', borderRadius:'6px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'13px', opacity:page===1?0.4:1 }}>← Prev</button>
        <button disabled={page===pages} onClick={()=>onPage(page+1)} style={{ padding:'4px 10px', borderRadius:'6px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'13px', opacity:page===pages?0.4:1 }}>Next →</button>
      </div>
    </div>
  );
}


// ── Moderation modal helper components ────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'8px', paddingBottom:'4px', borderBottom:'1px solid var(--bf)' }}>{title}</div>
    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>{children}</div>
  </div>
);
const Grid2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>{children}</div>
);
const F = ({ l, v }: { l: string; v: any }) => v ? (
  <div><div style={{ fontSize:'10px', fontWeight:700, color:'var(--faint)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px' }}>{l}</div><div style={{ fontSize:'13px', color:'var(--offwhite)', fontWeight:500, lineHeight:1.5 }}>{String(v)}</div></div>
) : null;


// ── Profile Detail Modal ──────────────────────────────────────────────────────
function ProfileDetailModal({ sel, onClose, onApprove, onReject, onRemove }: {
  sel: any; onClose: () => void;
  onApprove: () => void; onReject: () => void; onRemove: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['profile-detail', sel.id],
    queryFn:  () => profilesApi.getFullById(sel.id),
  });
  const d = data as any;

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div onClick={e=>e.stopPropagation()} style={{ borderRadius:'22px', width:'100%', maxWidth:'680px', maxHeight:'88vh', overflowY:'auto', background:'#FFFFFF', border:'1px solid var(--border)', boxShadow:'0 40px 100px rgba(0,0,0,0.8)', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', borderRadius:'22px 22px 0 0', background:'linear-gradient(90deg,transparent,var(--gold),var(--gold3),var(--gold),transparent)' }} />
        <button onClick={onClose} style={{ position:'absolute', top:'14px', right:'14px', width:'30px', height:'30px', borderRadius:'50%', border:'1px solid var(--bf)', background:'rgba(255,255,255,0.06)', color:'var(--muted)', cursor:'pointer', fontSize:'14px', zIndex:10 }}>✕</button>

        <div style={{ padding:'26px' }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid var(--bf)' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'var(--offwhite)', marginBottom:'4px' }}>{sel.fullName}</div>
              <div style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'6px' }}>
                {sel.roleType?.replace(/_/g,' ')} · {sel.city} · Submitted {sel.submittedAt ? new Date(sel.submittedAt).toLocaleDateString('en-IN') : '—'}
              </div>
              <span style={{ padding:'2px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, background:'rgba(200,146,10,0.08)', color:'var(--gold3)', border:'1px solid rgba(200,146,10,0.2)' }}>
                {sel.marketField} · {sel.marketSegment?.replace(/_/g,' ')}
              </span>
            </div>
          </div>

          {/* Detail sections */}
          {isLoading ? (
            <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)', fontSize:'13px' }}>Loading full details…</div>
          ) : d ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'20px' }}>

              <DS title="Contact & Personal">
                <DG2>
                  <DF l="Phone"         v={d.user?.phone} />
                  <DF l="Email"         v={d.user?.email} />
                  <DF l="Date of Birth" v={d.dateOfBirth} />
                  <DF l="Gender"        v={d.gender} />
                </DG2>
              </DS>

              <DS title="Profile Details">
                <DG2>
                  <DF l="Applied For"         v={d.appliedFor} />
                  <DF l="Work Mode"            v={d.workMode?.replace(/_/g,' ')} />
                  <DF l="Payment Preference"   v={d.payment} />
                  <DF l="Employment Option"    v={d.employmentOption?.replace(/_/g,' ')} />
                  <DF l="Preferred Location"   v={d.preferredLocation} />
                  <DF l="Market Segment"       v={d.marketSegment?.replace(/_/g,' ')} />
                </DG2>
                <DF l="Skills" v={Array.isArray(d.skills) ? d.skills.join(', ') : d.skills} />
                {d.summary && <DF l="About" v={d.summary} />}
              </DS>

              <DS title="Education">
                <DG2>
                  <DF l="Highest Degree"  v={d.highestDegree} />
                  <DF l="Specialization"  v={d.specialization} />
                  <DF l="Institution"     v={d.institution} />
                  <DF l="Year of Passing" v={d.yearOfPassing} />
                  <DF l="Grade / CGPA"    v={d.grade} />
                </DG2>
              </DS>

              {d.roleFields && Object.keys(d.roleFields as object).length > 0 && (
                <DS title="Role-Specific Details">
                  <DG2>
                    {Object.entries(d.roleFields as object).map(([k,v]) => (
                      <DF key={k} l={k.replace(/_/g,' ')} v={String(v)} />
                    ))}
                  </DG2>
                </DS>
              )}

              {d.experiences?.length > 0 && (
                <DS title="Experience">
                  {d.experiences.map((exp: any) => (
                    <div key={exp.id} style={{ padding:'12px', background:'rgba(200,146,10,0.04)', borderRadius:'10px', border:'1px solid var(--bf)', marginBottom:'8px' }}>
                      <div style={{ fontWeight:700, fontSize:'13px', color:'var(--offwhite)' }}>{exp.title} — {exp.company}</div>
                      <div style={{ fontSize:'13px', color:'var(--muted)', margin:'3px 0' }}>{exp.fromDate}{exp.toDate ? ` → ${exp.toDate}` : ' → Present'}</div>
                      {exp.description && <div style={{ fontSize:'13px', color:'var(--offwhite)', lineHeight:1.6, marginTop:'4px' }}>{exp.description}</div>}
                    </div>
                  ))}
                </DS>
              )}

              {d.documents?.length > 0 && (
                <DS title="Documents">
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {d.documents.map((doc: any) => (
                      <span key={doc.id} style={{ padding:'4px 12px', borderRadius:'50px', fontSize:'13px', background:'rgba(200,146,10,0.07)', border:'1px solid var(--border)', color:'var(--muted)' }}>
                        📄 {doc.documentType.replace(/_/g,' ')} — {doc.filename}
                      </span>
                    ))}
                  </div>
                </DS>
              )}
            </div>
          ) : null}

          {/* Action buttons */}
          <div style={{ display:'flex', gap:'10px', paddingTop:'16px', borderTop:'1px solid var(--bf)' }}>
            {sel.status === 'APPROVED' ? (
              <>
                <button onClick={onRemove} style={{ flex:1, padding:'12px', borderRadius:'11px', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--err)', background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.3)' }}>Remove Profile</button>
                <button onClick={onClose}  style={{ flex:1, padding:'12px', borderRadius:'11px', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--muted)', background:'transparent', border:'1px solid var(--bf)' }}>Close</button>
              </>
            ) : (
              <>
                <button onClick={onApprove} style={{ flex:1, padding:'12px', borderRadius:'11px', border:'none', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'#FFFFFF', background:'linear-gradient(135deg,var(--ok),#16A34A)' }}>Approve</button>
                <button onClick={onReject}  style={{ flex:1, padding:'12px', borderRadius:'11px', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--err)', background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.3)' }}>Reject</button>
                <button onClick={onClose}   style={{ flex:1, padding:'12px', borderRadius:'11px', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--muted)', background:'transparent', border:'1px solid var(--bf)' }}>Close</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Listing Detail Modal ──────────────────────────────────────────────────────
function ListingDetailModal({ sel, onClose, onApprove, onReject }: {
  sel: any; onClose: () => void;
  onApprove: () => void; onReject: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['listing-detail', sel.id],
    queryFn:  () => listingsApi.getFullById(sel.id),
  });
  const d = data as any;

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div onClick={e=>e.stopPropagation()} style={{ borderRadius:'22px', width:'100%', maxWidth:'680px', maxHeight:'88vh', overflowY:'auto', background:'#FFFFFF', border:'1px solid var(--border)', boxShadow:'0 40px 100px rgba(0,0,0,0.8)', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', borderRadius:'22px 22px 0 0', background:'linear-gradient(90deg,transparent,var(--gold),var(--gold3),var(--gold),transparent)' }} />
        <button onClick={onClose} style={{ position:'absolute', top:'14px', right:'14px', width:'30px', height:'30px', borderRadius:'50%', border:'1px solid var(--bf)', background:'rgba(255,255,255,0.06)', color:'var(--muted)', cursor:'pointer', fontSize:'14px', zIndex:10 }}>✕</button>

        <div style={{ padding:'26px' }}>
          {/* Header */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid var(--bf)' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'var(--offwhite)', marginBottom:'4px' }}>{sel.title}</div>
              <div style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'6px' }}>
                {sel.organisationName} · {sel.location} · Posted {sel.createdAt ? new Date(sel.createdAt).toLocaleDateString('en-IN') : '—'}
              </div>
              <span style={{ padding:'2px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, background:'rgba(200,146,10,0.08)', color:'var(--gold3)', border:'1px solid rgba(200,146,10,0.2)' }}>
                {sel.listingType?.replace(/_/g,' ')} · {sel.industry?.replace(/_/g,' ')}
              </span>
            </div>
          </div>

          {/* Detail sections */}
          {isLoading ? (
            <div style={{ textAlign:'center', padding:'32px', color:'var(--muted)', fontSize:'13px' }}>Loading full details…</div>
          ) : d ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'20px' }}>

              <DS title="Posted By">
                <DG2>
                  <DF l="Name"  v={d.postedBy?.name} />
                  <DF l="Email" v={d.postedBy?.email} />
                  <DF l="Phone" v={d.postedBy?.phone} />
                </DG2>
              </DS>

              <DS title="Listing Details">
                <DG2>
                  <DF l="Target Role"          v={d.targetRoleType?.replace(/_/g,' ')} />
                  <DF l="Work Mode"            v={d.workMode?.replace(/_/g,' ')} />
                  <DF l="Payment"              v={d.payment} />
                  <DF l="Salary"               v={d.salary} />
                  <DF l="Experience Required"  v={d.experienceRequired?.replace(/_/g,' ')} />
                  <DF l="Duration"             v={d.duration?.replace(/_/g,' ')} />
                   {/*{d.experienceDetail && (
                    <div style={{ marginTop:'8px', padding:'10px 12px', background:'rgba(200,146,10,0.05)', borderRadius:'8px', border:'1px solid rgba(200,146,10,0.15)' }}>
                      <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'3px' }}>Custom Details</div>
                      <div style={{ fontSize:'13px', color:'var(--offwhite)' }}>{d.experienceDetail}</div>
                    </div>
                    )} */}
                   {d.listingType === 'INTERNSHIP' && (
                    <>
                      <DF l="Certificate Provided" v={d.certificateProvided} />
                      <DF l="Employment Option"    v={d.employmentOption?.replace(/_/g,' ')} />
                    </>
                   )} 
                </DG2>
                {d.experienceDetail && <DF l="Experience Detail" v={d.experienceDetail} />}
                {d.description && <DF l="Description" v={d.description} />}
              </DS>

              {d.requirements?.length > 0 && (
                <DS title="Requirements">
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                    {d.requirements.map((r: string, i: number) => (
                      <div key={i} style={{ fontSize:'13px', color:'var(--offwhite)' }}>✦ {r}</div>
                    ))}
                  </div>
                </DS>
              )}

              {d.facilities?.length > 0 && (
                <DS title="Facilities & Benefits">
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {d.facilities.filter((f: string) => f.trim()).map((f: string) => (
                      <span key={f} style={{ padding:'4px 12px', borderRadius:'50px', fontSize:'12px', background:'rgba(200,146,10,0.07)', border:'1px solid var(--border)', color:'var(--muted)' }}>{f.trim()}</span>
                    ))}
                  </div>
                </DS>
              )}

              {d.skills?.length > 0 && (
                <DS title="Key Skills">
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {(Array.isArray(d.skills) ? d.skills : String(d.skills).split(',')).map((s: string) => (
                      <span key={s} style={{ padding:'4px 12px', borderRadius:'50px', fontSize:'12px', background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.2)', color:'var(--info)' }}>{s.trim()}</span>
                    ))}
                  </div>
                </DS>
              )}

              <DS title="Contact Information">
                <DG2>
                  <DF l="Contact Person" v={d.contactPerson} />
                  <DF l="Contact Email"  v={d.contactEmail} />
                  <DF l="Contact Phone"  v={d.contactPhone} />
                </DG2>
              </DS>
            </div>
          ) : null}

          {/* Action buttons */}
          <div style={{ display:'flex', gap:'10px', paddingTop:'16px', borderTop:'1px solid var(--bf)' }}>
            <button onClick={onApprove} style={{ flex:1, padding:'12px', borderRadius:'11px', border:'none', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'#FFFFFF', background:'linear-gradient(135deg,var(--ok),#16A34A)' }}>
              Approve
            </button>
            <button onClick={onReject} style={{ flex:1, padding:'12px', borderRadius:'11px', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--err)', background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.3)' }}>
              Reject
            </button>
            <button onClick={onClose} style={{ flex:1, padding:'12px', borderRadius:'11px', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--muted)', background:'transparent', border:'1px solid var(--bf)' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tiny layout helpers for the modal ─────────────────────────────────────────
const DS = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div style={{ fontSize:'13px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'8px', paddingBottom:'4px', borderBottom:'1px solid var(--bf)' }}>{title}</div>
    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>{children}</div>
  </div>
);
const DG2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>{children}</div>
);
const DF = ({ l, v }: { l: string; v: any }) => v ? (
  <div><div style={{ fontSize:'10px', fontWeight:700, color:'var(--faint)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px' }}>{l}</div><div style={{ fontSize:'13px', color:'var(--offwhite)', fontWeight:500, lineHeight:1.5 }}>{String(v)}</div></div>
) : null;

export default function ModerationPage() {
  const [tab,  setTab]  = useState<Tab>('pending');
  const [sel,  setSel]  = useState<any>(null);
  const [selPost, setSelPost] = useState<any>(null);
  const [pPage, setPPage] = useState(1);
  const [aPage, setAPage] = useState(1);
  const [rPage, setRPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const { toast } = useToast();
  const qc = useQueryClient();

  const pending  = useQuery({ queryKey:['mod','pending',pPage],      queryFn:()=>profilesApi.getPending({ page:pPage, limit:20 })  });
  const approved = useQuery({ queryKey:['mod','approved',aPage],     queryFn:()=>profilesApi.getApproved({ page:aPage, limit:20 }) });
  const rejected = useQuery({ queryKey:['mod','rejected',rPage],     queryFn:()=>profilesApi.getRejected({ page:rPage, limit:20 }) });
  const posts    = useQuery({ queryKey:['mod','posts',postsPage],    queryFn:()=>listingsApi.getPending({ page:postsPage, limit:20 }) });
  const mktStats = useQuery({ queryKey:['mod','mktStats'],           queryFn:()=>marketApi.getStats(),      enabled: tab==='market' });
  const mktAll   = useQuery({ queryKey:['mod','mktAll'],             queryFn:()=>marketApi.getAllApproved(),enabled: tab==='market' });
  const byRole   = useQuery({ queryKey:['mod','byRole'],             queryFn:()=>marketApi.getByRole(),     enabled: tab==='stats'  });

  const inv = () => { qc.invalidateQueries({ queryKey:['mod'] }); setSel(null); };

  // Note: approve() no longer takes a marketField parameter.
  // The candidate self-selected their market segment on submission.
  const appMut  = useMutation({ mutationFn:(id:string)=>profilesApi.approve(id),                 onSuccess:()=>{ toast('Profile approved!','ok'); inv(); } });
  const rejMut  = useMutation({ mutationFn:({id,r}:{id:string;r:string})=>profilesApi.reject(id,r), onSuccess:()=>{ toast('Profile rejected.','ok'); inv(); } });
  const reactMut= useMutation({ mutationFn:(id:string)=>profilesApi.reactivate(id),              onSuccess:()=>{ toast('Re-opened.','ok'); inv(); } });
  const appPost = useMutation({ mutationFn:(id:string)=>listingsApi.approve(id),                 onSuccess:()=>{ toast('Post approved!','ok'); qc.invalidateQueries({ queryKey:['mod','posts'] }); } });
  const rejPost = useMutation({ mutationFn:({id,reason}:{id:string;reason:string})=>listingsApi.reject(id,reason), onSuccess:()=>{ toast('Post rejected.','ok'); qc.invalidateQueries({ queryKey:['mod','posts'] }); } });
  const removeMut = useMutation({ mutationFn:(id:string)=>profilesApi.remove(id), onSuccess:()=>{ toast('Profile removed.','ok'); inv(); } });

  const doRemove = (p: any) => {
    if (confirm(`Remove ${p.fullName || 'this profile'} permanently? This cannot be undone.`)) {
      removeMut.mutate(p.id);
    }
  };

  const doReject = (p: any) => {
    const r = prompt(`Reason for rejecting ${p.fullName || 'this profile'}:`);
    if (r?.trim()) rejMut.mutate({ id:p.id, r:r.trim() });
  };

  function ProfileTable({ data, mode }: { data:any[]; mode:'approve'|'reactivate'|'view' }) {
    if (!data.length) return <div style={{ padding:'24px', textAlign:'center', fontSize:'13px', color:'var(--muted)' }}>No profiles found.</div>;
    return (
      <div style={{ overflowX:'auto' }}>
        <table className="rt">
          <thead>
            <tr>{['Name','Role','Applied For','Org','Market','Mode','Cert','Actions'].map(h=><th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((p:any)=>(
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight:600, color:'var(--offwhite)' }}>{p.fullName}</div>
                  <div style={{ fontSize:'10px', color:'var(--muted)' }}>{p.city}</div>
                </td>
                <td>
                  <span style={{ padding:'2px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700, color:'var(--gold3)', background:'rgba(212,160,23,0.1)', border:'1px solid rgba(212,160,23,0.22)' }}>
                    {ROLE_ICONS[p.roleType]} {p.roleType?.replace(/_/g,' ')}
                  </span>
                </td>
                <td style={{ color:'var(--gold3)', fontWeight:600, fontSize:'13px' }}>{p.appliedFor}</td>
                <td style={{ fontSize:'13px' }}>{p.appliedAt}</td>
                {/* marketField is now set by candidate — shown read-only */}
                <td><MktPill f={p.marketField} /></td>
                <td style={{ fontSize:'13px' }}>{p.workMode?.replace(/_/g,' ')}</td>
                <td style={{ fontSize:'13px', color: p.certificate==='YES' ? 'var(--ok)' : 'var(--muted)' }}>{p.certificate}</td>
                <td>
                  <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                    <button onClick={()=>setSel(p)} style={{ padding:'5px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.25)', color:'var(--info)' }}>View More</button>
                    {mode==='approve' && <>
                      <button onClick={()=>appMut.mutate(p.id)} style={{ padding:'5px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', color:'var(--ok)' }}>Approve</button>
                      <button onClick={()=>doReject(p)} style={{ padding:'5px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.25)', color:'var(--err)' }}>Reject</button>
                    </>}
                    {mode==='reactivate' && <button onClick={()=>reactMut.mutate(p.id)} style={{ padding:'5px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.2)', color:'var(--info)' }}>Reactivate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ padding:'28px' }}>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'22px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>Moderation</h1>
      <p style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'24px' }}>Review candidate profiles and job listings before they go live.</p>

      {/* Stats row */}
      <div className="stats-4" style={{ marginBottom:'24px' }}>
        {[
          ['⏳ Pending',  pending.data?.total  ?? 0, 'var(--warn)'],
          ['Approved', approved.data?.total ?? 0, 'var(--ok)'  ],
          ['Rejected', rejected.data?.total ?? 0, 'var(--err)' ],
          ['📋 Posts',    posts.data?.total    ?? 0, 'var(--info)'],
        ].map(([label, n, color]) => (
          <div key={String(label)} className="gc" style={{ padding:'18px', textAlign:'center' }}>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'26px', fontWeight:700, lineHeight:1, marginBottom:'4px', color: color as string }}>{n}</div>
            <div style={{ fontSize:'13px', color:'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tab strip */}
      <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginBottom:'18px' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            padding:'7px 14px', borderRadius:'50px', fontSize:'13px', fontWeight:600, cursor:'pointer',
            fontFamily:'Raleway,sans-serif', border:'1px solid', transition:'all 0.2s',
            background: tab===t.key ? 'rgba(212,160,23,0.12)' : 'transparent',
            borderColor: tab===t.key ? 'var(--border)' : 'var(--bf)',
            color: tab===t.key ? 'var(--gold3)' : 'var(--muted)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab==='pending' && (
        <div className="gc" style={{ overflow:'hidden' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'var(--offwhite)', padding:'18px 18px 14px' }}>⏳ Pending Review</div>
          {pending.isLoading ? <div style={{ padding:'24px', color:'var(--muted)' }}>Loading…</div> : <><ProfileTable data={pending.data?.data??[]} mode="approve" /><Pager page={pPage} total={pending.data?.total??0} limit={20} onPage={setPPage} /></>}
        </div>
      )}

      {tab==='approved' && (
        <div className="gc" style={{ overflow:'hidden' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'var(--offwhite)', padding:'18px 18px 14px' }}>Approved Profiles</div>
          {approved.isLoading ? <div style={{ padding:'24px', color:'var(--muted)' }}>Loading…</div> : <><ProfileTable data={approved.data?.data??[]} mode="view" /><Pager page={aPage} total={approved.data?.total??0} limit={20} onPage={setAPage} /></>}
        </div>
      )}

      {tab==='rejected' && (
        <div className="gc" style={{ overflow:'hidden' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'var(--offwhite)', padding:'18px 18px 14px' }}>Rejected Profiles</div>
          {rejected.isLoading ? <div style={{ padding:'24px', color:'var(--muted)' }}>Loading…</div> : <><ProfileTable data={rejected.data?.data??[]} mode="reactivate" /><Pager page={rPage} total={rejected.data?.total??0} limit={20} onPage={setRPage} /></>}
        </div>
      )}

      {tab==='market' && (
        <>
          {mktStats.data && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'18px' }}>
              {[
                { f:'IT_FIELD',     icon:'🌐', desc:'Developers · Designers · Product Owners · Data/AI' },
                { f:'NON_IT_FIELD', icon:'🎨', desc:'Arts · Commerce · Education · Healthcare · Engineering' },
                { f:'SERVICES',     icon:'🤝', desc:'Consultancy · Training · Recruitment · Vendor' },
              ].map(({ f, icon, desc }) => (
                <div key={f} className="gc" style={{ padding:'22px' }}>
                  <div style={{ fontSize:'28px', marginBottom:'8px' }}>{icon}</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>{MF_LABEL[f]}</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'28px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'6px' }}>
                    {mktStats.data.profilesByMarket?.[f] ?? 0}
                  </div>
                  <div style={{ fontSize:'13px', color:'var(--muted)', fontWeight:300 }}>{desc}</div>
                </div>
              ))}
            </div>
          )}
          {mktAll.data && (
            <div className="gc" style={{ overflow:'hidden' }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'var(--offwhite)', padding:'18px 18px 14px' }}>All Approved Profiles</div>
              <div style={{ overflowX:'auto' }}>
                <table className="rt">
                  <thead><tr>{['Name','Role','Applied For','Org','Market (self-selected)','Mode','Cert'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {(mktAll.data?.data??[]).map((p:any)=>(
                      <tr key={p.id}>
                        <td style={{ fontWeight:600, color:'var(--offwhite)' }}>{p.fullName}</td>
                        <td style={{ fontSize:'10px', color:'var(--gold3)' }}>{ROLE_ICONS[p.roleType]} {p.roleType?.replace(/_/g,' ')}</td>
                        <td style={{ color:'var(--gold3)' }}>{p.appliedFor}</td>
                        <td style={{ fontSize:'13px' }}>{p.appliedAt}</td>
                        <td>
                          <MktPill f={p.marketField} />
                          <div style={{ fontSize:'9px', color:'var(--faint)', marginTop:'2px' }}>{p.marketSegment?.replace(/_/g,' ')}</div>
                        </td>
                        <td style={{ fontSize:'13px' }}>{p.workMode?.replace(/_/g,' ')}</td>
                        <td style={{ fontSize:'13px', color:p.certificate==='YES'?'var(--ok)':'var(--muted)' }}>{p.certificate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab==='posts' && (
        <div className="gc" style={{ overflow:'hidden' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'var(--offwhite)', padding:'18px 18px 14px' }}>📋 Job Posts Pending Review</div>
          {posts.isLoading ? <div style={{ padding:'24px', color:'var(--muted)' }}>Loading…</div> :
            !(posts.data?.data??[]).length ? <div style={{ padding:'24px', fontSize:'13px', color:'var(--muted)' }}>No pending posts.</div> : (
              <>
                <div style={{ overflowX:'auto' }}>
                  <table className="rt">
                    <thead><tr>{['Organisation','Title','Role','Mode','Payment','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(posts.data?.data??[]).map((p:any)=>(
                        <tr key={p.id}>
                          <td style={{ fontWeight:600, color:'var(--offwhite)' }}>{p.organisationName}</td>
                          <td style={{ color:'var(--gold3)' }}>{p.title}</td>
                          <td style={{ fontSize:'13px' }}>{p.targetRoleType?.replace(/_/g,' ')}</td>
                          <td style={{ fontSize:'13px' }}>{p.workMode?.replace(/_/g,' ')}</td>
                          <td style={{ fontSize:'13px' }}>{p.payment}</td>
                          <td>
                            <div style={{ display:'flex', gap:'4px' }}>
                                <button onClick={()=>setSelPost(p)} style={{ padding:'5px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.25)', color:'var(--info)' }}>View More</button>
                              <button onClick={()=>appPost.mutate(p.id)} style={{ padding:'5px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, cursor:'pointer', background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.3)', color:'var(--ok)' }}>Approve</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pager page={postsPage} total={posts.data?.total??0} limit={20} onPage={setPostsPage} />
              </>
            )
          }
        </div>
      )}

      {tab==='stats' && (
        <>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'var(--offwhite)', marginBottom:'14px' }}>📈 Profiles by Role Type</div>
          {byRole.isLoading ? <div style={{ color:'var(--muted)' }}>Loading…</div> : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'12px' }}>
              {(byRole.data??[]).map((r:any)=>(
                <div key={r.role} className="gc" style={{ padding:'18px', textAlign:'center' }}>
                  <div style={{ fontSize:'26px', marginBottom:'8px' }}>{ROLE_ICONS[r.role]||'💼'}</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>{r.role?.replace(/_/g,' ')}</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'22px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{r.count}</div>
                  <div style={{ fontSize:'10px', color:'var(--ok)', marginTop:'2px' }}>approved</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Profile detail modal */}
      {sel && <ProfileDetailModal key={sel.id} sel={sel} onClose={()=>setSel(null)} onApprove={()=>{appMut.mutate(sel.id); setSel(null);}} onReject={()=>{doReject(sel); setSel(null);}} onRemove={()=>{doRemove(sel); setSel(null);}} />}
      {selPost && <ListingDetailModal key={selPost.id} sel={selPost} onClose={()=>setSelPost(null)} onApprove={()=>{appPost.mutate(selPost.id); setSelPost(null);}} onReject={()=>{ const r = prompt(`Reason for rejecting "${selPost.title}":`); if (r) { rejPost.mutate({ id: selPost.id, reason: r }); setSelPost(null); } }} />}
    </div>
  );
}
