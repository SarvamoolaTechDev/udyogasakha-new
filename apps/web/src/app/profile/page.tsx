'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const ROLES = [
  { slug:'INTERN',         icon:'🎓', name:'Intern',        sub:'Certificate · Stipend · PPO' },
  { slug:'FRESHER',        icon:'🌱', name:'Fresher',       sub:'Entry-level · Campus · 0–1 yr' },
  { slug:'JOB_SEEKER',     icon:'🔍', name:'Job Seeker',    sub:'Experienced · Switch · Relocation' },
  { slug:'FREELANCER',     icon:'💻', name:'Freelancer',    sub:'Project · Hourly · Remote' },
  { slug:'CONSULTANT',     icon:'🧑‍💼', name:'Consultant', sub:'Advisory · Domain · Contract' },
  { slug:'HIRING_MANAGER', icon:'📊', name:'Hiring Mgr',   sub:'Team Builder · JD · Interview' },
  { slug:'RECRUITER',      icon:'🤝', name:'Recruiter',     sub:'Sourcing · ATS · Placement' },
  { slug:'TRAINER',        icon:'📚', name:'Trainer',       sub:'Corporate · Online · L&D' },
  { slug:'VENDOR',         icon:'🏭', name:'Vendor',        sub:'B2B · Products · Partnership' },
  { slug:'MODERATOR_ROLE', icon:'🛡️', name:'Moderator',    sub:'Validator · Activation · Review' },
  { slug:'RFP_PROVIDER',   icon:'📋', name:'RFP Provider',  sub:'Tender · Publisher · Org' },
];

const STATUS_STYLE: Record<string, { bg:string; border:string; color:string; label:string }> = {
  PENDING:  { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)',  color:'var(--warn)', label:'⏳ Pending' },
  APPROVED: { bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.3)',  color:'var(--ok)',   label:'✅ Live'    },
  REJECTED: { bg:'rgba(255,107,107,0.1)', border:'rgba(255,107,107,0.3)', color:'var(--err)',  label:'❌ Rejected'},
};

export default function ProfileHubPage() {
  const { isAuthenticated } = useAuthStore();

  const { data: myProfiles = [] } = useQuery({
    queryKey: ['my-profiles'],
    queryFn:  () => profilesApi.getMine(),
    enabled:  isAuthenticated,
  });

  // Build a lookup: roleType → profile
  const byRole = Object.fromEntries((myProfiles as any[]).map(p => [p.roleType, p]));

  return (
    <section style={{ padding:'64px 4%' }}>
      <div style={{ textAlign:'center', marginBottom:'32px' }}>
        <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--gold2)' }}>Candidate Dashboard</span>
        <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:700, color:'#fff', marginTop:'10px', lineHeight:1.2 }}>
          My <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Career Profile</span>
        </h1>
        <div className="orn"><div className="ol"/><div className="od"/><div className="ol-r"/></div>
        <p style={{ fontSize:'13px', color:'var(--muted)', fontWeight:300, maxWidth:'500px', margin:'10px auto 0', lineHeight:1.8 }}>
          Choose a role type to create or update your profile. Each role has its own dedicated form.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:'14px', maxWidth:'960px', margin:'0 auto' }}>
        {ROLES.map(r => {
          const profile = byRole[r.slug];
          const st = profile ? STATUS_STYLE[profile.status] : null;

          return (
            <Link key={r.slug} href={`/profile/${r.slug}`} style={{ textDecoration:'none', display:'block' }}>
              <div
                className="gc gc-hover"
                style={{
                  padding:'22px', textAlign:'center', cursor:'pointer',
                  // Highlight cards that have a submitted profile
                  borderColor: st ? st.border : undefined,
                }}
              >
                <div style={{ fontSize:'32px', marginBottom:'10px' }}>{r.icon}</div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, color:'#fff', marginBottom:'4px' }}>{r.name}</div>

                {st ? (
                  // Profile exists — show status badge
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'2px 8px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:st.bg, border:`1px solid ${st.border}`, color:st.color }}>
                    {st.label}
                  </span>
                ) : (
                  <div style={{ fontSize:'10px', color:'var(--muted)', fontWeight:300, lineHeight:1.5 }}>{r.sub}</div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Summary strip — only shown when profiles exist */}
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
    </section>
  );
}
