'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import { useToast } from '@/components/ui/Toast';

function refId() { return 'UDYG-' + Math.floor(Math.random() * 90000 + 10000); }

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{msg}</p> : null;

export default function PostJobPage() {
  const { isAuthenticated, userName } = useAuthStore();
  const [done, setDone] = useState(false);
  const [ref,  setRef]  = useState('');
  const [listingId, setListingId] = useState<string | null>(null);
  const [featured,  setFeatured]  = useState(false);
  const [featuring, setFeaturing] = useState(false);
  const { toast } = useToast();
  const { startPayment } = useRazorpayCheckout();

  const { register, handleSubmit, formState: { errors } } = useForm<Record<string, any>>();

  const mut = useMutation({
    mutationFn: (d: any) => listingsApi.post({
      ...d,
      marketField: d.industry === 'IT_SOFTWARE' ? 'IT_FIELD' : d.industry === 'SERVICES' ? 'SERVICES' : 'NON_IT_FIELD',
    }),
    onSuccess: (created: any) => {
      setRef(refId());
      setListingId(created?.id ?? null);
      setDone(true);
    },
  });

  const handleFeatureListing = () => {
    if (!listingId) return;
    setFeaturing(true);
    startPayment({
      purpose:      'LISTING_FEATURE',
      referenceId:  listingId,
      // ⚠️ Placeholder test price — pricing for paid promotion is a product
      // decision pending client sign-off, not finalized.
      amount:       499,
      currency:     'INR',
      description:  'Feature this listing for 30 days',
      prefillName:  userName,
      onSuccess: () => {
        setFeatured(true);
        setFeaturing(false);
        toast('Listing featured! It will get priority placement for 30 days.', 'ok');
      },
      onFailure: () => {
        setFeaturing(false);
        toast('Payment failed — please try again.', 'err');
      },
      onDismiss: () => setFeaturing(false),
    });
  };

  const L = ({ children }: { children: React.ReactNode }) => <label className="il">{children}</label>;
  const F = ({ children }: { children: React.ReactNode }) => <div className="form-grid">{children}</div>;
  const S = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
      {children}<span style={{ flex:1, height:'1px', background:'rgba(212,160,23,0.1)' }} />
    </div>
  );
  const mb: React.CSSProperties = { marginBottom:'16px' };


  // Show a friendly prompt if not signed in
  // (middleware will redirect, but this covers client-side navigation)
  if (!isAuthenticated) return (
    <section style={{ padding:'64px 4%' }}>
      <div style={{ maxWidth:'480px', margin:'0 auto' }}>
        <div className="gc" style={{ padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔐</div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'10px' }}>Sign In to Post</div>
          <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.8, marginBottom:'24px' }}>
            You need a free account to post a job or RFP. All listings are reviewed by a Moderator before going live.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/login?from=/post" className="btn-gold" style={{ padding:'12px 24px', borderRadius:'50px', fontSize:'12px', textDecoration:'none' }}>
              Sign In →
            </Link>
            <Link href="/register" className="btn-outline" style={{ padding:'12px 24px', borderRadius:'50px', fontSize:'12px', textDecoration:'none' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  if (done) return (
    <section style={{ padding:'64px 4%' }}>
      <div style={{ maxWidth:'820px', margin:'0 auto' }}>
        <div className="gc" style={{ padding:'10px' }}>
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <div style={{ fontSize:'60px', marginBottom:'14px' }}>✅</div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:'10px' }}>Posting Submitted!</div>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.8, maxWidth:'440px', margin:'0 auto 22px' }}>
              Your job / RFP has been submitted for Moderator review and will be published within 2–4 hours after approval.
            </p>
            <div style={{ display:'inline-block', borderRadius:'12px', padding:'14px 22px', marginBottom:'24px', background:'rgba(212,160,23,0.08)', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'9px', color:'var(--muted)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'3px' }}>Reference ID</div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{ref}</div>
            </div>

            {/* Optional paid promotion — supports UPI, cards, netbanking, wallets, EMI, pay later, international cards (all surfaced by Razorpay Checkout automatically) */}
            {listingId && !featured && (
              <div style={{ maxWidth:'420px', margin:'0 auto 24px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px dashed var(--border)' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>🌟 Feature This Listing</div>
                <p style={{ fontSize:'12px', color:'var(--muted)', lineHeight:1.7, marginBottom:'14px' }}>
                  Get priority placement at the top of search results for 30 days. Pay via UPI, card, netbanking, wallet or any method available at checkout.
                </p>
                <button onClick={handleFeatureListing} disabled={featuring} className="btn-gold" style={{ padding:'10px 24px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', opacity:featuring?0.6:1 }}>
                  {featuring ? 'Opening checkout…' : 'Feature for ₹499 →'}
                </button>
              </div>
            )}
            {featured && (
              <div style={{ maxWidth:'420px', margin:'0 auto 24px', padding:'14px', borderRadius:'14px', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.3)' }}>
                <div style={{ fontSize:'13px', fontWeight:700, color:'var(--ok)' }}>✅ Listing Featured</div>
                <p style={{ fontSize:'11px', color:'var(--muted)', marginTop:'4px' }}>Your listing will get priority placement for the next 30 days.</p>
              </div>
            )}

            <br />
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => window.location.href='/jobs'} className="btn-gold" style={{ padding:'12px 26px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>View All Jobs →</button>
              <button onClick={() => setDone(false)} className="btn-outline" style={{ padding:'12px 26px', borderRadius:'50px', cursor:'pointer', fontSize:'12px' }}>Post Another</button>
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
          <p style={{ fontSize:'13px', color:'var(--muted)', fontWeight:300, maxWidth:'500px', margin:'10px auto 0', lineHeight:1.8 }}>
            All postings reviewed by Moderator before going live. Free to post.
          </p>
        </div>

        <form onSubmit={handleSubmit(d => mut.mutate(d))}>
          {/* Organisation details */}
          <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
            <S>🏢 Organisation Details</S>
            <F>
              <div style={mb}>
                <L>Organisation Name *</L>
                <input {...register('organisationName', { required:'Organisation name is required' })} className="fi" placeholder="TCS, Apollo Hospital…" style={{ borderColor: errors.organisationName ? 'var(--err)' : undefined }} />
                <Err msg={errors.organisationName?.message as string} />
              </div>
              <div style={mb}>
                <L>Contact Person</L>
                <input {...register('contactPerson')} className="fi" placeholder="HR Manager / Admin Name" />
              </div>
              <div style={mb}>
                <L>Email *</L>
                <input {...register('contactEmail', { required:'Email is required', pattern:{ value:/^\S+@\S+\.\S+$/, message:'Enter a valid email' } })} type="email" className="fi" placeholder="hr@company.com" style={{ borderColor: errors.contactEmail ? 'var(--err)' : undefined }} />
                <Err msg={errors.contactEmail?.message as string} />
              </div>
              <div style={mb}>
                <L>Phone</L>
                <input {...register('contactPhone')} className="fi" placeholder="+91 98765 43210" />
              </div>
            </F>
          </div>

          {/* Job details */}
          <div className="gc" style={{ padding:'28px', marginBottom:'18px' }}>
            <S>📌 Job / RFP Details</S>
            <F>
              <div style={mb}>
                <L>Posting Type</L>
                <select {...register('listingType')} className="fi">
                  <option value="JOB_OPENING">Job Opening</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="RFP_TENDER">RFP / Tender</option>
                  <option value="TRAINING_PROGRAM">Training Program</option>
                  <option value="CONSULTANCY_NEED">Consultancy Need</option>
                  <option value="VENDOR_REQUIREMENT">Vendor Requirement</option>
                </select>
              </div>
              <div style={mb}>
                <L>For Role Type</L>
                <select {...register('targetRoleType')} className="fi">
                  {[['JOB_SEEKER','Job Seeker'],['INTERN','Intern'],['FRESHER','Fresher'],['FREELANCER','Freelancer'],['CONSULTANT','Consultant'],['TRAINER','Trainer'],['RECRUITER','Recruiter'],['VENDOR','Vendor']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ ...mb, gridColumn:'span 2' }}>
                <L>Job / RFP Title *</L>
                <input {...register('title', { required:'Title is required', maxLength:{ value:200, message:'Title too long' } })} className="fi" placeholder="e.g. Senior React Developer, Data Science Internship" style={{ borderColor: errors.title ? 'var(--err)' : undefined }} />
                <Err msg={errors.title?.message as string} />
              </div>
              <div style={mb}>
                <L>Industry</L>
                <select {...register('industry')} className="fi">
                  {[['IT_SOFTWARE','IT / Software'],['HEALTHCARE','Healthcare'],['FINANCE_BANKING','Finance / Banking'],['GOVERNMENT_PSU','Government / PSU'],['EDUCATION','Education'],['ENGINEERING','Engineering'],['MARKETING','Marketing'],['SERVICES','Services'],['OTHER','Other']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={mb}>
                <L>Location *</L>
                <input {...register('location', { required:'Location is required' })} className="fi" placeholder="Bengaluru, Karnataka" style={{ borderColor: errors.location ? 'var(--err)' : undefined }} />
                <Err msg={errors.location?.message as string} />
              </div>
              <div style={mb}>
                <L>Payment Type</L>
                <select {...register('payment')} className="fi">
                  <option value="PAID">Paid</option><option value="UNPAID">Unpaid</option><option value="STIPEND">Stipend</option><option value="NEGOTIABLE">Negotiable</option>
                </select>
              </div>
              <div style={mb}>
                <L>Salary / Budget</L>
                <input {...register('salary')} className="fi" placeholder="₹18–28 LPA · ₹15,000 Stipend/Month" />
              </div>
              <div style={mb}>
                <L>Mode of Work</L>
                <select {...register('workMode')} className="fi">
                  <option value="WFH">WFH</option><option value="ON_SITE">On-Site</option><option value="HYBRID">Hybrid</option><option value="OFF_SITE">Off-Site</option>
                </select>
              </div>
              <div style={mb}>
                <L>Certificate Provided</L>
                <select {...register('certificateProvided')} className="fi">
                  <option value="YES">Yes</option><option value="NO">No</option>
                </select>
              </div>
              <div style={mb}>
                <L>Post-Engagement Employment</L>
                <select {...register('employmentOption')} className="fi">
                  <option value="EXISTS">Exists</option><option value="NOT_EXISTS">Not Exists</option>
                </select>
              </div>
              <div style={mb}>
                <L>Experience Required</L>
                <select {...register('experienceRequired')} className="fi">
                  <option value="ANY">Any</option><option value="FRESHER_0_1">Fresher / 0–1 yr</option><option value="EXP_1_3">1–3 yrs</option><option value="EXP_3_5">3–5 yrs</option><option value="EXP_5_8">5–8 yrs</option><option value="EXP_8_PLUS">8+ yrs</option>
                </select>
              </div>
              <div style={mb}>
                <L>Duration</L>
                <select {...register('duration')} className="fi">
                  <option value="PERMANENT">Permanent</option><option value="SHORT_TERM">Short Term</option><option value="MEDIUM_TERM">Medium Term</option><option value="LONG_TERM">Long Term</option><option value="PROJECT_BASED">Project Based</option>
                </select>
              </div>
              <div style={{ ...mb, gridColumn:'span 2' }}>
                <L>Key Skills (comma separated)</L>
                <input {...register('skills')} className="fi" placeholder="React, Node.js, Python, Communication…" />
              </div>
              <div style={{ ...mb, gridColumn:'span 2' }}>
                <L>Facilities / Benefits</L>
                <input {...register('facilities')} className="fi" placeholder="Health Insurance, PF, Accommodation, Laptop…" />
              </div>
              <div style={{ ...mb, gridColumn:'span 2' }}>
                <L>Job Description *</L>
                <textarea {...register('description', { required:'Description is required', minLength:{ value:30, message:'Please provide at least 30 characters' } })} className="fi" style={{ borderColor: errors.description ? 'var(--err)' : undefined, minHeight:'120px' }} placeholder="Describe the role, responsibilities, team and growth…" />
                <Err msg={errors.description?.message as string} />
              </div>
              <div style={{ ...mb, gridColumn:'span 2' }}>
                <L>Experience Details</L>
                <textarea {...register('experienceDetail')} className="fi" style={{ minHeight:'90px' }} placeholder="Describe what experience is required in detail…" />
              </div>
            </F>

            {mut.isError && (
              <div style={{ padding:'10px 14px', borderRadius:'10px', background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.3)', fontSize:'12px', color:'var(--err)', marginBottom:'14px' }}>
                Submission failed — please check all required fields and try again.
              </div>
            )}

            <button type="submit" disabled={mut.isPending} className="btn-gold" style={{ width:'100%', padding:'15px', fontSize:'14px', borderRadius:'12px', border:'none', cursor:'pointer', opacity:mut.isPending?0.6:1, marginTop:'8px' }}>
              {mut.isPending ? 'Submitting…' : '✦ Submit for Moderator Review ✦'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
