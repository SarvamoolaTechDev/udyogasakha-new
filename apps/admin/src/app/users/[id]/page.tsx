'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { usersApi, auditApi } from '@/lib/api';
import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';

const STATUS_STYLE: Record<string,{ bg:string; border:string; color:string; label:string }> = {
  PENDING:  { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)',  color:'var(--warn)', label:'⏳ Pending'  },
  APPROVED: { bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.3)',  color:'var(--ok)',   label:'✅ Approved' },
  REJECTED: { bg:'rgba(255,107,107,0.1)', border:'rgba(255,107,107,0.3)', color:'var(--err)',  label:'❌ Rejected' },
};
const ROLE_ICONS: Record<string,string> = { INTERN:'🎓', FRESHER:'🌱', JOB_SEEKER:'🔍', FREELANCER:'💻', CONSULTANT:'🧑‍💼', HIRING_MANAGER:'📊', RECRUITER:'🤝', TRAINER:'📚', VENDOR:'🏭', MODERATOR_ROLE:'🛡️', RFP_PROVIDER:'📋' };
const ACTION_COLOR: Record<string,string> = { APPROVED:'var(--ok)', REJECTED:'var(--err)', CREATED:'var(--gold3)', UPDATED:'var(--warn)', LOGIN:'var(--muted)', LOGIN_FAILED:'var(--err)', LOGOUT:'var(--faint)', REGISTERED:'var(--gold2)', PASSWORD_CHANGED:'var(--warn)' };

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useQuery({ queryKey:['admin-user',id], queryFn:()=>usersApi.getById(id), enabled:!!id });
  const { data: auditData, isLoading: auditLoading } = useQuery({ queryKey:['audit-user',id], queryFn:()=>auditApi.forActor(id,{ limit:10 }), enabled:!!id });
  const auditEntries: any[] = (auditData as any)?.data ?? [];

  return (
    <div style={{ padding:'28px', maxWidth:'860px' }}>
      <Link href="/users" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'var(--muted)', textDecoration:'none', marginBottom:'24px' }}>← Back to Users</Link>

      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
          <Skeleton height="80px" style={{ borderRadius:'18px' }} />
          <Skeleton height="200px" style={{ borderRadius:'18px' }} />
        </div>
      ) : !user ? (
        <div style={{ textAlign:'center', padding:'48px', color:'var(--muted)' }}>User not found.</div>
      ) : (
        <>
          <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', marginBottom:'18px', paddingBottom:'16px', borderBottom:'1px solid var(--bf)' }}>
              <div style={{ width:'64px', height:'64px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', background:'linear-gradient(135deg,rgba(29,62,160,0.5),rgba(45,107,228,0.4))', border:'3px solid var(--border)', flexShrink:0 }}>👤</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'#fff', marginBottom:'3px' }}>{(user as any).name}</div>
                <div style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'8px' }}>{(user as any).email}</div>
                <div style={{ display:'flex', gap:'6px' }}>
                  {((user as any).roles??[]).map((r:string)=><span key={r} style={{ padding:'2px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:'rgba(212,160,23,0.08)', color:'var(--gold3)' }}>{r}</span>)}
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'14px' }}>
              {[['📱 Phone',(user as any).phone||'—'],['📍 City',(user as any).city||'—'],['📅 Joined',(user as any).createdAt?new Date((user as any).createdAt).toLocaleDateString('en-IN',{ day:'numeric',month:'long',year:'numeric'}):'—'],['🔑 ID',(user as any).id?.slice(-12)??'—']].map(([l,v])=>(
                <div key={String(l)}><div style={{ fontSize:'9px', fontWeight:700, color:'var(--faint)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'3px' }}>{l}</div><div style={{ fontSize:'13px', color:'var(--offwhite)', fontWeight:500 }}>{v}</div></div>
              ))}
            </div>
          </div>

          <div className="gc" style={{ padding:'24px', marginBottom:'18px' }}>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'14px' }}>Profile Submissions</div>
            {!(user as any).profiles?.length ? (
              <p style={{ fontSize:'13px', color:'var(--muted)', fontStyle:'italic' }}>No profiles submitted yet.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {((user as any).profiles as any[]).map((p:any)=>{ const st=STATUS_STYLE[p.status]; return (
                  <div key={p.roleType} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'11px 14px', borderRadius:'12px', background:'rgba(255,255,255,0.02)', border:'1px solid var(--bf)' }}>
                    <span style={{ fontSize:'20px' }}>{ROLE_ICONS[p.roleType]??'💼'}</span>
                    <div style={{ flex:1 }}><div style={{ fontSize:'13px', fontWeight:600, color:'#fff' }}>{p.roleType.replace(/_/g,' ')}</div><div style={{ fontSize:'10px', color:'var(--muted)' }}>Submitted: {p.submittedAt?new Date(p.submittedAt).toLocaleDateString('en-IN',{ day:'numeric',month:'short',year:'numeric'}):'—'}</div></div>
                    <span style={{ padding:'3px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, background:st.bg, border:`1px solid ${st.border}`, color:st.color }}>{st.label}</span>
                  </div>
                ); })}
              </div>
            )}
          </div>

          <div className="gc" style={{ overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px 14px' }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#fff' }}>Recent Activity</div>
              <Link href="/audit" style={{ fontSize:'11px', color:'var(--gold3)', textDecoration:'none', fontWeight:600 }}>Full audit log →</Link>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="rt">
                <thead><tr>{['Timestamp','Action','Entity','Details'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {auditLoading ? Array.from({length:5}).map((_,i)=><SkeletonRow key={i} cols={4} />) :
                    auditEntries.length===0 ? <tr><td colSpan={4} style={{ textAlign:'center', padding:'24px', color:'var(--muted)' }}>No activity recorded yet.</td></tr> :
                    auditEntries.map((e:any)=>(
                      <tr key={e.id}>
                        <td style={{ fontSize:'10px', color:'var(--muted)', whiteSpace:'nowrap' }}>{new Date(e.ts).toLocaleDateString('en-IN',{ day:'numeric',month:'short' })} {new Date(e.ts).toLocaleTimeString('en-IN',{ hour:'2-digit',minute:'2-digit' })}</td>
                        <td><span style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'9px', fontWeight:800, background:'rgba(255,255,255,0.05)', color:ACTION_COLOR[e.action]??'var(--offwhite)' }}>{e.action}</span></td>
                        <td style={{ fontSize:'11px', color:'var(--gold3)' }}>{e.entityType}</td>
                        <td style={{ fontSize:'11px', color:'var(--muted)' }}>{e.metadata?Object.entries(e.metadata as object).map(([k,v])=>`${k}: ${v}`).join(' · '):'—'}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
