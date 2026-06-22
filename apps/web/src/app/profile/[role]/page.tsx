'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profilesApi, docsApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const ROLE_INFO: Record<string,{ icon:string; desc:string; fields:[string,string][]; expLabel:string }> = {
  INTERN:         { icon:'🎓', desc:'Build your Intern profile with academic details, certificate and post-internship employment preference.',                  fields:[['College Name','College / University'],['Course & Year','e.g. B.Tech CS, 3rd Year'],['Internship Area','e.g. Full Stack, Data Science'],['Duration Preference','e.g. 3 months, 6 months']], expLabel:'Academic Projects & Internship Experience' },
  FRESHER:        { icon:'🌱', desc:'Create your Fresher profile highlighting academic excellence, projects and career objective.',                              fields:[['Qualification','e.g. B.Tech, MCA'],['Branch / Spec','e.g. Computer Science'],['Campus','College / University name'],['CGPA / %','e.g. 8.4 CGPA / 82%']], expLabel:'Academic Projects, Internships & Certifications' },
  JOB_SEEKER:     { icon:'🔍', desc:'Build a comprehensive Job Seeker profile with your full work history, skills and career goals.',                          fields:[['Current Designation','e.g. Senior Developer'],['Current Company','e.g. Infosys'],['Notice Period','e.g. 30 days'],['Expected CTC','e.g. ₹20 LPA']], expLabel:'Work Experience (Most Recent First)' },
  FREELANCER:     { icon:'💻', desc:'Showcase your portfolio, past clients, hourly rates and project specialisations.',                                       fields:[['Portfolio URL','https://yoursite.com'],['Hourly Rate','e.g. ₹2000/hr'],['Availability','e.g. 20 hrs/week'],['Project Duration','e.g. Short-term, Long-term']], expLabel:'Freelance Projects & Client Work' },
  CONSULTANT:     { icon:'🧑‍💼', desc:'Detail your consulting expertise, domain specialisation and past engagements.',                                       fields:[['Domain of Expertise','e.g. Healthcare IT, Fintech'],['Consulting Rate','e.g. ₹8000/day'],['Industries Served','e.g. BFSI, Healthcare'],['Engagement Type','e.g. Advisory, Implementation']], expLabel:'Consulting Engagements & Outcomes' },
  HIRING_MANAGER: { icon:'📊', desc:'Define your hiring needs, team structure and talent requirements.',                                                       fields:[['Organisation','Company name'],['Department','e.g. Engineering, Sales'],['Team Size','e.g. 12 members'],['Current Openings','e.g. 3 positions']], expLabel:'Teams Built & Hiring Achievements' },
  RECRUITER:      { icon:'🤝', desc:'Highlight your recruitment expertise, domains, ATS tools and placement success rates.',                                  fields:[['Agency / Company','Organisation name'],['Specialisation','e.g. IT, BFSI, Healthcare'],['Placements Made','e.g. 250+'],['ATS / Tools','e.g. Greenhouse, Lever']], expLabel:'Recruitment Experience & Placements' },
  TRAINER:        { icon:'📚', desc:'Showcase your training expertise, certifications and participants trained.',                                              fields:[['Training Domains','e.g. Soft Skills, Leadership'],['Certifications','e.g. CELTA, NLP, TTT'],['Participants Trained','e.g. 5000+'],['Delivery Mode','e.g. Classroom, Online, Blended']], expLabel:'Training Programs Conducted' },
  VENDOR:         { icon:'🏭', desc:'Present your business, services, client portfolio and partnership opportunities.',                                       fields:[['Business Name','Company / Firm name'],['Products / Services','What you offer'],['GST Number','GSTIN if applicable'],['Target Clients','e.g. SMEs, MNCs, Government']], expLabel:'Projects Delivered & Client References' },
  MODERATOR_ROLE: { icon:'🛡️', desc:'Apply to be a platform Moderator. Detail your domain knowledge and availability.',                                     fields:[['Domain Expertise','e.g. IT, Healthcare, Finance'],['Languages Known','e.g. English, Kannada, Tamil'],['Availability','e.g. 10 hrs/week'],['Prior Experience','e.g. HR, Compliance, QA']], expLabel:'Review & Verification Experience' },
  RFP_PROVIDER:   { icon:'📋', desc:"Publish your organisation's RFPs, tenders and job requirements.",                                                       fields:[['Organisation Name','Company / Institution'],['RFP Title','e.g. Cloud Migration Tender'],['Budget Range','e.g. ₹50L–₹1Cr'],['Submission Deadline','e.g. 30 June 2025']], expLabel:'Previous RFPs & Tenders Published' },
};

const DOC_DEFS = [
  { key:'RESUME',       label:'Resume / CV',        icon:'📄', accept:'.pdf,.doc,.docx' },
  { key:'CERTIFICATE',  label:'Certificates',        icon:'📜', accept:'.pdf,.jpg,.jpeg,.png' },
  { key:'PORTFOLIO',    label:'Portfolio / Samples', icon:'💼', accept:'.pdf,.zip,.pptx' },
  { key:'COVER_LETTER', label:'Cover Letter',        icon:'✉️', accept:'.pdf,.doc,.docx' },
];

const SEGMENTS = ['IT_DEVELOPERS','IT_DESIGNERS','IT_PRODUCT_OWNERS','IT_DATA_AI','NON_IT_ARTS_MEDIA','NON_IT_COMMERCE','NON_IT_EDUCATION','NON_IT_SPIRITUAL','NON_IT_MANAGEMENT','NON_IT_HEALTHCARE','NON_IT_ENGINEERING','SERVICES_CONSULTANCY','SERVICES_TRAINING','SERVICES_RECRUITMENT','SERVICES_VENDOR'];
const LOCATIONS = ['Karnataka','Tamil Nadu','Andhra Pradesh','Telangana','Kerala','Maharashtra','Delhi / NCR','India — Any State','Abroad — UAE','Abroad — USA','Open to Any'];

const STATUS_STYLE: Record<string, { bg:string; border:string; color:string }> = {
  PENDING:  { bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)',  color:'var(--warn)' },
  APPROVED: { bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.3)',  color:'var(--ok)'   },
  REJECTED: { bg:'rgba(255,107,107,0.1)', border:'rgba(255,107,107,0.3)', color:'var(--err)'  },
};

export default function RoleProfilePage() {
  const { role }    = useParams<{ role:string }>();
  const router      = useRouter();
  const { toast }   = useToast();
  const qc          = useQueryClient();
  const ri          = ROLE_INFO[role] ?? ROLE_INFO['JOB_SEEKER'];

  const [showExpForm, setShowExpForm] = useState(false);
  const [showInfo, setShowInfo]     = useState(false); // mobile sidebar toggle
  const [completion,  setCompletion]  = useState(35);

  const { register, handleSubmit, setValue, formState:{ errors } } = useForm<Record<string, any>>({ defaultValues:{ roleType:role } });
  const expForm = useForm<Record<string, any>>();

  // ── Load existing profile ────────────────────────────────────────────────
  const { data: profile } = useQuery({
    queryKey: ['myprofile', role],
    queryFn:  () => profilesApi.getMineByRole(role),
    retry:    false,
    onSuccess: (p: any) => {
      // Pre-fill the form with existing data
      if (!p) return;
      const fields = ['fullName','dateOfBirth','gender','phone','email','city','skills','summary',
        'highestDegree','specialization','institution','yearOfPassing','grade',
        'appliedFor','appliedAt','payment','certificate','workMode','employmentOption','marketSegment','preferredLocation'] as const;
      fields.forEach(f => { if ((p as any)[f] !== undefined) setValue(f as any, (p as any)[f]); });
      if (p.skills?.length) setValue('skills', p.skills.join(', '));
      setCompletion(70);
    },
  } as any);

  // ── Load existing documents ──────────────────────────────────────────────
  const { data: existingDocs = [] } = useQuery({
    queryKey: ['docs', (profile as any)?.id],
    queryFn:  () => docsApi.getForProfile((profile as any).id),
    enabled:  !!(profile as any)?.id,
  });

  // ── Load existing experiences (from profile query) ───────────────────────
  const experiences: any[] = (profile as any)?.experiences ?? [];

  // ── Mutations ────────────────────────────────────────────────────────────
  const saveMut = useMutation({
    mutationFn: (d: any) => profilesApi.upsert({ ...d, roleType:role }),
    onSuccess:  ()       => { toast('Profile saved!', 'ok'); setCompletion(c=>Math.min(c+10,80)); qc.invalidateQueries({ queryKey:['myprofile',role] }); },
    onError:    ()       => toast('Save failed — please try again', 'err'),
  });

  const submitMut = useMutation({
    mutationFn: (d: any) => profilesApi.upsert({ ...d, roleType:role }),
    onSuccess:  ()       => { toast('Submitted for Moderator review! 🎉', 'ok'); qc.invalidateQueries({ queryKey:['myprofile',role] }); qc.invalidateQueries({ queryKey:['my-profiles'] }); },
    onError:    ()       => toast('Submission failed', 'err'),
  });

  const addExpMut = useMutation({
    mutationFn: (d: any) => profilesApi.addExp(role, d),
    onSuccess:  ()       => { toast('Experience added!', 'ok'); setShowExpForm(false); expForm.reset(); qc.invalidateQueries({ queryKey:['myprofile',role] }); },
  });

  const delExpMut = useMutation({
    mutationFn: (id: string) => profilesApi.deleteExp(id),
    onSuccess:  ()           => { toast('Experience removed', 'ok'); qc.invalidateQueries({ queryKey:['myprofile',role] }); },
  });

  const handleDocUpload = async (file: File, docType: string) => {
    if (!(profile as any)?.id) { toast('Save your profile first before uploading documents', 'info'); return; }
    try {
      await docsApi.upload((profile as any).id, docType, file);
      toast(`${file.name} uploaded!`, 'ok');
      setCompletion(c => Math.min(c+8, 95));
      qc.invalidateQueries({ queryKey:['docs', (profile as any).id] });
    } catch { toast('Upload failed', 'err'); }
  };

  const handleDocDelete = async (docId: string) => {
    try {
      await docsApi.delete(docId);
      toast('Document removed', 'ok');
      qc.invalidateQueries({ queryKey:['docs', (profile as any).id] });
    } catch { toast('Delete failed', 'err'); }
  };

  const st = (profile as any)?.status ? STATUS_STYLE[(profile as any).status] : null;

  // Style helpers
  const mb: React.CSSProperties = { marginBottom:'16px' };
  const Err = ({ msg }: { msg?: string }) =>
    msg ? <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{msg}</p> : null;
  const IL = ({ children }: { children: React.ReactNode }) => <label className="il">{children}</label>;
  const FG = ({ children }: { children: React.ReactNode }) => <div className="form-grid">{children}</div>;
  const SEC = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
      {children}<span style={{ flex:1, height:'1px', background:'rgba(212,160,23,0.1)' }} />
    </div>
  );

  return (
    <div style={{ minHeight:'calc(100vh - 68px)' }}>
      {/* Banner */}
      <div style={{ padding:'56px 4% 40px', background:'linear-gradient(135deg,rgba(13,30,90,0.9),rgba(6,13,42,0.95))', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
          <button onClick={()=>router.push('/profile')} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'var(--muted)', background:'transparent', border:'none', cursor:'pointer', marginBottom:'22px' }}>
            ← Back to My Profile
          </button>
          <div style={{ fontSize:'52px', marginBottom:'14px' }}>{ri.icon}</div>
          <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2px', textTransform:'uppercase', color:'var(--gold2)', marginBottom:'6px' }}>Role Profile</div>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,4vw,40px)', fontWeight:700, color:'#fff', marginBottom:'10px' }}>
            I am a <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{role.replace(/_/g,' ')}</span>
          </h1>
          <p style={{ fontSize:'14px', color:'var(--muted)', fontWeight:300, maxWidth:'600px', lineHeight:1.8 }}>{ri.desc}</p>
        </div>
      </div>

      <div className="layout-with-sidebar" style={{ maxWidth:'1100px', margin:'0 auto', padding:'32px 4% 60px' }}>
        {/* Left — forms */}
        <div>
          {/* Personal info */}
          <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
            <SEC>👤 Personal Information</SEC>
            <FG>
              <div style={mb}><IL>Full Name *</IL><input {...register('fullName', { required:'Full name is required', maxLength:{ value:100, message:'Too long' } })} className="fi" placeholder="Your Full Name" style={{ borderColor: errors.fullName ? 'var(--err)' : undefined }} />
              <Err msg={errors.fullName?.message as string} /></div>
              <div style={mb}><IL>Date of Birth</IL><input {...register('dateOfBirth')} type="date" className="fi" /></div>
              <div style={mb}><IL>Gender</IL><select {...register('gender')} className="fi"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select></div>
              <div style={mb}><IL>Mobile *</IL><input {...register('phone', { maxLength:{ value:20, message:'Too long' } })} className="fi" placeholder="+91 98765 43210" style={{ borderColor: errors.phone ? 'var(--err)' : undefined }} />
              <Err msg={errors.phone?.message as string} /></div>
              <div style={mb}><IL>Email *</IL><input {...register('email')} type="email" className="fi" placeholder="you@example.com" /></div>
              <div style={mb}><IL>City / Location</IL><input {...register('city')} className="fi" placeholder="Bengaluru, Karnataka" /></div>
              {ri.fields.map(([name, ph], i) => (
                <div key={name} style={mb}><IL>{name}</IL><input {...register(`roleFields.rf${i}` as any)} className="fi" placeholder={ph} /></div>
              ))}
              <div style={{ ...mb, gridColumn:'span 2' }}><IL>Key Skills (comma separated)</IL><input {...register('skills')} className="fi" placeholder="Python, React, Communication…" /></div>
              <div style={{ ...mb, gridColumn:'span 2' }}><IL>Professional Summary *</IL><textarea {...register('summary')} className="fi" style={{ minHeight:'90px' }} placeholder={`Write 3–4 lines about yourself as a ${role.replace(/_/g,' ')}…`} /></div>
            </FG>
            <button onClick={handleSubmit(d=>saveMut.mutate(d))} disabled={saveMut.isPending} className="btn-gold" style={{ padding:'11px 24px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', opacity:saveMut.isPending?0.6:1 }}>
              {saveMut.isPending?'Saving…':'💾 Save Profile'}
            </button>
          </div>

          {/* Education */}
          <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
            <SEC>🎓 Education & Qualifications</SEC>
            <FG>
              <div style={mb}><IL>Highest Degree</IL>
                <select {...register('highestDegree')} className="fi">
                  <option value="">Select</option>
                  {['10th / SSLC','12th / PUC','Diploma','B.A. / B.Sc. / B.Com.','B.Tech / B.E.','MBBS','MBA / MCA / M.Tech','CA / CS','Ph.D.','Other'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={mb}><IL>Specialization</IL><input {...register('specialization')} className="fi" placeholder="e.g. Computer Science" /></div>
              <div style={mb}><IL>Institution / University</IL><input {...register('institution')} className="fi" placeholder="e.g. IIT Bombay" /></div>
              <div style={mb}><IL>Year of Passing</IL><input {...register('yearOfPassing')} type="number" className="fi" placeholder="e.g. 2022" /></div>
              <div style={mb}><IL>Grade / CGPA / %</IL><input {...register('grade')} className="fi" placeholder="e.g. 8.4 CGPA" /></div>
            </FG>
          </div>

          {/* Experience — form + saved list */}
          <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <SEC>{ri.expLabel}</SEC>
              <button onClick={()=>setShowExpForm(v=>!v)} className="btn-outline" style={{ padding:'8px 18px', borderRadius:'50px', fontSize:'11px', cursor:'pointer', flexShrink:0 }}>
                {showExpForm ? '✕ Cancel' : '+ Add'}
              </button>
            </div>

            {/* Saved experience entries */}
            {experiences.length > 0 && (
              <div style={{ marginBottom:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
                {experiences.map((e: any) => (
                  <div key={e.id} style={{ borderRadius:'12px', padding:'14px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--bf)', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'#fff', marginBottom:'2px' }}>{e.title}</div>
                      <div style={{ fontSize:'11px', color:'var(--gold3)', marginBottom:'4px' }}>{e.company}</div>
                      {(e.fromDate || e.toDate) && (
                        <div style={{ fontSize:'10px', color:'var(--muted)' }}>
                          {e.fromDate ? new Date(e.fromDate).toLocaleDateString('en-IN',{ month:'short', year:'numeric' }) : ''}
                          {e.fromDate && e.toDate ? ' – ' : ''}
                          {e.toDate   ? new Date(e.toDate).toLocaleDateString('en-IN',{ month:'short', year:'numeric' })   : e.fromDate ? ' — Present' : ''}
                        </div>
                      )}
                      {e.description && <p style={{ fontSize:'11px', color:'var(--muted)', marginTop:'6px', lineHeight:1.6, fontWeight:300 }}>{e.description}</p>}
                    </div>
                    <button
                      onClick={()=>{ if(confirm('Remove this entry?')) delExpMut.mutate(e.id); }}
                      disabled={delExpMut.isPending}
                      style={{ background:'transparent', border:'none', color:'var(--err)', cursor:'pointer', fontSize:'14px', flexShrink:0, padding:'2px 4px', opacity:delExpMut.isPending?0.5:1 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {!showExpForm && experiences.length === 0 && (
              <p style={{ fontSize:'13px', color:'var(--muted)', fontWeight:300, padding:'14px 0' }}>No entries yet. Click + Add to get started.</p>
            )}

            {showExpForm && (
              <div style={{ borderRadius:'14px', padding:'18px', background:'rgba(255,255,255,0.02)', border:'1px solid var(--bf)' }}>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'14px' }}>New Entry</div>
                <FG>
                  <div style={mb}><IL>Title / Role *</IL><input {...expForm.register('title',{required:true})} className="fi" placeholder="e.g. Full Stack Developer" /></div>
                  <div style={mb}><IL>Company / Organisation *</IL><input {...expForm.register('company',{required:true})} className="fi" placeholder="e.g. Infosys" /></div>
                  <div style={mb}><IL>From Date</IL><input {...expForm.register('fromDate')} type="date" className="fi" /></div>
                  <div style={mb}><IL>To Date</IL><input {...expForm.register('toDate')} type="date" className="fi" /></div>
                  <div style={{ ...mb, gridColumn:'span 2' }}><IL>Description / Key Contributions</IL><textarea {...expForm.register('description')} className="fi" placeholder="What did you build, achieve or learn…" /></div>
                </FG>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={expForm.handleSubmit(d=>addExpMut.mutate(d))} disabled={addExpMut.isPending} className="btn-gold" style={{ padding:'8px 18px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'11px', opacity:addExpMut.isPending?0.6:1 }}>
                    {addExpMut.isPending?'Saving…':'Save Entry'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
            <SEC>📎 Documents & Portfolio</SEC>
            <div className="doc-grid">
              {DOC_DEFS.map(d => {
                const uploaded = (existingDocs as any[]).find(doc => doc.documentType === d.key);
                return (
                  <label key={d.key} style={{ borderRadius:'14px', padding:'18px', textAlign:'center', cursor:'pointer', border:`2px dashed ${uploaded ? 'rgba(74,222,128,0.4)' : 'rgba(212,160,23,0.3)'}`, display:'block', transition:'all 0.2s' }}>
                    <div style={{ fontSize:'28px', marginBottom:'8px' }}>{uploaded ? '✅' : d.icon}</div>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:'11px', fontWeight:700, color:'#fff', marginBottom:'3px' }}>{d.label}</div>
                    <div style={{ fontSize:'10px', color: uploaded ? 'var(--ok)' : 'var(--muted)', fontWeight: uploaded ? 600 : 300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {uploaded ? uploaded.filename : `${d.accept} · Max 10MB`}
                    </div>
                    {uploaded && (
                      <button
                        onClick={e=>{ e.preventDefault(); if(confirm('Remove this document?')) handleDocDelete(uploaded.id); }}
                        style={{ display:'block', margin:'6px auto 0', fontSize:'10px', color:'var(--err)', background:'transparent', border:'none', cursor:'pointer' }}
                      >Remove</button>
                    )}
                    <input type="file" accept={d.accept} style={{ display:'none' }}
                      onChange={e=>{const f=e.target.files?.[0]; if(f) handleDocUpload(f,d.key); e.target.value='';}} />
                  </label>
                );
              })}
            </div>
            <div style={{ marginTop:'14px', borderRadius:'10px', padding:'10px', fontSize:'11px', color:'var(--muted)', lineHeight:1.7, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)' }}>
              ⚠️ Documents are visible only to you and the Admin. They will be reviewed before your profile goes live.
            </div>
          </div>

          {/* Submission details */}
          <div className="gc" style={{ padding:'28px' }}>
            <SEC>⬛ Submission Details</SEC>
            <FG>
              <div style={mb}><IL>Applied For *</IL><input {...register('appliedFor', { required:'Applied for is required', maxLength:{ value:200, message:'Too long' } })} className="fi" placeholder="Specific role / position title" style={{ borderColor: errors.appliedFor ? 'var(--err)' : undefined }} />
              <Err msg={errors.appliedFor?.message as string} /></div>
              <div style={mb}><IL>Applied At *</IL><input {...register('appliedAt', { required:'Organisation name is required', maxLength:{ value:200, message:'Too long' } })} className="fi" placeholder="Organisation / Company name" style={{ borderColor: errors.appliedAt ? 'var(--err)' : undefined }} />
              <Err msg={errors.appliedAt?.message as string} /></div>
              <div style={mb}><IL>💰 Payment Type</IL>
                <select {...register('payment')} className="fi"><option value="PAID">Paid</option><option value="UNPAID">Unpaid</option><option value="STIPEND">Stipend</option><option value="NEGOTIABLE">Negotiable</option></select>
              </div>
              <div style={mb}><IL>📜 Certificate Required</IL>
                <select {...register('certificate')} className="fi"><option value="YES">Yes</option><option value="NO">No</option></select>
              </div>
              <div style={mb}><IL>🏠 Mode of Work</IL>
                <select {...register('workMode')} className="fi"><option value="WFH">WFH</option><option value="ON_SITE">On-Site</option><option value="OFF_SITE">Off-Site</option><option value="HYBRID">Hybrid</option></select>
              </div>
              <div style={mb}><IL>➡️ Post-Engagement Employment</IL>
                <select {...register('employmentOption')} className="fi"><option value="EXISTS">Exists — Interested</option><option value="NOT_EXISTS">Not Exists / Not Required</option></select>
              </div>
              <div style={mb}><IL>Market Segment *</IL>
                <select {...register('marketSegment')} className="fi">
                  {SEGMENTS.map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div style={mb}><IL>Preferred Location</IL>
                <select {...register('preferredLocation')} className="fi">
                  {LOCATIONS.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
            </FG>
            <button onClick={handleSubmit(d=>submitMut.mutate(d))} disabled={submitMut.isPending} className="btn-gold" style={{ width:'100%', padding:'14px', fontSize:'14px', borderRadius:'12px', border:'none', cursor:'pointer', opacity:submitMut.isPending?0.6:1, marginTop:'8px' }}>
              {submitMut.isPending ? 'Submitting…' : '✦ Submit for Moderator Review ✦'}
            </button>
          </div>
        </div>

        {/* Right sidebar — always visible on desktop, toggled on mobile */}
        <div className={`layout-sidebar-col${showInfo ? ' layout-sidebar-col-open' : ''}`}>
          {/* Profile preview card */}
          <div className="gc" style={{ marginBottom:'18px', overflow:'hidden' }}>
            <div style={{ height:'90px', background:'linear-gradient(135deg,rgba(29,62,160,0.6),rgba(45,107,228,0.4),rgba(140,34,64,0.3))' }} />
            <div style={{ padding:'0 20px' }}>
              <div style={{ marginTop:'-32px', width:'62px', height:'62px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', background:'rgba(212,160,23,0.15)', border:'3px solid var(--deep)', boxShadow:'0 6px 20px rgba(0,0,0,0.5)' }}>{ri.icon}</div>
            </div>
            <div style={{ padding:'14px 20px 20px' }}>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'#fff', marginBottom:'2px' }}>{(profile as any)?.fullName ?? 'Your Name'}</div>
              <div style={{ fontSize:'11px', color:'var(--gold3)', marginBottom:'12px' }}>{role.replace(/_/g,' ')}</div>
              <div style={{ marginBottom:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                  <span style={{ fontSize:'11px', color:'var(--muted)' }}>Profile Complete</span>
                  <span style={{ fontSize:'11px', fontWeight:700, color:'var(--gold3)' }}>{completion}%</span>
                </div>
                <div style={{ height:'5px', borderRadius:'50px', background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:'50px', background:'linear-gradient(90deg,var(--gold),var(--gold2))', width:`${completion}%`, transition:'width 1s ease' }} />
                </div>
              </div>
              {/* Status badge — only shown when a profile exists */}
              {st ? (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'5px 14px', borderRadius:'50px', fontSize:'10px', fontWeight:700, color:st.color, background:st.bg, border:`1px solid ${st.border}` }}>
                  {(profile as any).status === 'APPROVED' ? '✅ Live on portal' : (profile as any).status === 'REJECTED' ? '❌ Rejected — please update' : '⏳ Pending Moderator Review'}
                </span>
              ) : (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'5px 14px', borderRadius:'50px', fontSize:'10px', fontWeight:700, color:'var(--muted)', background:'rgba(255,255,255,0.05)', border:'1px solid var(--bf)' }}>
                  Not submitted yet
                </span>
              )}
              {/* Rejection reason */}
              {(profile as any)?.rejectionReason && (
                <div style={{ marginTop:'10px', padding:'10px 12px', borderRadius:'10px', background:'rgba(255,107,107,0.06)', border:'1px solid rgba(255,107,107,0.2)', fontSize:'11px', color:'var(--err)', lineHeight:1.6 }}>
                  <strong>Reason:</strong> {(profile as any).rejectionReason}
                </div>
              )}
            </div>
          </div>

          {/* Role guide */}
          <div className="gc" style={{ padding:'20px', marginBottom:'18px' }}>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'#fff', marginBottom:'12px' }}>📖 Role Guide</div>
            <p style={{ fontSize:'12px', color:'var(--muted)', lineHeight:1.8, fontWeight:300 }}>{ri.desc}</p>
            <div style={{ marginTop:'12px', paddingTop:'12px', borderTop:'1px solid var(--bf)' }}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Role-Specific Fields</div>
              {ri.fields.map(([name])=>(
                <div key={name} style={{ fontSize:'12px', color:'var(--offwhite)', padding:'4px 0', borderBottom:'1px solid var(--bf)' }}>✦ {name}</div>
              ))}
            </div>
          </div>

          {/* What happens next */}
          <div className="gc" style={{ padding:'20px' }}>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'#fff', marginBottom:'12px' }}>🔍 What Happens Next?</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {['Moderator validates all profile details','Market Mapping assigned — IT / Non-IT / Services','Profile activated and published on portal','Visible to recruiters and organisations'].map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
                  <div style={{ fontFamily:'Cinzel,serif', width:'22px', height:'22px', borderRadius:'50%', fontSize:'10px', fontWeight:800, color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:'linear-gradient(135deg,var(--gold),var(--gold2))', minWidth:'22px', marginTop:'1px' }}>{i+1}</div>
                  <div style={{ fontSize:'12px', color:'var(--muted)', fontWeight:300, lineHeight:1.5 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
