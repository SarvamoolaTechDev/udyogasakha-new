'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { adsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const WORK_MODES   = ['WFH','ON_SITE','HYBRID','OFF_SITE'];
const DURATION_OPTS = [7, 15, 30] as const;

export default function NewAdPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [skillInput,  setSkillInput]  = useState('');
  const [skills,      setSkills]      = useState<string[]>([]);
  const [location,    setLocation]    = useState('');
  const [salary,      setSalary]      = useState('');
  const [workMode,    setWorkMode]     = useState('ON_SITE');
  const [contactPhone, setPhone]      = useState('');
  const [contactEmail, setEmail]      = useState('');
  const [duration,    setDuration]    = useState<number>(30);
  const [custom,      setCustom]      = useState('');
  const [isCustom,    setIsCustom]    = useState(false);
  const [error,       setError]       = useState('');

  const finalDuration = isCustom ? (parseInt(custom) || 1) : duration;

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(p => [...p, s]);
    setSkillInput('');
  };

  const mutation = useMutation({
    mutationFn: () => adsApi.create({ title, description, skills, location, salaryExpect: salary, workMode, contactPhone, contactEmail, durationDays: finalDuration }),
    onSuccess:  () => router.push('/my-ads'),
    onError:    (e: any) => setError(e?.response?.data?.message ?? 'Failed to post ad'),
  });

  if (!isAuthenticated) return (
    <div style={{ textAlign:'center', padding:'80px' }}>
      <p style={{ color:'var(--muted)' }}>Please sign in to post an ad.</p>
    </div>
  );

  const fi: React.CSSProperties = { width:'100%', background:'#F8F9FF', border:'1px solid rgba(200,146,10,0.2)', color:'var(--offwhite)', borderRadius:'10px', padding:'11px 14px', fontSize:'13px', fontFamily:'Raleway,sans-serif', outline:'none', boxSizing:'border-box' };
  const il: React.CSSProperties = { fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1.5px', textTransform:'uppercase', display:'block', marginBottom:'6px' };

  return (
    <div style={{ maxWidth:'680px', margin:'0 auto', padding:'36px 4%' }}>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'26px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>Post an Ad</h1>
      <p style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'28px' }}>Only Job Seekers with an approved profile can post. Max 2 active ads at a time.</p>

      <div className="gc" style={{ padding:'28px', display:'flex', flexDirection:'column', gap:'18px' }}>
        {/* Title */}
        <div>
          <label style={il}>Ad Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. React Developer — Available for Contract Work" style={fi} />
        </div>

        {/* Description */}
        <div>
          <label style={il}>About Yourself</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Write a few sentences about your experience, what you're looking for, and what makes you a great hire…" style={{ ...fi, resize:'vertical' }} />
        </div>

        {/* Skills */}
        <div>
          <label style={il}>Skills</label>
          <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Type skill and press Enter" style={{ ...fi, flex:1 }} />
            <button onClick={addSkill} style={{ padding:'10px 16px', borderRadius:'10px', border:'1px solid var(--border)', background:'rgba(200,146,10,0.07)', color:'var(--gold3)', cursor:'pointer', fontSize:'12px', fontWeight:600, flexShrink:0 }}>Add</button>
          </div>
          {skills.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
              {skills.map(s => (
                <span key={s} style={{ padding:'4px 10px', borderRadius:'50px', fontSize:'11px', background:'rgba(200,146,10,0.08)', border:'1px solid var(--border)', color:'var(--gold3)', display:'flex', alignItems:'center', gap:'6px' }}>
                  {s}
                  <button onClick={() => setSkills(p => p.filter(x => x!==s))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--err)', fontSize:'12px', padding:'0', lineHeight:1 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Location + Salary */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div>
            <label style={il}>Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bengaluru / Remote" style={fi} />
          </div>
          <div>
            <label style={il}>Expected Salary / Rate</label>
            <input value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. ₹15 LPA or ₹500/hr" style={fi} />
          </div>
        </div>

        {/* Work Mode */}
        <div>
          <label style={il}>Work Mode</label>
          <select value={workMode} onChange={e => setWorkMode(e.target.value)} style={fi}>
            {WORK_MODES.map(m => <option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}
          </select>
        </div>

        {/* Contact */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div>
            <label style={il}>Contact Phone</label>
            <input value={contactPhone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" style={fi} />
          </div>
          <div>
            <label style={il}>Contact Email</label>
            <input value={contactEmail} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" style={fi} />
          </div>
        </div>
        <p style={{ fontSize:'10px', color:'var(--faint)', marginTop:'-10px' }}>Contact details are hidden until another user pays 30 points to unlock them.</p>

        {/* Duration */}
        <div>
          <label style={il}>Ad Visibility Duration (max 30 days)</label>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {DURATION_OPTS.map(d => (
              <button key={d} onClick={() => { setDuration(d); setIsCustom(false); }}
                style={{ padding:'9px 18px', borderRadius:'50px', border:'1px solid', fontSize:'12px', cursor:'pointer',
                  background:  !isCustom && duration===d ? 'rgba(200,146,10,0.08)' : 'transparent',
                  borderColor: !isCustom && duration===d ? 'var(--border)' : 'var(--bf)',
                  color:       !isCustom && duration===d ? 'var(--gold3)' : 'var(--muted)' }}>
                {d} days
              </button>
            ))}
            <button onClick={() => setIsCustom(true)}
              style={{ padding:'9px 18px', borderRadius:'50px', border:'1px solid', fontSize:'12px', cursor:'pointer',
                background:  isCustom ? 'rgba(200,146,10,0.08)' : 'transparent',
                borderColor: isCustom ? 'var(--border)' : 'var(--bf)',
                color:       isCustom ? 'var(--gold3)' : 'var(--muted)' }}>
              Custom
            </button>
          </div>
          {isCustom && (
            <div style={{ marginTop:'10px', display:'flex', alignItems:'center', gap:'8px' }}>
              <input type="number" value={custom} min={1} max={30} onChange={e => setCustom(e.target.value)}
                placeholder="1–30" style={{ ...fi, width:'120px' }} />
              <span style={{ fontSize:'12px', color:'var(--muted)' }}>days (max 30)</span>
            </div>
          )}
        </div>

        {error && <p style={{ fontSize:'12px', color:'var(--err)' }}>{error}</p>}

        <div style={{ display:'flex', gap:'10px', paddingTop:'8px' }}>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !title || !description}
            className="btn-gold" style={{ padding:'13px 28px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', opacity: mutation.isPending || !title || !description ? 0.5 : 1 }}>
            {mutation.isPending ? 'Posting…' : 'Post Ad →'}
          </button>
          <button onClick={() => router.back()}
            style={{ padding:'13px 20px', borderRadius:'50px', border:'1px solid var(--border)', background:'transparent', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
