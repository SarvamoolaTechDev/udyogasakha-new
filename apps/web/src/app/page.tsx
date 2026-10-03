import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title:'One Platform. Infinite Careers.' };

const ROLES = [
  { icon:'🎓', name:'Intern',         slug:'INTERN',         desc:'Certificate · Stipend · Employment Option' },
  { icon:'🌱', name:'Fresher',        slug:'FRESHER',        desc:'Entry-level · 0–1 yr · Campus Hire' },
  { icon:'🔍', name:'Job Seeker',     slug:'JOB_SEEKER',     desc:'Experienced · Career Switch · Relocation' },
  { icon:'🧑‍💼', name:'Consultant',  slug:'CONSULTANT',     desc:'Freelance · Domain Expert · Contract' },
  { icon:'📊', name:'Hiring Mgr',     slug:'HIRING_MANAGER', desc:'Team Builder · JD Creator · Interviewer' },
  { icon:'🤝', name:'Recruiter',      slug:'RECRUITER',      desc:'Talent Acquisition · Sourcing · ATS' },
  { icon:'📚', name:'Trainer',        slug:'TRAINER',        desc:'Skill Development · Corporate · Online' },
  { icon:'🏭', name:'Vendor',         slug:'VENDOR',         desc:'B2B Services · Products · Partnerships' },
  { icon:'📋', name:'RFP Provider',   slug:'RFP_PROVIDER',   desc:'Tender · Job Publisher · Organisation' },
];

const SEEKER_STEPS = [
  { n:1, icon:'📝', title:'Register',           desc:'Create your free account and select your role type — Fresher, Job Seeker, Consultant, Recruiter and more.' },
  { n:2, icon:'👤', title:'Build Your Profile',  desc:'Fill in personal info, qualifications, experience and submission details tailored to your role.' },
  { n:3, icon:'🛡️', title:'Moderator Review',   desc:'Your profile is reviewed and validated by a moderator. You receive an email once approved.' },
  { n:4, icon:'🌐', title:'Go Live',             desc:'Your profile is published on the portal and visible to recruiters, organisations and hiring managers.' },
  { n:5, icon:'🔍', title:'Unlock Job Details',  desc:'Browse listings and unlock full recruiter contact details using your wallet points.' },
  { n:6, icon:'🏆', title:'Get Hired',           desc:'Connect directly with recruiters, attend interviews and land your next opportunity.' },
];

const RECRUITER_STEPS = [
  { n:1, icon:'📝', title:'Register',            desc:'Create your free account as a Recruiter, Hiring Manager, Vendor or RFP Provider.' },
  { n:2, icon:'📋', title:'Post a Job / RFP',    desc:'Fill in the listing details — role, location, salary, skills required and work mode.' },
  { n:3, icon:'🛡️', title:'Moderator Approval', desc:'Your listing is reviewed for quality and compliance before it goes live on the portal.' },
  { n:4, icon:'🌐', title:'Listing Goes Live',   desc:'Your job posting is visible to thousands of verified candidates across 9 role types.' },
  { n:5, icon:'👥', title:'Unlock Candidate Details', desc:'Browse approved candidate profiles and unlock contact details using wallet points.' },
  { n:6, icon:'✅', title:'Close the Position',  desc:'Connect with candidates directly, conduct interviews, and successfully fill your role.' },
];


function Orn() {
  return (
    <div className="orn">
      <div className="ol" /><div className="od" /><div className="ol-r" />
    </div>
  );
}

// Deep indigo-navy — darker than standard blue, works well on white
const LIFECYCLE_BLUE = '#1A3A6B';
const LIFECYCLE_BLUE_BG = 'rgba(26,58,107,0.06)';
const LIFECYCLE_BLUE_BORDER = 'rgba(26,58,107,0.18)';
const LIFECYCLE_LINE = 'linear-gradient(90deg,rgba(26,58,107,0.1),rgba(26,58,107,0.28),rgba(26,58,107,0.1))';

function LifecycleRow({ label, steps }: { label: string; steps: typeof SEEKER_STEPS }) {
  return (
    <div style={{ marginBottom: '44px' }}>
      {/* Row label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
        <span style={{
          padding: '5px 16px', borderRadius: '50px', fontSize: '11px', fontWeight: 700,
          letterSpacing: '1.5px', textTransform: 'uppercase' as const,
          background: LIFECYCLE_BLUE_BG,
          border: `1px solid ${LIFECYCLE_BLUE_BORDER}`,
          color: LIFECYCLE_BLUE,
        }}>{label}</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--bf)' }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '14px', position: 'relative' }}>
        {/* Connecting line */}
        <div style={{
          position: 'absolute', top: '24px', left: '8%', right: '8%', height: '2px',
          background: LIFECYCLE_LINE, zIndex: 0,
        }} />

        {steps.map(st => (
          <div key={st.n} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* Icon bubble */}
            <div style={{
              width: '50px', height: '50px', borderRadius: '50%', margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              background: LIFECYCLE_BLUE_BG,
              border: `2px solid ${LIFECYCLE_BLUE_BORDER}`,
              boxShadow: '0 2px 10px rgba(26,58,107,0.08)',
            }}>{st.icon}</div>

            {/* Step number badge */}
            <div style={{
              position: 'absolute', top: '-4px', right: 'calc(50% - 29px)',
              width: '17px', height: '17px', borderRadius: '50%',
              fontSize: '9px', fontWeight: 800, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg,${LIFECYCLE_BLUE},#0F2347)`,
            }}>{st.n}</div>

            <h4 style={{
              fontFamily: 'Cinzel,serif', fontSize: '12px', fontWeight: 700,
              color: 'var(--offwhite)', marginBottom: '6px', lineHeight: 1.35,
            }}>{st.title}</h4>
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.65, fontWeight: 400 }}>{st.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '80px 4%', gap: '44px',
        background: `radial-gradient(ellipse 70% 50% at 70% 50%,rgba(37,99,235,0.06),transparent 70%),
                     radial-gradient(ellipse 40% 40% at 10% 20%,rgba(212,160,23,0.05),transparent 60%),#FFFFFF`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ flex: 1, maxWidth: '600px', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px',
            borderRadius: '50px', marginBottom: '22px', fontSize: '10px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold3)',
            border: '1px solid var(--border)', background: 'rgba(200,146,10,0.06)',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold2)', boxShadow: '0 0 8px var(--goldglow)', animation: 'pulse 2s ease infinite' }} />
            A Unified Employment Ecosystem
          </div>

          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,5vw,62px)', lineHeight: 1.1, fontWeight: 700, color: 'var(--offwhite)', marginBottom: '14px' }}>
            One Platform.<br />
            <span style={{ background: 'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Infinite Careers.</span>
          </h1>

          <p style={{ fontSize: '15px', lineHeight: 1.9, color: 'var(--muted)', fontWeight: 300, maxWidth: '480px', marginBottom: '32px' }}>
            For Interns to Consultants, Freshers to Hiring Managers — every professional finds their opportunity here with verified listings and transparent processes.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '44px' }}>
            <Link href="/jobs" className="btn-gold" style={{ padding: '12px 26px', borderRadius: '50px', fontSize: '12px', textDecoration: 'none' }}>Explore Jobs →</Link>
            <Link href="/post" className="btn-outline" style={{ padding: '12px 26px', borderRadius: '50px', fontSize: '12px', textDecoration: 'none' }}>Post a Job</Link>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', paddingTop: '28px', borderTop: '1px solid var(--bf)' }}>
            {[['12,400+','Active Jobs'],['4.8L+','Professionals'],['9','Role Types'],['96%','Placement Rate']].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: '28px', fontWeight: 700, background: 'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating job card */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', zIndex: 1 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <div className="gc float-anim" style={{ padding: '18px', boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: 'rgba(200,146,10,0.08)', border: '1px solid var(--border)' }}>🏢</div>
                <div>
                  <div style={{ fontFamily: 'Cinzel,serif', fontSize: '13px', fontWeight: 700, color: 'var(--offwhite)' }}>TCS Digital</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Bengaluru · IT · Hybrid</div>
                </div>
              </div>
              <div style={{ fontFamily: 'Cinzel,serif', fontSize: '15px', fontWeight: 700, color: 'var(--offwhite)', marginBottom: '8px' }}>Senior Software Engineer</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {['Permanent','5+ yrs','B.Tech'].map(t => (
                  <span key={t} style={{ padding: '3px 10px', borderRadius: '50px', fontSize: '9px', fontWeight: 700, color: 'var(--gold3)', background: 'rgba(200,146,10,0.08)', border: '1px solid rgba(200,146,10,0.2)' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: '13px', fontWeight: 700, background: 'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>₹18–28 LPA</div>
                <Link href="/jobs" className="btn-gold" style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '10px', textDecoration: 'none' }}>Apply Now</Link>
              </div>
            </div>
            <div style={{
              position: 'absolute', bottom: '-18px', right: '-18px',
              background: '#FFFFFF', border: '1px solid var(--border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)', borderRadius: '12px',
              padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '8px',
              animation: 'float 4s ease-in-out 1s infinite',
            }}>
              <span style={{ fontSize: '16px' }}>🎉</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--offwhite)' }}>Profile Approved!</div>
                <div style={{ fontSize: '9px', color: 'var(--muted)' }}>Moderator activated your profile</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9 ROLES ── */}
      <section style={{ padding: '64px 4%', background: '#F8F9FF', borderTop: '1px solid var(--bf)', borderBottom: '1px solid var(--bf)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold2)' }}>For Everyone</span>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(22px,3.5vw,40px)', fontWeight: 700, color: 'var(--offwhite)', marginTop: '10px', marginBottom: 0, lineHeight: 1.2 }}>
            9 Professional <span style={{ background: 'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Roles</span>
          </h2>
          <Orn />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch', gap: '14px', maxWidth: '1100px', margin: '0 auto' }}>
          {ROLES.map(r => (
            <Link key={r.slug} href={`/profile/${r.slug}`} style={{ textDecoration: 'none', display: 'flex', width: '155px' }}>
              <div className="gc gc-hover" style={{ padding: '22px', textAlign: 'center', cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{r.icon}</div>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: '13px', fontWeight: 700, color: 'var(--offwhite)', marginBottom: '5px' }}>{r.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.55 }}>{r.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '64px 4%', background: '#FFFFFF' }}>
        <div className="two-col-section" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div>
            <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, color: 'var(--offwhite)', marginBottom: '14px' }}>
              About <span style={{ background: 'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Udyoga Sakha</span>
            </h2>
            {['Sarvamoola Udyoga Sakha is a unified employment ecosystem designed to serve every class of professional — from students seeking internships to seasoned consultants, from individual freelancers to large organisations publishing RFPs.',
              'Our platform is built on the principles of fairness, transparency and efficiency. Every profile goes live only after Moderator review, ensuring quality and trust for all stakeholders.',
              'Mission: Fair, fast and efficient job matching for all classes of people.',
            ].map((p, i) => (
              <p key={i} style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.9, fontWeight: 300, marginBottom: '14px' }}>{p}</p>
            ))}
            <Link href="/jobs" className="btn-gold" style={{ display: 'inline-block', padding: '12px 26px', borderRadius: '50px', fontSize: '12px', textDecoration: 'none', marginTop: '12px' }}>
              Explore Openings →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon:'🛡️', t:'Moderator-Approved',      d:'All profiles and listings reviewed and validated before going live.' },
              { icon:'📊', t:'Market Mapped',            d:'Every profile classified into IT, Non-IT or Services for precise matching.' },
              { icon:'🌐', t:'9 Role Types',            d:'Each role has its own profile page with tailored fields and experience timeline.' },
              { icon:'📜', t:'Certificate & Employment', d:'Internship listings clearly show certificate availability and post-internship employment option.' },
            ].map(c => (
              <div key={c.t} className="gc" style={{ padding: '18px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{c.icon}</div>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: '15px', fontWeight: 700, color: 'var(--offwhite)', marginBottom: '6px' }}>{c.t}</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65, fontWeight: 300 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — TWO LIFECYCLE ROWS ── */}
      <section style={{ padding: '64px 4%', background: '#F8F9FF', borderTop: '1px solid var(--bf)', borderBottom: '1px solid var(--bf)' }}>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold2)' }}>Simple Process</span>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(22px,3.5vw,40px)', fontWeight: 700, color: 'var(--offwhite)', marginTop: '10px', marginBottom: 0, lineHeight: 1.2 }}>
            How It <span style={{ background: 'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Works</span>
          </h2>
          <Orn />
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '14px', fontWeight: 300 }}>Two journeys, one platform — whether you're finding work or hiring talent.</p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <LifecycleRow label="For Job Seekers" steps={SEEKER_STEPS} />
          <LifecycleRow label="For Recruiters & Employers" steps={RECRUITER_STEPS} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '70px 4%', textAlign: 'center', background: '#F8F9FF', borderTop: '1px solid var(--bf)', borderBottom: '1px solid var(--bf)' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold2)' }}>Start Today — It's Free</span>
        <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(24px,4vw,48px)', fontWeight: 700, color: 'var(--offwhite)', margin: '12px 0', lineHeight: 1.2 }}>
          Your Career <span style={{ background: 'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Starts Here</span>
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 300, marginBottom: '30px' }}>Join 4.8 Lakh+ professionals. Profiles published only after Moderator Approval.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/profile" className="btn-gold" style={{ padding: '12px 26px', borderRadius: '50px', fontSize: '12px', textDecoration: 'none' }}>Create My Profile</Link>
          <Link href="/jobs"    className="btn-outline" style={{ padding: '12px 26px', borderRadius: '50px', fontSize: '12px', textDecoration: 'none' }}>Browse Jobs →</Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '48px 4% 24px', background: '#1E2A4A', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '32px', marginBottom: '36px', maxWidth: '1100px', margin: '0 auto 36px' }}>
          <div>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: '12px', fontWeight: 700, color: '#fff', lineHeight: 1.5, marginBottom: '10px' }}>
              Sarvamoola<br /><span style={{ background: 'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Udyoga Sakha</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontWeight: 300, maxWidth: '240px' }}>A unified employment ecosystem connecting talent across 9 roles with verified opportunities.</p>
          </div>
          {[
            {
              h: 'For Job Seekers',
              links: [
                { label: 'Browse Jobs',    href: '/jobs'    },
                { label: 'Create Profile', href: '/profile' },
              ],
            },
            {
              h: 'For Organisations',
              links: [
                { label: 'Post a Job',       href: '/post'               },
                { label: 'Submit RFP',       href: '/post'               },
                { label: 'Find Consultants', href: '/talent'             },
              ],
            },
            {
              h: 'Platform',
              links: [
                { label: 'About Us',   href: '/#about'                  },
                { label: 'Contact Us', href: 'mailto:info@sarvamoola.in' },
              ],
            },
          ].map(col => (
            <div key={col.h}>
              <h4 style={{ fontFamily: 'Cinzel,serif', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', background: 'linear-gradient(135deg,var(--gold2),var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '14px' }}>{col.h}</h4>
              {col.links.map(l => <a key={l.label} href={l.href} style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '8px', fontWeight: 300 }}>{l.label}</a>)}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>© 2025 Sarvamoola Udyoga Sakha — All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}