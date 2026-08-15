'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const MODES = [['WFH','WFH'],['ON_SITE','On-Site'],['HYBRID','Hybrid'],['OFF_SITE','Off-Site']];

export default function CreateEditAdPage() {
  const router   = useRouter();
  const params   = useParams<{ id?: string }>();
  const isEdit   = !!params?.id;
  const { isAuthenticated } = useAuthStore();

  const [form, setForm] = useState({
    title:'', description:'', skills:[] as string[], skillInput:'',
    location:'', salaryExpect:'', workMode:'WFH',
    contactPhone:'', contactEmail:'', durationDays:30,
  });
  const [error, setError] = useState('');

  // Load existing ad for edit
  const { data: existing } = useQuery({
    queryKey: ['ad-edit', params?.id],
    queryFn:  () => adsApi.findById(params!.id!),
    enabled:  isEdit && isAuthenticated,
  });

  useEffect(() => {
    if (existing) {
      const a = existing as any;
      setForm(prev => ({
        ...prev,
        title:        a.title       ?? '',
        description:  a.description ?? '',
        skills:       Array.isArray(a.skills) ? a.skills : [],
        location:     a.location    ?? '',
        salaryExpect: a.salaryExpect ?? '',
        workMode:     a.workMode    ?? 'WFH',
        contactPhone: a.contactPhone ?? '',
        contactEmail: a.contactEmail ?? '',
        durationDays: a.durationDays ?? 30,
      }));
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? adsApi.update(params!.id!, { ...form, skillInput: undefined } as any)
      : adsApi.create({ ...form, skillInput: undefined } as any),
    onSuccess: (data: any) => router.push(`/ads/${data.id ?? params!.id}`),
    onError:   (e: any) => setError(e?.response?.data?.message ?? 'Failed — please try again'),
  });

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (s && !form.skills.includes(s)) setForm(p => ({ ...p, skills: [...p.skills, s], skillInput: '' }));
  };

  const inp = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'5px' }}>{label}</label>
      <input type={type} value={form[key] as string} onChange={e => setForm(p => ({...p, [key]: e.target.value}))}
        placeholder={placeholder} className="fi" />
    </div>
  );

  if (!isAuthenticated) return <div style={{ padding:'60px', textAlign:'center' }}><p>Please sign in.</p></div>;

  return (
    <div style={{ maxWidth:'680px', margin:'0 auto', padding:'36px 4%' }}>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>
        {isEdit ? 'Edit Your Ad' : 'Post Your Ad'}
      </h1>
      <p style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'28px' }}>
        {isEdit ? 'Update your ad details below.' : 'Tell recruiters and organisations about yourself. Your ad goes live immediately.'}
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {inp('Ad Title *', 'title', 'text', 'e.g. "Experienced React Developer Available for Projects"')}

        <div>
          <label style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'5px' }}>About You *</label>
          <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
            placeholder="Write a few sentences about your experience, what you're looking for, your availability, and any key achievements…"
            className="fi" rows={5} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          {inp('Location', 'location', 'text', 'e.g. Bengaluru / Remote')}
          {inp('Salary / Rate Expectation', 'salaryExpect', 'text', 'e.g. ₹15–20 LPA or ₹2000/day')}
        </div>

        <div>
          <label style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'5px' }}>Work Mode</label>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {MODES.map(([v,l]) => (
              <button key={v} type="button" onClick={() => setForm(p => ({...p, workMode: v}))} style={{
                padding:'8px 16px', borderRadius:'50px', border:'1px solid', cursor:'pointer', fontSize:'12px', fontWeight:600,
                background:  form.workMode===v ? 'rgba(200,146,10,0.1)' : 'transparent',
                borderColor: form.workMode===v ? 'var(--border)' : 'var(--bf)',
                color:       form.workMode===v ? 'var(--gold3)' : 'var(--muted)',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'5px' }}>Skills</label>
          <div style={{ display:'flex', gap:'8px' }}>
            <input value={form.skillInput} onChange={e => setForm(p => ({...p, skillInput: e.target.value}))}
              onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Type a skill and press Enter" className="fi" style={{ flex:1 }} />
            <button type="button" onClick={addSkill} style={{ padding:'10px 16px', borderRadius:'50px', border:'1px solid var(--border)', background:'transparent', cursor:'pointer', fontSize:'12px', color:'var(--gold3)', fontWeight:600, whiteSpace:'nowrap' }}>+ Add</button>
          </div>
          {form.skills.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'10px' }}>
              {form.skills.map(s => (
                <span key={s} style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 10px', borderRadius:'50px', fontSize:'11px', background:'rgba(200,146,10,0.08)', border:'1px solid var(--border)', color:'var(--gold3)' }}>
                  {s}
                  <button type="button" onClick={() => setForm(p => ({...p, skills: p.skills.filter(x => x!==s)}))}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:'14px', lineHeight:1, padding:0 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contact details */}
        <div style={{ background:'rgba(200,146,10,0.04)', border:'1px solid rgba(200,146,10,0.15)', borderRadius:'12px', padding:'16px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'var(--gold3)', marginBottom:'12px' }}>Contact Details (hidden until viewer pays 30 pts)</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {inp('Contact Phone', 'contactPhone', 'tel', 'Separate number for this ad')}
            {inp('Contact Email', 'contactEmail', 'email', 'Separate email if preferred')}
          </div>
          <p style={{ fontSize:'10px', color:'var(--muted)', marginTop:'8px' }}>Leave blank to use your registered details.</p>
        </div>

        {/* Duration — only for new ads */}
        {!isEdit && (
          <div>
            <label style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>Ad Duration (max 30 days)</label>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {[7,15,30].map(d => (
                <button key={d} type="button" onClick={() => setForm(p => ({...p, durationDays: d}))} style={{
                  padding:'8px 16px', borderRadius:'50px', border:'1px solid', cursor:'pointer', fontSize:'12px', fontWeight:600,
                  background:  form.durationDays===d ? 'rgba(200,146,10,0.1)' : 'transparent',
                  borderColor: form.durationDays===d ? 'var(--border)' : 'var(--bf)',
                  color:       form.durationDays===d ? 'var(--gold3)' : 'var(--muted)',
                }}>{d} days</button>
              ))}
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <span style={{ fontSize:'12px', color:'var(--muted)' }}>Custom:</span>
                <input type="number" min={1} max={30} value={[7,15,30].includes(form.durationDays) ? '' : form.durationDays}
                  onChange={e => setForm(p => ({...p, durationDays: Math.min(30, Math.max(1, parseInt(e.target.value)||1))}))}
                  placeholder="1-30" className="fi" style={{ width:'70px', padding:'8px 10px' }} />
                <span style={{ fontSize:'11px', color:'var(--muted)' }}>days</span>
              </div>
            </div>
          </div>
        )}

        {error && <p style={{ fontSize:'12px', color:'var(--err)' }}>{error}</p>}

        <div style={{ display:'flex', gap:'10px' }}>
          <button type="button" onClick={() => mutation.mutate()} disabled={!form.title || !form.description || mutation.isPending}
            className="btn-gold" style={{ flex:1, padding:'14px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', opacity: !form.title || !form.description || mutation.isPending ? 0.5 : 1 }}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes →' : 'Post Ad →'}
          </button>
          <button type="button" onClick={() => router.back()} style={{ padding:'14px 20px', borderRadius:'50px', border:'1px solid var(--bf)', background:'transparent', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
