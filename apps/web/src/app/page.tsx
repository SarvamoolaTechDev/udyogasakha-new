import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title:'One Platform. Infinite Careers.' };

const ROLES = [
  { icon:'🎓', name:'Intern',         slug:'INTERN',         desc:'Certificate · Stipend · Employment Option' },
  { icon:'🌱', name:'Fresher',        slug:'FRESHER',        desc:'Entry-level · 0–1 yr · Campus Hire' },
  { icon:'🔍', name:'Job Seeker',     slug:'JOB_SEEKER',     desc:'Experienced · Career Switch · Relocation' },
  { icon:'💻', name:'Freelancer',     slug:'FREELANCER',     desc:'Project-based · Hourly · Remote-first' },
  { icon:'🧑‍💼', name:'Consultant',  slug:'CONSULTANT',     desc:'Domain Expert · Advisory · Contract' },
  { icon:'📊', name:'Hiring Mgr',     slug:'HIRING_MANAGER', desc:'Team Builder · JD Creator · Interviewer' },
  { icon:'🤝', name:'Recruiter',      slug:'RECRUITER',      desc:'Talent Acquisition · Sourcing · ATS' },
  { icon:'📚', name:'Trainer',        slug:'TRAINER',        desc:'Skill Development · Corporate · Online' },
  { icon:'🏭', name:'Vendor',         slug:'VENDOR',         desc:'B2B Services · Products · Partnerships' },
  { icon:'🛡️', name:'Moderator',     slug:'MODERATOR_ROLE', desc:'Profile Validator · Activation · Review' },
  { icon:'📋', name:'RFP Provider',   slug:'RFP_PROVIDER',   desc:'Tender · Job Publisher · Organisation' },
];

const STEPS = [
  { n:1, icon:'📝', title:'Build Your Profile',  desc:'Select your role type, fill personal info, add experience, qualifications and submission details.' },
  { n:2, icon:'🛡️', title:'Moderator Review',    desc:'Moderators validate details, assign market mapping (IT / Non-IT / Services) and activate profiles.' },
  { n:3, icon:'🌐', title:'Go Live',             desc:'Your profile is published on the portal — visible to recruiters, organisations and hiring managers.' },
  { n:4, icon:'🏆', title:'Get Hired',           desc:'Connect, interview and land your dream role across IT, Non-IT and Services sectors.' },
];

const TESTIMONIALS = [
  { text:'Found my dream role at a top tech firm through Udyoga Sakha in just 3 weeks. The platform matched my profile perfectly.', name:'Arjun Mehta', role:'Software Engineer · Google', icon:'👨‍💻' },
  { text:'As a Hiring Manager, the quality of verified profiles here is exceptional. My team was fully staffed in record time.', name:'Priya Sharma', role:'HR Manager · Infosys', icon:'👩‍💼' },
  { text:'The internship listing showed certificate details and employment option upfront. Perfect transparency, zero surprises.', name:'Kavitha Reddy', role:'Intern → Full-time · TCS', icon:'🎓' },
];

function Orn() {
  return (
    <div className="orn">
      <div className="ol" /><div className="od" /><div className="ol-r" />
    </div>
  );
}

export default function HomePage() {
  const s = (css: React.CSSProperties) => css;

  return (
    <>
      {/* ── HERO ── */}
      <section style={{
        minHeight:'92vh', display:'flex', alignItems:'center', padding:'80px 4%', gap:'44px',
        background:`radial-gradient(ellipse 80% 60% at 70% 50%,rgba(29,62,160,0.3),transparent 70%),
                   radial-gradient(ellipse 40% 40% at 10% 20%,rgba(212,160,23,0.07),transparent 60%),var(--deep)`,
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ flex:1, maxWidth:'600px', zIndex:1 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 16px',
            borderRadius:'50px', marginBottom:'22px', fontSize:'10px', fontWeight:700,
            letterSpacing:'2px', textTransform:'uppercase', color:'var(--gold3)',
            border:'1px solid var(--border)', background:'rgba(212,160,23,0.07)',
          }}>
            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--gold2)', boxShadow:'0 0 8px var(--goldglow)', animation:'pulse 2s ease infinite' }} />
            India's Unified Employment Ecosystem
          </div>

          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(28px,5vw,62px)', lineHeight:1.1, fontWeight:700, color:'#fff', marginBottom:'14px' }}>
            One Platform.<br />
            <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Infinite Careers.</span>
          </h1>

          <p style={{ fontSize:'14px', lineHeight:1.85, color:'var(--muted)', fontWeight:300, maxWidth:'480px', marginBottom:'32px' }}>
            For Interns to Consultants, Freshers to Hiring Managers — every professional finds their opportunity here with verified listings and transparent processes.
          </p>

          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'44px' }}>
            <Link href="/jobs" className="btn-gold" style={{ padding:'12px 26px', borderRadius:'50px', fontSize:'12px', textDecoration:'none' }}>Explore Jobs →</Link>
            <Link href="/post" className="btn-outline" style={{ padding:'12px 26px', borderRadius:'50px', fontSize:'12px', textDecoration:'none' }}>Post a Job</Link>
          </div>

          <div style={{ display:'flex', gap:'32px', flexWrap:'wrap', paddingTop:'28px', borderTop:'1px solid var(--bf)' }}>
            {[['12,400+','Active Jobs'],['4.8L+','Professionals'],['11','Role Types'],['96%','Placement Rate']].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'28px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:'10px', color:'var(--muted)', marginTop:'3px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating job card */}
        <div style={{ flex:1, display:'flex', justifyContent:'flex-end', alignItems:'center', zIndex:1 }}>
          <div style={{ position:'relative', width:'300px' }}>
            <div className="gc float-anim" style={{ padding:'18px', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', background:'linear-gradient(135deg,rgba(212,160,23,0.15),rgba(212,160,23,0.05))', border:'1px solid var(--border)' }}>🏢</div>
                <div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'#fff' }}>TCS Digital</div>
                  <div style={{ fontSize:'10px', color:'var(--muted)' }}>Bengaluru · IT · Hybrid</div>
                </div>
              </div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>Senior Software Engineer</div>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px' }}>
                {['Permanent','5+ yrs','B.Tech'].map(t => (
                  <span key={t} style={{ padding:'3px 10px', borderRadius:'50px', fontSize:'9px', fontWeight:700, color:'var(--gold3)', background:'rgba(212,160,23,0.1)', border:'1px solid rgba(212,160,23,0.25)' }}>{t}</span>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>₹18–28 LPA</div>
                <Link href="/jobs" className="btn-gold" style={{ padding:'6px 14px', borderRadius:'50px', fontSize:'10px', textDecoration:'none' }}>Apply Now</Link>
              </div>
            </div>
            <div style={{
              position:'absolute', bottom:'-18px', right:'-18px',
              background:'rgba(10,21,64,0.96)', border:'1px solid var(--border)',
              boxShadow:'0 8px 28px rgba(0,0,0,0.5)', borderRadius:'12px',
              padding:'9px 14px', display:'flex', alignItems:'center', gap:'8px',
              animation:'float 4s ease-in-out 1s infinite',
            }}>
              <span style={{ fontSize:'16px' }}>🎉</span>
              <div>
                <div style={{ fontSize:'11px', fontWeight:600, color:'#fff' }}>Profile Approved!</div>
                <div style={{ fontSize:'9px', color:'var(--muted)' }}>Moderator activated your profile</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11 ROLES ── */}
      <section style={{ padding:'64px 4%', background:'linear-gradient(135deg,rgba(13,30,90,0.5),rgba(6,13,42,0.7))', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--gold2)' }}>For Everyone</span>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:700, color:'#fff', marginTop:'10px', marginBottom:0, lineHeight:1.2 }}>
            11 Professional <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Roles</span>
          </h2>
          <Orn />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:'14px', maxWidth:'1100px', margin:'0 auto' }}>
          {ROLES.map(r => (
            <Link key={r.slug} href={`/profile/${r.slug}`} style={{ textDecoration:'none', display:'block' }}>
              <div className="gc gc-hover" style={{ padding:'22px', textAlign:'center', cursor:'pointer' }}>
                <div style={{ fontSize:'32px', marginBottom:'10px' }}>{r.icon}</div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, color:'#fff', marginBottom:'4px' }}>{r.name}</div>
                <div style={{ fontSize:'10px', color:'var(--muted)', fontWeight:300, lineHeight:1.5 }}>{r.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section style={{ padding:'64px 4%' }}>
        <div className="two-col-section" style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <div>
            <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,3vw,36px)', fontWeight:700, color:'#fff', marginBottom:'14px' }}>
              About <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Udyoga Sakha</span>
            </h2>
            {['Sarvamoola Udyoga Sakha is a unified employment ecosystem designed to serve every class of professional — from students seeking internships to seasoned consultants, from individual freelancers to large organisations publishing RFPs.',
              'Our platform is built on the principles of fairness, transparency and efficiency. Every profile goes live only after Moderator review, ensuring quality and trust for all stakeholders.',
              'Mission: Fair, fast and efficient job matching for all classes of people.'
            ].map((p, i) => (
              <p key={i} style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.85, fontWeight:300, marginBottom:'12px' }}>{p}</p>
            ))}
            <Link href="/jobs" className="btn-gold" style={{ display:'inline-block', padding:'12px 26px', borderRadius:'50px', fontSize:'12px', textDecoration:'none', marginTop:'12px' }}>
              Explore Openings →
            </Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { icon:'🛡️', t:'Moderator-Approved',     d:'All profiles and listings reviewed and validated before going live.' },
              { icon:'📊', t:'Market Mapped',           d:'Every profile classified into IT, Non-IT or Services for precise matching.' },
              { icon:'🌐', t:'11 Role Types',           d:'Each role has its own profile page with tailored fields and experience timeline.' },
              { icon:'📜', t:'Certificate & Employment',d:'Internship listings clearly show certificate availability and post-internship employment option.' },
            ].map(c => (
              <div key={c.t} className="gc" style={{ padding:'18px' }}>
                <div style={{ fontSize:'24px', marginBottom:'8px' }}>{c.icon}</div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'#fff', marginBottom:'4px' }}>{c.t}</div>
                <div style={{ fontSize:'12px', color:'var(--muted)', lineHeight:1.6, fontWeight:300 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'64px 4%', background:'linear-gradient(135deg,rgba(13,30,90,0.4),rgba(6,13,42,0.6))', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--gold2)' }}>Simple Process</span>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:700, color:'#fff', marginTop:'10px', marginBottom:0, lineHeight:1.2 }}>
            How It <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Works</span>
          </h2>
          <Orn />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'18px', maxWidth:'1100px', margin:'0 auto' }}>
          {STEPS.map(st => (
            <div key={st.n} className="gc" style={{ padding:'26px', textAlign:'center' }}>
              <div style={{ fontFamily:'Cinzel,serif', width:'30px', height:'30px', borderRadius:'50%', fontSize:'12px', fontWeight:800, color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', background:'linear-gradient(135deg,var(--gold),var(--gold2))', boxShadow:'0 4px 12px var(--goldglow)' }}>{st.n}</div>
              <div style={{ fontSize:'32px', marginBottom:'12px' }}>{st.icon}</div>
              <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'7px' }}>{st.title}</h3>
              <p style={{ fontSize:'12px', color:'var(--muted)', lineHeight:1.7, fontWeight:300 }}>{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding:'64px 4%' }}>
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--gold2)' }}>Success Stories</span>
          <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:700, color:'#fff', marginTop:'10px', marginBottom:0, lineHeight:1.2 }}>
            Real <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Careers</span> Built Here
          </h2>
          <Orn />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'18px', maxWidth:'1100px', margin:'0 auto' }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="gc" style={{ padding:'26px' }}>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'44px', background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:0.6, marginBottom:'12px' }}>"</div>
              <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'16px', fontStyle:'italic', color:'var(--offwhite)', lineHeight:1.7, marginBottom:'18px' }}>{t.text}</p>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'38px', height:'38px', borderRadius:'50%', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', background:'linear-gradient(135deg,rgba(29,62,160,0.5),rgba(45,107,228,0.4))', flexShrink:0 }}>{t.icon}</div>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:600, color:'#fff' }}>{t.name}</div>
                  <div style={{ fontSize:'11px', color:'var(--muted)' }}>{t.role}</div>
                </div>
                <div style={{ marginLeft:'auto', color:'var(--gold2)', fontSize:'12px' }}>★★★★★</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'70px 4%', textAlign:'center', background:'linear-gradient(135deg,rgba(13,30,90,0.7),rgba(6,13,42,0.9))', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--gold2)' }}>Start Today — It's Free</span>
        <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(24px,4vw,48px)', fontWeight:700, color:'#fff', margin:'12px 0', lineHeight:1.2 }}>
          Your Career <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Starts Here</span>
        </h2>
        <p style={{ fontSize:'13px', color:'var(--muted)', fontWeight:300, marginBottom:'30px' }}>Join 4.8 Lakh+ professionals. Profiles published only after Moderator Approval.</p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/profile" className="btn-gold" style={{ padding:'12px 26px', borderRadius:'50px', fontSize:'12px', textDecoration:'none' }}>Create My Profile</Link>
          <Link href="/jobs"    className="btn-outline" style={{ padding:'12px 26px', borderRadius:'50px', fontSize:'12px', textDecoration:'none' }}>Browse Jobs →</Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:'48px 4% 24px', background:'var(--navy)', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'32px', marginBottom:'36px', maxWidth:'1100px', margin:'0 auto 36px' }}>
          <div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, color:'#fff', lineHeight:1.5, marginBottom:'10px' }}>
              Sarvamoola<br /><span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Udyoga Sakha</span>
            </div>
            <p style={{ fontSize:'11px', color:'var(--muted)', lineHeight:1.8, fontWeight:300, maxWidth:'240px' }}>India's unified employment ecosystem connecting talent across 11 roles with verified opportunities.</p>
          </div>
          {[
            { h:'For Job Seekers', links:['Browse Jobs','Create Profile','Career Guide'] },
            { h:'For Organisations', links:['Post a Job','Submit RFP','Find Consultants'] },
            { h:'Platform', links:['About Us','Moderator Panel','Contact Us'] },
          ].map(col => (
            <div key={col.h}>
              <h4 style={{ fontFamily:'Cinzel,serif', fontSize:'10px', fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'14px' }}>{col.h}</h4>
              {col.links.map(l => <a key={l} href="#" style={{ display:'block', fontSize:'11px', color:'var(--muted)', textDecoration:'none', marginBottom:'8px', fontWeight:300 }}>{l}</a>)}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px', paddingTop:'20px', borderTop:'1px solid var(--bf)', maxWidth:'1100px', margin:'0 auto' }}>
          <div style={{ fontSize:'11px', color:'var(--muted)', fontWeight:300 }}>© 2025 Sarvamoola Udyoga Sakha — All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
