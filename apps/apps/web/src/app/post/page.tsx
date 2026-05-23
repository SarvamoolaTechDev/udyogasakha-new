'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';

function refId() { return 'UDYG-' + Math.floor(Math.random()*90000+10000); }

export default function PostJobPage() {
  const [done, setDone] = useState(false);
  const [ref,  setRef]  = useState('');
  const { register, handleSubmit } = useForm();

  const mut = useMutation({
    mutationFn: (d: any) => listingsApi.post({
      ...d,
      marketField: ['IT_SOFTWARE'].includes(d.industry) ? 'IT_FIELD' : d.industry === 'SERVICES' ? 'SERVICES' : 'NON_IT_FIELD',
    }),
    onSuccess: () => { setRef(refId()); setDone(true); },
  });

  const L = ({ children }: { children: React.ReactNode }) => <label className="il">{children}</label>;
  const F = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 18px' }}>{children}</div>;
  const S = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
      {children}
      <span style={{ flex:1, height:'1px', background:'rgba(212,160,23,0.1)' }} />
    </div>
  );

  if (done) return (
    <section style={{ padding:'64px 4%' }}>
      <div style={{ maxWidth:'820px', margin:'0 auto' }}>
        <div className="gc" style={{ padding:'10px' }}>
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:'60px', marginBottom:'14px' }}>✅</div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'10px' }}>Posting Submitted!</div>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.8, marginBottom:'22px', maxWidth:'440px', margin:'0 auto 22px' }}>
              Your job / RFP has been submitted for Moderator review. It will be published on the portal within 2–4 hours after approval.
            </p>
            <div style={{ display:'inline-block', borderRadius:'12px', padding:'14px 22px', marginBottom:'24px', background:'rgba(212,160,23,0.08)', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'9px', color:'var(--muted)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'3px' }}>Reference ID</div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{ref}</div>
            </div>
            <br />
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>window.location.href='/jobs'} className="btn-gold" style={{ padding:'12px 26px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>View All Jobs →</button>
              <button onClick={()=>setDone(false)} className="btn-outline" style={{ padding:'12px 26px', borderRadius:'50px', cursor:'pointer', fontSize:'12px' }}>Post Another</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <section style={{ padding:'64px 4%' }}>
      <div style={{ maxWidth:'820px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'2.5px', textTransform:'uppercase', color:'var(--gold2)' }}>For Recruiters & Organisations</span>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(22px,3.5vw,40px)', fontWeight:700, color:'#fff', marginTop:'10px', lineHeight:1.2 }}>
            Post a Job / <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>RFP</span>
          </h1>
          <div className="orn"><div className="ol"/><div className="od"/><div className="ol-r"/></div>
          <p style={{ fontSize:'13px', color:'var(--muted)', fontWeight:300, maxWidth:'500px', margin:'10px auto 0', lineHeight:1.8 }}>All postings reviewed by Moderator before going live. Free to post.</p>
        </div>

        <form onSubmit={handleSubmit(d=>mut.mutate(d))}>
          {/* Organisation */}
          <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
            <S>🏢 Organisation Details</S>
            <F>
              <div style={{ marginBottom:'16px' }}><L>Organisation Name *</L><input {...register('organisationName',{required:true})} className="fi" placeholder="TCS, Apollo Hospital…" /></div>
              <div style={{ marginBottom:'16px' }}><L>Contact Person</L><input {...register('contactPerson')} className="fi" placeholder="HR Manager / Admin" /></div>
              <div style={{ marginBottom:'16px' }}><L>Email *</L><input {...register('contactEmail',{required:true})} type="email" className="fi" placeholder="hr@company.com" /></div>
              <div style={{ marginBottom:'16px' }}><L>Phone</L><input {...register('contactPhone')} className="fi" placeholder="+91 98765 43210" /></div>
            </F>
          </div>

          {/* Job details */}
          <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
            <S>📌 Job / RFP Details</S>
            <F>
              <div style={{ marginBottom:'16px' }}><L>Posting Type</L>
                <select {...register('listingType')} className="fi">
                  <option value="JOB_OPENING">Job Opening</option><option value="INTERNSHIP">Internship</option>
                  <option value="RFP_TENDER">RFP / Tender</option><option value="TRAINING_PROGRAM">Training Program</option>
                  <option value="CONSULTANCY_NEED">Consultancy Need</option><option value="VENDOR_REQUIREMENT">Vendor Requirement</option>
                </select>
              </div>
              <div style={{ marginBottom:'16px' }}><L>For Role Type</L>
                <select {...register('targetRoleType')} className="fi">
                  {[['JOB_SEEKER','Job Seeker'],['INTERN','Intern'],['FRESHER','Fresher'],['FREELANCER','Freelancer'],['CONSULTANT','Consultant'],['TRAINER','Trainer'],['RECRUITER','Recruiter'],['VENDOR','Vendor']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:'16px', gridColumn:'span 2' }}><L>Job / RFP Title *</L><input {...register('title',{required:true})} className="fi" placeholder="e.g. Senior React Developer, Data Science Internship" /></div>
              <div style={{ marginBottom:'16px' }}><L>Industry</L>
                <select {...register('industry')} className="fi">
                  {[['IT_SOFTWARE','IT / Software'],['HEALTHCARE','Healthcare'],['FINANCE_BANKING','Finance / Banking'],['GOVERNMENT_PSU','Government / PSU'],['EDUCATION','Education'],['ENGINEERING','Engineering'],['MARKETING','Marketing'],['SERVICES','Services'],['OTHER','Other']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:'16px' }}><L>Location</L><input {...register('location')} className="fi" placeholder="Bengaluru, Karnataka" /></div>
              <div style={{ marginBottom:'16px' }}><L>Payment Type</L>
                <select {...register('payment')} className="fi"><option value="PAID">Paid</option><option value="UNPAID">Unpaid</option><option value="STIPEND">Stipend</option><option value="NEGOTIABLE">Negotiable</option></select>
              </div>
              <div style={{ marginBottom:'16px' }}><L>Salary / Budget</L><input {...register('salary')} className="fi" placeholder="₹18–28 LPA · ₹15,000 Stipend/Month" /></div>
              <div style={{ marginBottom:'16px' }}><L>Mode of Work</L>
                <select {...register('workMode')} className="fi"><option value="WFH">WFH</option><option value="ON_SITE">On-Site</option><option value="HYBRID">Hybrid</option><option value="OFF_SITE">Off-Site</option></select>
              </div>
              <div style={{ marginBottom:'16px' }}><L>Certificate Provided</L>
                <select {...register('certificateProvided')} className="fi"><option value="YES">Yes</option><option value="NO">No</option></select>
              </div>
              <div style={{ marginBottom:'16px' }}><L>Post-Engagement Employment</L>
                <select {...register('employmentOption')} className="fi"><option value="EXISTS">Exists</option><option value="NOT_EXISTS">Not Exists</option></select>
              </div>
              <div style={{ marginBottom:'16px' }}><L>Experience Required</L>
                <select {...register('experienceRequired')} className="fi"><option value="ANY">Any</option><option value="FRESHER_0_1">Fresher / 0–1 yr</option><option value="EXP_1_3">1–3 yrs</option><option value="EXP_3_5">3–5 yrs</option><option value="EXP_5_8">5–8 yrs</option><option value="EXP_8_PLUS">8+ yrs</option></select>
              </div>
              <div style={{ marginBottom:'16px' }}><L>Duration</L>
                <select {...register('duration')} className="fi"><option value="PERMANENT">Permanent</option><option value="SHORT_TERM">Short Term</option><option value="MEDIUM_TERM">Medium Term</option><option value="LONG_TERM">Long Term</option><option value="PROJECT_BASED">Project Based</option></select>
              </div>
              <div style={{ marginBottom:'16px', gridColumn:'span 2' }}><L>Key Skills (comma separated)</L><input {...register('skills')} className="fi" placeholder="React, Node.js, Python, Communication…" /></div>
              <div style={{ marginBottom:'16px', gridColumn:'span 2' }}><L>Facilities / Benefits</L><input {...register('facilities')} className="fi" placeholder="Health Insurance, PF, Accommodation, Laptop…" /></div>
              <div style={{ marginBottom:'16px', gridColumn:'span 2' }}><L>Job Description *</L><textarea {...register('description',{required:true})} className="fi" style={{ minHeight:'120px' }} placeholder="Describe the role, responsibilities, team and growth…" /></div>
              <div style={{ marginBottom:'16px', gridColumn:'span 2' }}><L>Experience Details</L><textarea {...register('experienceDetail')} className="fi" style={{ minHeight:'90px' }} placeholder="Describe what experience is required in detail…" /></div>
            </F>

            {mut.isError && <p style={{ color:'var(--err)', fontSize:'12px', marginBottom:'12px' }}>Submission failed — please try again.</p>}

            <button type="submit" disabled={mut.isPending} className="btn-gold" style={{ width:'100%', padding:'15px', fontSize:'14px', borderRadius:'12px', border:'none', cursor:'pointer', opacity:mut.isPending?0.6:1, marginTop:'8px' }}>
              {mut.isPending ? 'Submitting…' : '✦ Submit for Moderator Review ✦'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
