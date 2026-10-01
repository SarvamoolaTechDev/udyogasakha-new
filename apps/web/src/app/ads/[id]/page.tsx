'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useWallet, UNLOCK_COST, LOW_BALANCE, TopUpModal, LowBalanceModal } from '@/components/wallet/WalletComponents';

const WMODE_LABELS: Record<string,string> = { WFH:'Work From Home', ON_SITE:'On-Site', HYBRID:'Hybrid', OFF_SITE:'Off-Site' };

export default function AdDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const { balance, invalidate: invalidateBalance } = useWallet();
  const qc = useQueryClient();
  const router = useRouter();

  const [showTopUp,   setShowTopUp]   = useState(false);
  const [showLowBal,  setShowLowBal]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const [contactInfo, setContactInfo] = useState<any>(null);

  const { data: ad, isLoading } = useQuery({
    queryKey: ['ad', id],
    queryFn:  () => adsApi.findById(id),
    enabled:  !!id && isAuthenticated,
  });

  const unlockMutation = useMutation({
    mutationFn: () => adsApi.unlockContact(id),
    onSuccess: (data: any) => {
      setContactInfo(data);
      invalidateBalance();
      qc.invalidateQueries({ queryKey: ['ad', id] });
      setShowConfirm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => adsApi.remove(id),
    onSuccess: () => router.push('/ads/my'),
  });

  const handleUnlockClick = () => {
    if (balance < UNLOCK_COST) { setShowLowBal(true); return; }
    if (balance <= LOW_BALANCE) { setShowLowBal(true); return; }
    setShowConfirm(true);
  };

  if (!isAuthenticated) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <Link href={`/login?from=/ads/${id}`} className="btn-gold" style={{ padding:'12px 28px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>Sign In to View →</Link>
    </div>
  );

  if (isLoading) return <div style={{ padding:'60px', textAlign:'center', color:'var(--muted)' }}>Loading…</div>;
  if (!ad)       return <div style={{ padding:'60px', textAlign:'center', color:'var(--muted)' }}>Ad not found.</div>;

  const a = ad as any;
  const isUnlocked = a.isUnlocked || !!contactInfo;
  const contact    = contactInfo ?? a;
  const skills     = Array.isArray(a.skills) ? a.skills : [];

  return (
    <div style={{ maxWidth:'860px', margin:'0 auto', padding:'36px 4%' }}>
      <Link href="/ads" style={{ fontSize:'12px', color:'var(--muted)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'6px', marginBottom:'24px' }}>
        ← Back to Ads
      </Link>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'24px', alignItems:'start' }}>
        {/* Main content */}
        <div>
          {a.isExpired && (
            <div style={{ padding:'10px 16px', borderRadius:'10px', background:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.25)', color:'var(--warn)', fontSize:'12px', marginBottom:'16px' }}>
              ⚠️ This ad has expired.{a.isOwner ? ' Extend it to make it active again.' : ''}
            </div>
          )}

          <div className="gc" style={{ padding:'28px', marginBottom:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
              <div>
                <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'22px', fontWeight:700, color:'var(--offwhite)', marginBottom:'5px' }}>{a.title}</h1>
                <div style={{ fontSize:'12px', color:'var(--muted)' }}>by {a.user?.name} · {WMODE_LABELS[a.workMode]} {a.location && `· 📍 ${a.location}`}</div>
              </div>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <span style={{ fontSize:'11px', color: a.daysRemaining <= 3 ? 'var(--warn)' : 'var(--muted)' }}>{a.daysRemaining}d remaining</span>
                {a.isOwner && (
                  <>
                    <Link href={`/ads/${id}/edit`} style={{ padding:'6px 14px', borderRadius:'50px', border:'1px solid var(--border)', color:'var(--muted)', textDecoration:'none', fontSize:'11px' }}>Edit</Link>
                    <button onClick={() => setShowDelete(true)} style={{ padding:'6px 14px', borderRadius:'50px', border:'1px solid rgba(220,38,38,0.3)', color:'var(--err)', background:'transparent', cursor:'pointer', fontSize:'11px' }}>Delete</button>
                  </>
                )}
              </div>
            </div>

            {a.salaryExpect && (
              <div style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'var(--gold3)', marginBottom:'14px' }}>{a.salaryExpect}</div>
            )}

            <p style={{ fontSize:'14px', color:'var(--muted)', lineHeight:1.8, marginBottom:'18px', whiteSpace:'pre-wrap' }}>{a.description}</p>

            {skills.length > 0 && (
              <div style={{ marginBottom:'16px' }}>
                <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Skills</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {skills.map((s: string) => (
                    <span key={s} style={{ padding:'4px 12px', borderRadius:'50px', fontSize:'11px', background:'rgba(200,146,10,0.07)', border:'1px solid var(--border)', color:'var(--offwhite)' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats for owner */}
            {a.isOwner && (
              <div style={{ display:'flex', gap:'20px', paddingTop:'16px', borderTop:'1px solid var(--bf)', fontSize:'12px', color:'var(--muted)' }}>
                <span>👁 {a.viewCount} views</span>
              </div>
            )}
          </div>

          {/* Report link */}
          {!a.isOwner && (
            <div style={{ textAlign:'right' }}>
              <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:'11px', color:'var(--faint)', textDecoration:'underline' }}
                onClick={() => alert('Report functionality: use the main reports flow')}>
                Report this ad
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position:'sticky', top:'86px' }}>
          {/* Extend button for owner */}
          {a.isOwner && (
            <div className="gc" style={{ padding:'20px', marginBottom:'14px' }}>
              <div style={{ fontSize:'12px', fontWeight:600, color:'var(--offwhite)', marginBottom:'8px' }}>Extend Your Ad</div>
              <p style={{ fontSize:'11px', color:'var(--muted)', marginBottom:'12px' }}>Add 30 more days for {UNLOCK_COST} points.</p>
              <button onClick={() => adsApi.extend(id).then(() => qc.invalidateQueries({ queryKey: ['ad', id] }))}
                className="btn-gold" style={{ width:'100%', padding:'10px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>
                Extend · {UNLOCK_COST} pts
              </button>
            </div>
          )}

          {/* Contact unlock for viewers */}
          {!a.isOwner && (
            <div className="gc" style={{ padding:'22px' }}>
              {isUnlocked ? (
                <>
                  <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>Contact Details</div>
                  {contact.contactEmail && (
                    <div style={{ marginBottom:'12px' }}>
                      <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'3px' }}>Email</div>
                      <a href={`mailto:${contact.contactEmail}`} style={{ fontSize:'13px', fontWeight:600, color:'var(--offwhite)', textDecoration:'none' }}>{contact.contactEmail}</a>
                    </div>
                  )}
                  {contact.contactPhone && (
                    <div>
                      <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'3px' }}>Phone</div>
                      <a href={`tel:${contact.contactPhone}`} style={{ fontSize:'13px', fontWeight:600, color:'var(--offwhite)', textDecoration:'none' }}>{contact.contactPhone}</a>
                    </div>
                  )}
                  {!contact.contactEmail && !contact.contactPhone && (
                    <p style={{ fontSize:'12px', color:'var(--muted)' }}>No contact details provided for this ad.</p>
                  )}
                </>
              ) : (
                <>
                  <div style={{ textAlign:'center', marginBottom:'16px' }}>
                    <div style={{ fontSize:'28px', marginBottom:'8px' }}>🔒</div>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>Get Contact Details</div>
                    <p style={{ fontSize:'11px', color:'var(--muted)', lineHeight:1.6 }}>Unlock this Job Seeker's contact info — permanent access for {UNLOCK_COST} points.</p>
                  </div>
                  <button onClick={handleUnlockClick} disabled={unlockMutation.isPending || a.isExpired}
                    style={{ width:'100%', padding:'12px', borderRadius:'50px', border:'none', cursor: a.isExpired ? 'not-allowed':'pointer',
                      fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700,
                      background:'linear-gradient(135deg,var(--gold2),var(--gold3))', color:'#fff',
                      opacity: unlockMutation.isPending || a.isExpired ? 0.5 : 1 }}>
                    {unlockMutation.isPending ? 'Processing…' : a.isExpired ? 'Ad Expired' : `Unlock · ${UNLOCK_COST} pts`}
                  </button>
                  {unlockMutation.isError && (
                    <p style={{ fontSize:'11px', color:'var(--err)', marginTop:'8px', textAlign:'center' }}>
                      {(unlockMutation.error as any)?.response?.data?.message ?? 'Failed — please try again'}
                    </p>
                  )}
                  <div style={{ textAlign:'center', marginTop:'8px', fontSize:'10px', color:'var(--faint)' }}>Your balance: {balance} pts</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Unlock confirmation popup */}
      {showConfirm && (
        <div onClick={() => setShowConfirm(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'20px', border:'1px solid var(--border)', padding:'28px', maxWidth:'360px', width:'100%', textAlign:'center', boxShadow:'0 16px 48px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🔓</div>
            <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'var(--offwhite)', marginBottom:'8px' }}>Unlock Contact Details?</h3>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.7, marginBottom:'20px' }}>
              {UNLOCK_COST} points will be deducted from your wallet. You'll have permanent access to this person's contact info.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <button onClick={() => unlockMutation.mutate()} className="btn-gold" style={{ padding:'12px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>
                Yes, Unlock for {UNLOCK_COST} Points
              </button>
              <button onClick={() => setShowConfirm(false)} style={{ padding:'10px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div onClick={() => setShowDelete(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'20px', border:'1px solid rgba(220,38,38,0.3)', padding:'28px', maxWidth:'360px', width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🗑️</div>
            <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'var(--offwhite)', marginBottom:'8px' }}>Delete This Ad?</h3>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.7, marginBottom:'20px' }}>This cannot be undone. The ad and all its view data will be permanently removed.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}
                style={{ padding:'12px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', fontFamily:'Raleway,sans-serif', fontWeight:700, background:'var(--err)', color:'#fff' }}>
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete Ad'}
              </button>
              <button onClick={() => setShowDelete(false)} style={{ padding:'10px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showTopUp  && <TopUpModal onClose={() => setShowTopUp(false)} />}
      {showLowBal && (
        <LowBalanceModal balance={balance} canProceed={balance >= UNLOCK_COST}
          onProceed={() => { setShowLowBal(false); setShowConfirm(true); }}
          onTopUp={() => { setShowLowBal(false); setShowTopUp(true); }}
          onClose={() => setShowLowBal(false)} />
      )}
    </div>
  );
}
