'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useWallet, UNLOCK_COST, LOW_BALANCE, TopUpModal, LowBalanceModal } from '@/components/wallet/WalletComponents';

const EXP: Record<string,string> = { ANY:'Any', FRESHER_0_1:'0–1 yr', EXP_1_3:'1–3 yrs', EXP_3_5:'3–5 yrs', EXP_5_8:'5–8 yrs', EXP_8_PLUS:'8+ yrs' };
const DUR: Record<string,string> = { SHORT_TERM:'1–3 months', MEDIUM_TERM:'3–6 months', LONG_TERM:'6+ months', PERMANENT:'Permanent', PROJECT_BASED:'Project Based' };
const ROLE: Record<string,string> = { INTERN:'Intern', FRESHER:'Fresher', JOB_SEEKER:'Job Seeker', FREELANCER:'Freelancer', CONSULTANT:'Consultant', HIRING_MANAGER:'Hiring Manager', RECRUITER:'Recruiter', TRAINER:'Trainer', VENDOR:'Vendor', MODERATOR_ROLE:'Moderator', RFP_PROVIDER:'RFP Provider' };

export default function JobDetailPage() {
  const { id } = useParams<{ id:string }>();
  const { isAuthenticated } = useAuthStore();
  const { balance, invalidate: invalidateBalance } = useWallet();
  const qc = useQueryClient();

  const [showTopUp,    setShowTopUp]    = useState(false);
  const [showLowBal,   setShowLowBal]   = useState(false);
  const [pendingUnlock, setPendingUnlock] = useState(false);
  const [details,      setDetails]      = useState<any>(null);

  const { data:job, isLoading } = useQuery({ queryKey:['listing',id], queryFn:()=>listingsApi.getById(id), enabled:!!id });
  const { data:similar=[] }    = useQuery({ queryKey:['similar',id,(job as any)?.targetRoleType], queryFn:()=>listingsApi.getSimilar(id,(job as any).targetRoleType), enabled:!!job });
  const { data:unlockStatus }  = useQuery({
    queryKey: ['listing-unlock', id],
    queryFn:  () => walletApi.listingStatus([id]).then((r:any) => r[id]),
    enabled:  !!id && isAuthenticated,
  });

  const isUnlocked = !!unlockStatus || !!details;

  const unlockMutation = useMutation({
    mutationFn: async () => {
      const result = await walletApi.unlockListing(id);
      const contactInfo = await walletApi.getListingDetails(id);
      return { result, contactInfo };
    },
    onSuccess: ({ result, contactInfo }) => {
      setDetails(contactInfo);
      invalidateBalance();
      qc.invalidateQueries({ queryKey: ['listing-unlock', id] });
    },
  });

  const handleUnlockClick = () => {
    if (!isAuthenticated) { window.location.href = `/login?from=/jobs/${id}`; return; }
    if (balance < UNLOCK_COST) { setShowLowBal(true); return; }
    if (balance <= LOW_BALANCE) {
      // Warning: low balance but can still afford this one
      setShowLowBal(true);
      return;
    }
    doUnlock();
  };

  const doUnlock = async () => {
    setShowLowBal(false);
    setShowTopUp(false);
    await unlockMutation.mutateAsync();
  };

  if (isLoading) return (
    <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'36px 4%' }}>
      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>{[...Array(3)].map((_,i)=><SkeletonCard key={i} height='120px' />)}</div>
    </div>
  );
  if (!job) return <div style={{ textAlign:'center', padding:'60px', color:'var(--muted)' }}>Listing not found.</div>;

  const skills = Array.isArray(job.skills) ? job.skills : (job.skills||'').split(',');
  const fac    = Array.isArray(job.facilities) ? job.facilities : (job.facilities||'').split(',');

  const Row = ({ icon, val }: { icon:string; val:string }) => (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'var(--muted)', padding:'5px 12px', borderRadius:'50px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--bf)' }}>
      {icon} {val}
    </span>
  );

  return (
    <>
    <div className="layout-with-sidebar" style={{ maxWidth:'1100px', margin:'0 auto', padding:'36px 4% 60px' }}>
      {/* Left — main content */}
      <div>
        <Link href="/jobs" style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'var(--muted)', textDecoration:'none', marginBottom:'22px' }}>
          ← Back to Jobs
        </Link>

        {/* Header */}
        <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
          <div style={{ width:'60px', height:'60px', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', background:'linear-gradient(135deg,rgba(212,160,23,0.15),rgba(212,160,23,0.05))', border:'1px solid var(--border)', marginBottom:'16px' }}>{job.icon||'💼'}</div>
          <div style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'4px' }}>{job.organisationName}</div>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(18px,3vw,28px)', fontWeight:700, color:'#fff', marginBottom:'14px' }}>{job.title}</h1>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'16px' }}>
            <Row icon="📍" val={job.location} />
            <Row icon="⏱️" val={EXP[job.experienceRequired]??job.experienceRequired} />
            <Row icon="💼" val={DUR[job.duration]??job.duration} />
            <Row icon="🏠" val={job.workMode?.replace('_',' ')} />
            <Row icon="📅" val={new Date(job.postedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} />
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'18px' }}>
            <span className={`jtag ${job.workMode==='WFH'?'jtag-wfh':''}`}>{job.workMode?.replace('_',' ')}</span>
            <span className={`jtag ${job.payment==='PAID'?'jtag-paid':''}`}>{job.payment}</span>
            {job.certificateProvided==='YES' && <span className="jtag jtag-cert">📜 Certificate Provided</span>}
            {job.employmentOption==='EXISTS'  && <span className="jtag jtag-cert">➡️ Post-Employment Option</span>}
            <span className="jtag">{ROLE[job.targetRoleType]}</span>
          </div>
          <p style={{ fontSize:'13px', color:'var(--offwhite)', lineHeight:1.9, fontWeight:300 }}>{job.description}</p>
        </div>

        {/* Submission details */}
        <div style={{ borderRadius:'14px', padding:'18px', marginBottom:'18px', background:'linear-gradient(135deg,rgba(212,160,23,0.07),rgba(212,160,23,0.03))', border:'1px solid var(--border)' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'14px' }}>⬛ Submission Details</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
            {[['📌 Applied For',job.title],['🏢 Applied At',job.organisationName],['💰 Payment',job.payment],['📜 Certificate',job.certificateProvided==='YES'?'✅ Yes':'❌ No'],['🏠 Mode',job.workMode?.replace('_',' ')],['➡️ Post-Employment',job.employmentOption==='EXISTS'?'✅ Exists':'Not Exists']].map(([l,v])=>(
              <div key={String(l)}>
                <div style={{ fontSize:'9px', fontWeight:700, color:'var(--faint)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'3px' }}>{l}</div>
                <div style={{ fontSize:'12px', color:'var(--offwhite)', fontWeight:500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience required */}
        <div className="gc" style={{ padding:'22px', marginBottom:'18px' }}>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'14px', display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'20px' }}>⚡</span>Experience Required
          </h2>
          <p style={{ fontSize:'13px', color:'var(--offwhite)', lineHeight:1.85, fontWeight:300, marginBottom:'14px' }}>{job.experienceDetail || 'See job description for details.'}</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {skills.filter((s:string)=>s.trim()).map((s:string)=><span key={s} className="jtag" style={{ padding:'4px 12px', fontSize:'10px' }}>{s.trim()}</span>)}
          </div>
        </div>

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <div className="gc" style={{ padding:'22px', marginBottom:'18px' }}>
            <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'14px', display:'flex', alignItems:'center', gap:'10px' }}><span>📋</span>Key Responsibilities</h2>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px' }}>
              {job.responsibilities.map((r:string,i:number)=>(
                <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', fontSize:'13px', color:'var(--offwhite)', fontWeight:300, lineHeight:1.6 }}>
                  <span style={{ color:'var(--gold2)', fontSize:'10px', marginTop:'4px', flexShrink:0 }}>✦</span>{r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <div className="gc" style={{ padding:'22px', marginBottom:'18px' }}>
            <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'14px', display:'flex', alignItems:'center', gap:'10px' }}><span>✅</span>Requirements & Qualifications</h2>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px' }}>
              {job.requirements.map((r:string,i:number)=>(
                <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', fontSize:'13px', color:'var(--offwhite)', fontWeight:300, lineHeight:1.6 }}>
                  <span style={{ color:'var(--gold2)', fontSize:'10px', marginTop:'4px', flexShrink:0 }}>✦</span>{r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Facilities */}
        {fac.filter((f:string)=>f.trim()).length > 0 && (
          <div className="gc" style={{ padding:'22px' }}>
            <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'14px', display:'flex', alignItems:'center', gap:'10px' }}><span>🎁</span>Facilities & Benefits</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
              {fac.filter((f:string)=>f.trim()).map((f:string)=><span key={f} className="jtag jtag-cert" style={{ padding:'5px 12px', fontSize:'10px' }}>{f.trim()}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="layout-sidebar-col">
        {/* Unlock / Contact card */}
        <div className="gc" style={{ padding:'24px', marginBottom:'18px', position:'sticky', top:'86px' }}>
          {isUnlocked ? (
            // ── Contact details revealed after unlock ──────────────────────
            <>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                <span style={{ fontSize:'18px' }}>✅</span>
                <span style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--offwhite)' }}>Contact Details</span>
              </div>
              {[
                details?.contactPerson  && ['👤', 'Contact',  details.contactPerson],
                details?.contactEmail   && ['✉️',  'Email',    details.contactEmail],
                details?.contactPhone   && ['📞', 'Phone',    details.contactPhone],
              ].filter(Boolean).map(([icon, label, val]: any) => (
                <div key={label} style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'10px' }}>
                  <span style={{ fontSize:'14px', marginTop:'1px' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'2px', textTransform:'uppercase', letterSpacing:'0.8px' }}>{label}</div>
                    <div style={{ fontSize:'13px', fontWeight:600, color:'var(--offwhite)' }}>{val}</div>
                  </div>
                </div>
              ))}
              <Link href={`/profile/${(job as any).targetRoleType}`} style={{ display:'block', textAlign:'center', padding:'12px', borderRadius:'12px', textDecoration:'none', fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,var(--gold2),var(--gold3))', color:'#fff', marginTop:'16px' }}>
                Apply as {ROLE[(job as any).targetRoleType]} →
              </Link>
            </>
          ) : (
            // ── Locked state ──────────────────────────────────────────────
            <>
              <div style={{ textAlign:'center', marginBottom:'16px' }}>
                <div style={{ fontSize:'32px', marginBottom:'8px' }}>🔒</div>
                <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>View Full Details</h3>
                <p style={{ fontSize:'12px', color:'var(--muted)', lineHeight:1.6 }}>
                  Unlock recruiter contact info — phone, email and apply link. One-time {UNLOCK_COST}-point unlock, permanently yours.
                </p>
              </div>

              {!isAuthenticated ? (
                <Link href={`/login?from=/jobs/${id}`} style={{ display:'block', textAlign:'center', padding:'13px', borderRadius:'50px', textDecoration:'none', fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,var(--gold2),var(--gold3))', color:'#fff' }}>
                  Sign In to Unlock →
                </Link>
              ) : (
                <button
                  onClick={handleUnlockClick}
                  disabled={unlockMutation.isPending}
                  style={{ width:'100%', padding:'13px', borderRadius:'50px', border:'none', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,var(--gold2),var(--gold3))', color:'#fff', opacity: unlockMutation.isPending ? 0.6 : 1 }}
                >
                  {unlockMutation.isPending ? 'Unlocking…' : `Unlock for ${UNLOCK_COST} points →`}
                </button>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'16px', paddingTop:'16px', borderTop:'1px solid var(--bf)' }}>
                {[['🏢',(job as any).organisationName],['📍',(job as any).location],['💰',(job as any).salary||'Competitive'],['⏱️',EXP[(job as any).experienceRequired]],['🏠',(job as any).workMode?.replace('_',' ')]].map(([icon,val])=>(
                  <div key={String(icon)} style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'12px', color:'var(--muted)' }}>
                    <span style={{ fontSize:'16px', width:'20px', textAlign:'center' }}>{icon}</span><span>{val}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Similar */}
        {(similar as any[]).length > 0 && (
          <div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'var(--offwhite)', marginBottom:'14px', padding:'0 2px' }}>Similar Listings</div>
            {(similar as any[]).map((s:any)=>(
              <Link key={s.id} href={`/jobs/${s.id}`} style={{ textDecoration:'none', display:'block' }}>
                <div className="gc gc-hover" style={{ padding:'14px', marginBottom:'10px', cursor:'pointer' }}>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--offwhite)', marginBottom:'3px' }}>{s.title}</div>
                  <div style={{ fontSize:'10px', color:'var(--muted)' }}>{s.organisationName} · {s.workMode?.replace('_',' ')}</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginTop:'6px' }}>{s.salary||'Competitive'}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>

    {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
    {showLowBal && (
      <LowBalanceModal
        balance={balance}
        canProceed={balance >= UNLOCK_COST}
        onProceed={doUnlock}
        onTopUp={() => { setShowLowBal(false); setShowTopUp(true); }}
        onClose={() => setShowLowBal(false)}
      />
    )}
    </>
  );
}