import Link from 'next/link';

export interface Job {
  id: string; organisationName: string; title: string;
  targetRoleType: string; location: string; payment: string;
  salary?: string; workMode: string; certificateProvided: string;
  employmentOption: string; experienceRequired: string;
  duration: string; skills: string[]; description: string;
  icon?: string; postedAt: string;
}

const ROLE_LABEL: Record<string,string> = {
  INTERN:'Intern', FRESHER:'Fresher', JOB_SEEKER:'Job Seeker',
  FREELANCER:'Freelancer', CONSULTANT:'Consultant', HIRING_MANAGER:'Hiring Mgr',
  RECRUITER:'Recruiter', TRAINER:'Trainer', VENDOR:'Vendor',
  MODERATOR_ROLE:'Moderator', RFP_PROVIDER:'RFP Provider',
};
const EXP_LABEL: Record<string,string> = {
  ANY:'Any exp', FRESHER_0_1:'0–1 yr', EXP_1_3:'1–3 yrs',
  EXP_3_5:'3–5 yrs', EXP_5_8:'5–8 yrs', EXP_8_PLUS:'8+ yrs',
};
const DUR_LABEL: Record<string,string> = {
  SHORT_TERM:'1–3 mo', MEDIUM_TERM:'3–6 mo', LONG_TERM:'6+ mo',
  PERMANENT:'Permanent', PROJECT_BASED:'Project',
};

export function JobCard({ job }: { job: Job }) {
  const desc = (job.description || '').slice(0, 110);
  const wfh  = job.workMode === 'WFH';

  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration:'none', display:'block' }}>
      <div className="gc gc-hover" style={{ padding:'20px', cursor:'pointer' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', marginBottom:'12px' }}>
          <div style={{
            width:'44px', height:'44px', borderRadius:'12px', flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px',
            background:'linear-gradient(135deg,rgba(212,160,23,0.15),rgba(212,160,23,0.05))',
            border:'1px solid var(--border)',
          }}>{job.icon || '💼'}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'2px' }}>{job.organisationName}</div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{job.title}</div>
          </div>
          <div style={{ fontSize:'10px', color:'var(--faint)', whiteSpace:'nowrap', flexShrink:0 }}>
            {new Date(job.postedAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short' })}
          </div>
        </div>

        {/* Meta */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', fontSize:'10px', color:'var(--muted)', marginBottom:'10px' }}>
          <span>📍 {job.location}</span>
          <span>⏱️ {EXP_LABEL[job.experienceRequired] ?? job.experienceRequired}</span>
          <span>📅 {DUR_LABEL[job.duration] ?? job.duration}</span>
        </div>

        {/* Tags */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'12px' }}>
          <span className={`jtag ${wfh ? 'jtag-wfh' : ''}`}>{job.workMode.replace('_',' ')}</span>
          <span className={`jtag ${job.payment === 'PAID' ? 'jtag-paid' : ''}`}>{job.payment}</span>
          {job.certificateProvided === 'YES' && <span className="jtag jtag-cert">📜 Certificate</span>}
          <span className="jtag">{ROLE_LABEL[job.targetRoleType] ?? job.targetRoleType}</span>
        </div>

        {/* Description */}
        <p style={{ fontSize:'11px', color:'var(--muted)', lineHeight:1.65, marginBottom:'14px', fontWeight:300 }}>
          {desc}{desc.length === 110 ? '…' : ''}
        </p>

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'12px', borderTop:'1px solid rgba(212,160,23,0.08)' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            {job.salary || 'Competitive'}
          </div>
          <span className="btn-gold" style={{ padding:'7px 14px', borderRadius:'50px', fontSize:'10px', cursor:'pointer' }}>
            View & Apply →
          </span>
        </div>
      </div>
    </Link>
  );
}
