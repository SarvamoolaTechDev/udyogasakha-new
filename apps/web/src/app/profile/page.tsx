'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

// MODERATOR_ROLE removed — admins are appointed, not applied for.
// FREELANCER removed — merged into Consultant per client decision.
const ROLES = [
  { slug:'INTERN',         icon:'🎓', name:'Intern',        sub:'Certificate · Stipend · PPO' },
  { slug:'FRESHER',        icon:'🌱', name:'Fresher',       sub:'Entry-level · Campus · 0–1 yr' },
  { slug:'JOB_SEEKER',     icon:'🔍', name:'Job Seeker',    sub:'Experienced · Switch · Relocation' },
  { slug:'CONSULTANT',     icon:'🧑‍💼', name:'Consultant', sub:'Freelance · Domain Expert · Contract' },
  { slug:'HIRING_MANAGER', icon:'📊', name:'Hiring Mgr',   sub:'Team Builder · JD · Interview' },
  { slug:'RECRUITER',      icon:'🤝', name:'Recruiter',     sub:'Sourcing · ATS · Placement' },
  { slug:'TRAINER',        icon:'📚', name:'Trainer',       sub:'Corporate · Online · L&D' },
  { slug:'VENDOR',         icon:'🏭', name:'Vendor',        sub:'B2B · Products · Partnership' },
  { slug:'RFP_PROVIDER',   icon:'📋', name:'RFP Provider',  sub:'Tender · Publisher · Org' },
];

const STATUS_STYLE: Record<string, { bg:string; border:string; color:string; label:string }> = {
  PENDING:  { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)',  color:'var(--warn)', label:'⏳ Pending'  },
  APPROVED: { bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.3)',  color:'var(--ok)',   label:'✅ Live'     },
  REJECTED: { bg:'rgba(255,107,107,0.1)', border:'rgba(255,107,107,0.3)', color:'var(--err)',  label:'❌ Rejected' },
};

export default function ProfileHubPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // null = no warning shown; a role slug = warning is open for that role
  const [warnRole, setWarnRole] = useState<string | null>(null);

  const { data: myProfiles = [] } = useQuery({
    queryKey: ['my-profiles'],
    queryFn:  () => profilesApi.getMine(),
    enabled:  isAuthenticated,
  });

  // Lookup: roleType → profile object
  const byRole = Object.fromEntries((myProfiles as any[]).map(p => [p.roleType, p]));

  // Number of profiles the moderator has already approved
  const approvedCount = (myProfiles as any[]).filter(p => p.status === 'APPROVED').length;

  const handleRoleClick = (slug: string) => {
    const hasExistingProfile = !!byRole[slug];
    // Show warning only when: user already has 2 approved profiles AND
    // this role has no existing profile (would become a brand new 3rd submission)
    if (approvedCount >= 2 && !hasExistingProfile) {
      setWarnRole(slug);
    } else {
      router.push(`/profile/${slug}`);
    }
  };

  return (
    <section style={{ padding:'64px 4%' }}>
      {/* Page heading */}
      <div style={{ textAlign:'center', marginBottom:'32px' }}>
        <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--gold2)' }}>
          Candidate Dashboard
        </span>
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:700, color:'var(--offwhite)', marginTop:'10px', lineHeight:1.2 }}>
          My{' '}
          <span style={{ background:'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            Career Profile
          </span>
        </h1>
        <div className="orn"><div className="ol" /><div className="od" /><div className="ol-r" /></div>
        <p style={{ fontSize:'13px', color:'var(--muted)', fontWeight:300, maxWidth:'500px', margin:'10px auto 0', lineHeight:1.8 }}>
          Choose a role type to create or update your profile. Each role has its own dedicated form.
        </p>
      </div>

      {/* Role grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:'14px', maxWidth:'960px', margin:'0 auto' }}>
        {ROLES.map(r => {
          const profile = byRole[r.slug];
          const st = profile ? STATUS_STYLE[profile.status] : null;

          return (
            <div
              key={r.slug}
              onClick={() => handleRoleClick(r.slug)}
              style={{ textDecoration:'none', display:'block', cursor:'pointer' }}
            >
              <div
                className="gc gc-hover"
                style={{ padding:'22px', textAlign:'center', borderColor: st ? st.border : undefined }}
              >
                <div style={{ fontSize:'32px', marginBottom:'10px' }}>{r.icon}</div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, color:'var(--offwhite)', marginBottom:'4px' }}>
                  {r.name}
                </div>
                {st ? (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'2px 8px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:st.bg, border:`1px solid ${st.border}`, color:st.color }}>
                    {st.label}
                  </span>
                ) : (
                  <div style={{ fontSize:'10px', color:'var(--muted)', fontWeight:300, lineHeight:1.5 }}>
                    {r.sub}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile summary strip */}
      {(myProfiles as any[]).length > 0 && (
        <div style={{ maxWidth:'960px', margin:'28px auto 0', display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          {(['PENDING','APPROVED','REJECTED'] as const).map(s => {
            const n = (myProfiles as any[]).filter(p => p.status === s).length;
            if (!n) return null;
            const st = STATUS_STYLE[s];
            return (
              <div key={s} style={{ padding:'6px 16px', borderRadius:'50px', fontSize:'11px', fontWeight:600, background:st.bg, border:`1px solid ${st.border}`, color:st.color }}>
                {st.label} — {n} profile{n > 1 ? 's' : ''}
              </div>
            );
          })}
        </div>
      )}

      {/* 3rd profile warning modal */}
      {warnRole !== null && (
        <div
          onClick={() => setWarnRole(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:'20px', border:'1px solid rgba(200,146,10,0.3)', padding:'28px', maxWidth:'400px', width:'100%', textAlign:'center', boxShadow:'0 16px 48px rgba(0,0,0,0.15)' }}
          >
            <div style={{ fontSize:'36px', marginBottom:'14px' }}>ℹ️</div>
            <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'var(--offwhite)', marginBottom:'10px' }}>
              No Bonus Points for This Profile
            </h3>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.75, marginBottom:'22px' }}>
              You already have 2 approved profiles. The 1,000-point welcome bonus is awarded only for your 1st and 2nd approved profiles.
              You are welcome to create this profile — it will go through the normal review process and be published when approved.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <button
                onClick={() => { setWarnRole(null); router.push(`/profile/${warnRole}`); }}
                className="btn-gold"
                style={{ padding:'13px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', fontFamily:'Raleway,sans-serif' }}
              >
                Continue Without Bonus
              </button>
              <button
                onClick={() => setWarnRole(null)}
                style={{ padding:'10px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--muted)', fontFamily:'Raleway,sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}