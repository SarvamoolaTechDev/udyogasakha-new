'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { talentApi, walletApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useWallet, UNLOCK_COST, LOW_BALANCE, TopUpModal, LowBalanceModal } from '@/components/wallet/WalletComponents';
import { SkeletonCard } from '@/components/ui/Skeleton';

const MARKET_LABEL: Record<string, string> = { IT_FIELD:'IT Field', NON_IT_FIELD:'Non-IT Field', SERVICES:'Services' };

export default function TalentDetailPage() {
  const { profileId } = useParams<{ profileId: string }>();
  const { isAuthenticated } = useAuthStore();
  const { balance, invalidate: invalidateBalance } = useWallet();
  const qc = useQueryClient();

  const [showTopUp,   setShowTopUp]   = useState(false);
  const [showLowBal,  setShowLowBal]  = useState(false);
  const [details,     setDetails]     = useState<any>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['talent-profile', profileId],
    queryFn:  () => talentApi.findById(profileId),
    enabled:  !!profileId && isAuthenticated,
  });

  const { data: unlockStatus } = useQuery({
    queryKey: ['profile-unlock', profileId],
    queryFn:  () => walletApi.profileStatus([profileId]).then((r: any) => r[profileId]),
    enabled:  !!profileId && isAuthenticated,
  });

  const isUnlocked = !!unlockStatus || !!details;

  const unlockMutation = useMutation({
    mutationFn: async () => {
      await walletApi.unlockProfile(profileId);
      return walletApi.getProfileDetails(profileId);
    },
    onSuccess: (contactInfo) => {
      setDetails(contactInfo);
      invalidateBalance();
      qc.invalidateQueries({ queryKey: ['profile-unlock', profileId] });
    },
  });

  const handleUnlockClick = () => {
    if (balance < UNLOCK_COST || balance <= LOW_BALANCE) { setShowLowBal(true); return; }
    unlockMutation.mutate();
  };

  const doUnlock = () => { setShowLowBal(false); unlockMutation.mutate(); };

  if (!isAuthenticated) return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔐</div>
      <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'22px', color:'var(--offwhite)' }}>Sign In Required</h2>
      <Link href="/login?from=/talent" className="btn-gold" style={{ display:'inline-block', marginTop:'16px', padding:'12px 28px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>Sign In →</Link>
    </div>
  );

  if (isLoading) return <div style={{ maxWidth:'800px', margin:'0 auto', padding:'36px 4%' }}><SkeletonCard height="400px" /></div>;
  if (!profile)  return <div style={{ textAlign:'center', padding:'60px', color:'var(--muted)' }}>Candidate profile not found.</div>;

  const p = profile as any;

  return (
    <div style={{ maxWidth:'860px', margin:'0 auto', padding:'36px 4%' }}>
      <Link href="/talent" style={{ fontSize:'12px', color:'var(--muted)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'6px', marginBottom:'24px' }}>
        ← Back to Find Talent
      </Link>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'24px', alignItems:'start' }}>
        {/* Main profile card */}
        <div>
          <div className="gc" style={{ padding:'28px', marginBottom:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
              <div>
                <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'22px', fontWeight:700, color:'var(--offwhite)', marginBottom:'5px' }}>{p.fullName}</h1>
                <div style={{ fontSize:'12px', color:'var(--muted)' }}>{p.roleType?.replace(/_/g,' ')} · {MARKET_LABEL[p.marketField] ?? p.marketField}</div>
              </div>
              <span style={{ padding:'4px 12px', borderRadius:'50px', fontSize:'10px', fontWeight:700, background:'rgba(22,163,74,0.08)', color:'var(--ok)', border:'1px solid rgba(22,163,74,0.2)' }}>✅ Verified</span>
            </div>

            {p.city && (
              <div style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'14px' }}>📍 {p.city} · {p.workMode?.replace(/_/g,' ')}</div>
            )}

            {p.summary && (
              <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.75, marginBottom:'16px' }}>{p.summary}</p>
            )}

            {p.skills?.length > 0 && (
              <div>
                <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'8px' }}>Skills</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {p.skills.map((s: string) => (
                    <span key={s} style={{ padding:'4px 12px', borderRadius:'50px', fontSize:'11px', background:'rgba(200,146,10,0.07)', border:'1px solid var(--border)', color:'var(--offwhite)' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Education */}
          {(p.highestDegree || p.institution) && (
            <div className="gc" style={{ padding:'20px' }}>
              <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px' }}>Education</div>
              <div style={{ fontSize:'13px', fontWeight:600, color:'var(--offwhite)', marginBottom:'3px' }}>{p.highestDegree}{p.specialization ? ` · ${p.specialization}` : ''}</div>
              {p.institution && <div style={{ fontSize:'12px', color:'var(--muted)' }}>{p.institution}</div>}
            </div>
          )}
        </div>

        {/* Sidebar — unlock card */}
        <div style={{ position:'sticky', top:'86px' }}>
          <div className="gc" style={{ padding:'22px' }}>
            {isUnlocked ? (
              <>
                <div style={{ fontSize:'10px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'14px' }}>Contact Details</div>
                {details?.email && (
                  <div style={{ marginBottom:'12px' }}>
                    <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'3px' }}>Email</div>
                    <a href={`mailto:${details.email}`} style={{ fontSize:'13px', fontWeight:600, color:'var(--offwhite)', textDecoration:'none' }}>{details.email}</a>
                  </div>
                )}
                {details?.phone && (
                  <div style={{ marginBottom:'12px' }}>
                    <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'3px' }}>Phone</div>
                    <a href={`tel:${details.phone}`} style={{ fontSize:'13px', fontWeight:600, color:'var(--offwhite)', textDecoration:'none' }}>{details.phone}</a>
                  </div>
                )}
                {details?.city && (
                  <div>
                    <div style={{ fontSize:'10px', color:'var(--muted)', marginBottom:'3px' }}>Location</div>
                    <div style={{ fontSize:'13px', color:'var(--offwhite)' }}>📍 {details.city}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ textAlign:'center', marginBottom:'16px' }}>
                  <div style={{ fontSize:'28px', marginBottom:'8px' }}>🔒</div>
                  <div style={{ fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>Unlock Contact Info</div>
                  <p style={{ fontSize:'11px', color:'var(--muted)', lineHeight:1.6 }}>Get this candidate's email, phone and city. One-time {UNLOCK_COST}-point unlock — permanently yours.</p>
                </div>
                <button
                  onClick={handleUnlockClick}
                  disabled={unlockMutation.isPending}
                  style={{ width:'100%', padding:'12px', borderRadius:'50px', border:'none', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'12px', fontWeight:700, background:'linear-gradient(135deg,var(--gold2),var(--gold3))', color:'#fff', opacity: unlockMutation.isPending ? 0.6 : 1 }}
                >
                  {unlockMutation.isPending ? 'Unlocking…' : `Unlock · ${UNLOCK_COST} pts`}
                </button>
                <div style={{ textAlign:'center', marginTop:'10px', fontSize:'10px', color:'var(--faint)' }}>Your balance: {balance} pts</div>
              </>
            )}
          </div>
        </div>
      </div>

      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
      {showLowBal && (
        <LowBalanceModal
          balance={balance}
          canProceed={balance >= UNLOCK_COST}
          onProceed={doUnlock}
          onTopUp={() => { setShowLowBal(false); setShowTopUp(true); }}
          onClose={() => setShowLowBal(false)}
        />
      )}
    </div>
  );
}
