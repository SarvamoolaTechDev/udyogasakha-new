'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

const ROLE_ICON: Record<string, string> = {
  INTERN:'🎓', FRESHER:'🌱', JOB_SEEKER:'🔍', CONSULTANT:'🧑‍💼',
  HIRING_MANAGER:'📊', RECRUITER:'🤝', TRAINER:'📚', VENDOR:'🏭', RFP_PROVIDER:'📋',
};

const ROLE_LABEL: Record<string, string> = {
  INTERN:'Intern', FRESHER:'Fresher', JOB_SEEKER:'Job Seeker',
  CONSULTANT:'Consultant', HIRING_MANAGER:'Hiring Manager',
  RECRUITER:'Recruiter', TRAINER:'Trainer', VENDOR:'Vendor', RFP_PROVIDER:'RFP Provider',
};

const STATUS: Record<string, { bg:string; border:string; color:string; label:string }> = {
  PENDING:  { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)',  color:'#D97706',  label:'⏳ Pending Review' },
  APPROVED: { bg:'rgba(22,163,74,0.1)',   border:'rgba(22,163,74,0.3)',   color:'#16A34A',  label:'✅ Live'           },
  REJECTED: { bg:'rgba(220,38,38,0.1)',   border:'rgba(220,38,38,0.3)',   color:'#DC2626',  label:'❌ Needs Changes'  },
};

const ALL_ROLES = [
  { slug:'INTERN',         icon:'🎓', name:'Intern',         sub:'Certificate · Stipend · Employment'  },
  { slug:'FRESHER',        icon:'🌱', name:'Fresher',        sub:'Entry-level · Campus · 0–1 yr'       },
  { slug:'JOB_SEEKER',     icon:'🔍', name:'Job Seeker',     sub:'Experienced · Switch · Relocation'   },
  { slug:'CONSULTANT',     icon:'🧑‍💼', name:'Consultant',     sub:'Freelance · Domain Expert · Contract'},
  { slug:'HIRING_MANAGER', icon:'📊', name:'Hiring Manager', sub:'Team Builder · JD · Interviews'      },
  { slug:'RECRUITER',      icon:'🤝', name:'Recruiter',      sub:'Sourcing · ATS · Placement'          },
  { slug:'TRAINER',        icon:'📚', name:'Trainer',        sub:'Corporate · Online · L&D'            },
  { slug:'VENDOR',         icon:'🏭', name:'Vendor',         sub:'B2B · Products · Partnership'        },
  { slug:'RFP_PROVIDER',   icon:'📋', name:'RFP Provider',   sub:'Tender · Publisher · Org'            },
];

const ENABLE_SELF_PROFILE_DELETE = false;

function ProfileCard({ p, single, onDeleted }: { p: any; single: boolean; onDeleted: () => void }) {
  const st = STATUS[p.status] ?? STATUS.PENDING;
  const skills = Array.isArray(p.skills) ? p.skills : [];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMut = useMutation({
    mutationFn: () => profilesApi.deleteOwnProfile(p.id),
    onSuccess: () => { setShowDeleteConfirm(false); onDeleted(); },
  });

  return (
    <div className="gc" style={{
      padding:'28px', display:'flex', flexDirection:'column', gap:'14px',
      ...(single ? { maxWidth:'660px', margin:'0 auto', width:'100%' } : {}),
    }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ fontSize:'36px', lineHeight:1 }}>{ROLE_ICON[p.roleType] ?? '👤'}</div>
          <div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'var(--offwhite)', marginBottom:'2px' }}>
              {p.fullName}
            </div>
            <div style={{ fontSize:'12px', color:'var(--gold3)', fontWeight:600 }}>
              {ROLE_LABEL[p.roleType] ?? p.roleType}
            </div>
          </div>
        </div>
        <span style={{ padding:'4px 12px', borderRadius:'50px', fontSize:'10px', fontWeight:700,
          background:st.bg, border:`1px solid ${st.border}`, color:st.color, whiteSpace:'nowrap' }}>
          {st.label}
        </span>
      </div>

      <div style={{ height:'1px', background:'var(--bf)' }} />

      {/* Core info */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'16px' }}>
        {p.city && <Info label="Location" value={p.city} />}
        {p.workMode && <Info label="Work Mode" value={p.workMode.replace(/_/g,' ')} />}
        {p.marketField && <Info label="Market" value={p.marketField.replace(/_/g,' ')} />}
        {p.payment && <Info label="Payment" value={p.payment} />}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Skills</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {skills.slice(0,8).map((s: string) => (
              <span key={s} style={{ padding:'3px 10px', borderRadius:'50px', fontSize:'11px',
                background:'rgba(200,146,10,0.07)', border:'1px solid var(--border)', color:'var(--offwhite)' }}>
                {s}
              </span>
            ))}
            {skills.length > 8 && <span style={{ fontSize:'11px', color:'var(--muted)', alignSelf:'center' }}>+{skills.length - 8} more</span>}
          </div>
        </div>
      )}

      {/* Summary */}
      {p.summary && (
        <div>
          <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>About</div>
          <p style={{ fontSize:'13px', color:'var(--offwhite)', lineHeight:1.7, margin:0 }}>
            {p.summary.length > 200 ? p.summary.slice(0,200) + '…' : p.summary}
          </p>
        </div>
      )}

      {/* Education */}
      {p.highestDegree && (
        <div>
          <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>Education</div>
          <div style={{ fontSize:'13px', color:'var(--offwhite)' }}>
            {p.highestDegree}{p.specialization ? ` — ${p.specialization}` : ''}
          </div>
          {p.institution && <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'2px' }}>{p.institution}{p.yearOfPassing ? `, ${p.yearOfPassing}` : ''}</div>}
        </div>
      )}

      {/* Applied for */}
      {p.appliedFor && (
        <div>
          <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'6px' }}>Looking For</div>

          {/* Contact preference — Recruiter / Hiring Manager */}
          {(p.roleType === 'RECRUITER' || p.roleType === 'HIRING_MANAGER') &&
            (p.roleFields?.contactTime || p.roleFields?.contactDays) && (
            <div>
              <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>
                How to Contact
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {p.roleFields?.contactTime && (
                  <div style={{ fontSize:'13px', color:'var(--offwhite)' }}>
                    🕐 {p.roleFields.contactTime}
                  </div>
                )}
                {p.roleFields?.contactDays && (
                  <div style={{ fontSize:'13px', color:'var(--offwhite)' }}>
                    📅 {p.roleFields.contactDays}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ fontSize:'13px', color:'var(--offwhite)' }}>{p.appliedFor}</div>
        </div>
      )}

      {/* Rejection reason */}
      {p.status === 'REJECTED' && p.rejectionReason && (
        <div style={{ padding:'12px', borderRadius:'10px', background:'rgba(220,38,38,0.06)', border:'1px solid rgba(220,38,38,0.2)' }}>
          <div style={{ fontSize:'10px', fontWeight:700, color:'#DC2626', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'4px' }}>Moderator Feedback</div>
          <div style={{ fontSize:'12px', color:'var(--offwhite)', lineHeight:1.6 }}>{p.rejectionReason}</div>
        </div>
      )}

      {/* Footer */}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'12px', borderTop:'1px solid var(--bf)', marginTop:'auto', flexWrap:'wrap', gap:'8px' }}>
        <span style={{ fontSize:'11px', color:'var(--muted)' }}>
          Submitted {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {p.status === 'REJECTED' && (
            <Link href={`/profile/${p.roleType}`} style={{
              padding:'7px 16px', borderRadius:'50px', fontSize:'11px', fontWeight:700,
              background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.3)',
              color:'#DC2626', textDecoration:'none',
            }}>
              Edit & Resubmit →
            </Link>
          )}
          {p.status === 'APPROVED' && (
            <span style={{ fontSize:'11px', color:'#16A34A', fontWeight:600 }}>Live on Platform</span>
          )}
          {p.status === 'PENDING' && (
            <span style={{ fontSize:'11px', color:'#D97706', fontWeight:600 }}>Awaiting Review</span>
          )}
          { ENABLE_SELF_PROFILE_DELETE && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:'11px', color:'var(--faint)', textDecoration:'underline' }}
          >
            Delete Profile
          </button>
          )}
        </div>
      </div>

      {/* Delete profile confirmation */}
      {showDeleteConfirm && (
        <div onClick={() => setShowDeleteConfirm(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'20px', border:'1px solid rgba(220,38,38,0.3)', padding:'28px', maxWidth:'380px', width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🗑️</div>
            <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'var(--offwhite)', marginBottom:'10px' }}>
              Delete your {ROLE_LABEL[p.roleType] ?? p.roleType} profile?
            </h3>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.75, marginBottom:'20px' }}>
              This cannot be undone.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <button
                onClick={() => deleteMut.mutate()}
                disabled={deleteMut.isPending}
                style={{ padding:'12px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', fontFamily:'Raleway,sans-serif', fontWeight:700, background:'var(--err)', color:'#fff' }}
              >
                {deleteMut.isPending ? 'Deleting…' : 'Yes, Delete This Profile'}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ padding:'10px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'2px' }}>{label}</div>
      <div style={{ fontSize:'13px', color:'var(--offwhite)', fontWeight:500 }}>{value}</div>
    </div>
  );
}

export default function MyProfilePage() {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();


  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['my-profiles'],
    queryFn:  () => profilesApi.getMine(),
    enabled:  isAuthenticated,
  });

  const list = profiles as any[];
  {/*
  const existingRoles  = new Set(list.map((p: any) => p.roleType));
  const approvedCount  = list.filter((p: any) => p.status === 'APPROVED').length;
  const availableRoles = ALL_ROLES.filter(r => !existingRoles.has(r.slug));
  const router         = useRouter();

  const handleRoleClick = (slug: string) => {
    if (approvedCount >= 2 && !existingRoles.has(slug)) {
      setWarnRole(slug);
    } else {
      router.push(`/profile/${slug}`);
    }
  };
  */}
  const single = list.length === 1;

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', padding:'40px' }}>
        <div style={{ fontSize:'48px' }}>🔐</div>
        <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, color:'var(--offwhite)' }}>Sign In to View Your Profiles</h2>
        <Link href="/login" className="btn-gold" style={{ padding:'12px 28px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>Sign In →</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'36px 4%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--gold2)' }}>Account</span>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,3vw,36px)', fontWeight:700, color:'var(--offwhite)', marginTop:'6px' }}>
            My <span style={{ background:'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Profiles</span>
          </h1>
        </div>
        {list.length < 2 && (

            <Link href="/profile/create" className="btn-gold" style={{ padding:'10px 22px', borderRadius:'50px', textDecoration:'none', fontSize:'12px', fontFamily:'Raleway,sans-serif', fontWeight:700 }}>
                + Create New Profile
            </Link>
        )}
      </div>


    {/* Role picker */}
    {/*  {showPicker && availableRoles.length > 0 && (
        <div className="gc" style={{ padding:'22px', marginBottom:'24px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--offwhite)', marginBottom:'14px' }}>Select a role type to create</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
            {availableRoles.map(r => (
              <div key={r.slug} onClick={() => handleRoleClick(r.slug)}
                style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 16px', borderRadius:'12px', border:'1px solid var(--bf)', cursor:'pointer', background:'rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize:'22px' }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:700, color:'var(--offwhite)' }}>{r.name}</div>
                  <div style={{ fontSize:'10px', color:'var(--muted)' }}>{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} 
    */}

      {/* 3rd profile warning */}
      { /*{warnRole && (
        <div onClick={() => setWarnRole(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'20px', padding:'28px', maxWidth:'400px', width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>ℹ️</div>
            <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'var(--offwhite)', marginBottom:'10px' }}>No Bonus Points</h3>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.75, marginBottom:'20px' }}>You already have 2 approved profiles. The 1,000-point bonus only applies to your 1st and 2nd approved profiles.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <button onClick={() => { setWarnRole(null); router.push(`/profile/${warnRole}`); }}
                className="btn-gold" style={{ padding:'13px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>
                Continue Without Bonus
              </button>
              <button onClick={() => setWarnRole(null)}
                style={{ padding:'10px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} 
      */}

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--muted)', fontSize:'13px' }}>Loading your profiles…</div>
      ) : list.length === 0 ? (
        <div className="gc" style={{ padding:'60px', textAlign:'center', maxWidth:'500px', margin:'0 auto' }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>👤</div>
          <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'var(--offwhite)', marginBottom:'10px' }}>No Profiles Yet</h3>
          <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.8, marginBottom:'24px' }}>
            Create your first profile to be discovered by recruiters, organisations and trainers.
          </p>

        <Link href="/profile/create" className="btn-gold" style={{ padding:'12px 28px', borderRadius:'50px', textDecoration:'none', fontSize:'12px', fontFamily:'Raleway,sans-serif', fontWeight:700 }}>
            Create Your First Profile →
        </Link>

        </div>
      ) : single ? (
        <ProfileCard p={list[0]} single={true} onDeleted={() => qc.invalidateQueries({ queryKey: ['my-profiles'] })} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(420px,1fr))', gap:'20px' }}>
          {list.map((p: any) => <ProfileCard key={p.id} p={p} single={false} onDeleted={() => qc.invalidateQueries({ queryKey: ['my-profiles'] })} />)}
        </div>
      )}
    </div>
  );
}