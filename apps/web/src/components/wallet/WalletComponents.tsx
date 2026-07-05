'use client';
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi, paymentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';

export const UNLOCK_COST        = 30;
export const LOW_BALANCE        = 200; // show warning when balance ≤ this
export const TOPUP_TIERS        = [500, 1000, 2000, 5000];

// ── useWallet ─────────────────────────────────────────────────────────────────
export function useWallet() {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn:  () => walletApi.balance(),
    enabled:  isAuthenticated,
    refetchInterval: 30_000,
  });

  const balance: number = (data as any)?.balance ?? 0;

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['wallet-balance'] });
  }, [qc]);

  return { balance, invalidate };
}

// ── WalletBalance pill (shown in Navbar) ─────────────────────────────────────
export function WalletBalance() {
  const { isAuthenticated } = useAuthStore();
  const { balance } = useWallet();
  if (!isAuthenticated) return null;

  const low = balance <= LOW_BALANCE;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '5px 12px', borderRadius: '50px',
      border: `1px solid ${low ? 'rgba(220,38,38,0.3)' : 'var(--border)'}`,
      background: low ? 'rgba(220,38,38,0.06)' : 'rgba(200,146,10,0.06)',
      fontSize: '11px', fontWeight: 700, cursor: 'default',
      color: low ? 'var(--err)' : 'var(--gold3)',
    }}>
      <span>⬡</span>
      <span>{balance} pts</span>
      {low && <span title="Low balance">⚠️</span>}
    </div>
  );
}

// ── TopUpModal ───────────────────────────────────────────────────────────────
interface TopUpModalProps {
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
}

export function TopUpModal({ onClose, onSuccess }: TopUpModalProps) {
  const [selected, setSelected]   = useState<number | null>(null);
  const [custom,   setCustom]     = useState('');
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');
  const { invalidate } = useWallet();
  const { startPayment } = useRazorpayCheckout();

  const amount = selected ?? (parseInt(custom) || 0);
  const valid  = amount >= 100 && amount <= 5000;

  const handlePay = () => {
    if (!valid) { setError('Enter an amount between ₹100 and ₹5,000'); return; }
    setLoading(true); setError('');
    startPayment({
      purpose:     'WALLET_TOPUP',
      amount,
      currency:    'INR',
      description: `Add ${amount} points to wallet`,
      onSuccess: async () => {
        invalidate();
        onSuccess?.(amount); // rough new balance — exact value comes from next poll
        setLoading(false);
        onClose();
      },
      onFailure: () => { setError('Payment failed. Please try again.'); setLoading(false); },
      onDismiss: () => setLoading(false),
    });
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'20px', border:'1px solid var(--border)', padding:'28px', width:'100%', maxWidth:'380px', boxShadow:'0 16px 48px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>Top Up Wallet</h3>
        <p style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'20px' }}>1 rupee = 1 point · Each job/candidate detail unlock costs 30 points</p>

        {/* Tier buttons */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'14px' }}>
          {TOPUP_TIERS.map(t => (
            <button key={t} onClick={() => { setSelected(t); setCustom(''); }}
              style={{ padding:'12px', borderRadius:'12px', border:`2px solid ${selected===t ? 'var(--gold2)' : 'var(--bf)'}`, background: selected===t ? 'rgba(200,146,10,0.08)' : '#F8F9FF', cursor:'pointer', fontFamily:'Cinzel,serif', fontSize:'14px', fontWeight:700, color: selected===t ? 'var(--gold3)' : 'var(--offwhite)', transition:'all 0.15s' }}>
              ₹{t.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'6px' }}>Custom Amount</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'13px', color:'var(--muted)' }}>₹</span>
            <input
              type="number" min={100} max={5000}
              value={custom}
              onChange={e => { setCustom(e.target.value); setSelected(null); }}
              placeholder="100 – 5000"
              className="fi"
              style={{ paddingLeft:'26px' }}
            />
          </div>
        </div>

        {error && <p style={{ fontSize:'11px', color:'var(--err)', marginBottom:'10px' }}>{error}</p>}

        <button onClick={handlePay} disabled={loading || !valid} className="btn-gold"
          style={{ width:'100%', padding:'13px', borderRadius:'50px', border:'none', cursor: valid?'pointer':'not-allowed', fontSize:'12px', opacity: !valid||loading ? 0.5 : 1 }}>
          {loading ? 'Opening checkout…' : `Pay ₹${amount || '—'} →`}
        </button>
        <button onClick={onClose} style={{ width:'100%', marginTop:'10px', padding:'8px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── LowBalanceModal ───────────────────────────────────────────────────────────
interface LowBalanceModalProps {
  balance:      number;
  canProceed:   boolean; // false when balance < UNLOCK_COST
  onProceed?:   () => void;
  onTopUp:      () => void;
  onClose:      () => void;
}

export function LowBalanceModal({ balance, canProceed, onProceed, onTopUp, onClose }: LowBalanceModalProps) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'20px', border:`1px solid ${canProceed ? 'rgba(217,119,6,0.3)' : 'rgba(220,38,38,0.3)'}`, padding:'28px', width:'100%', maxWidth:'360px', boxShadow:'0 16px 48px rgba(0,0,0,0.15)', textAlign:'center' }}>
        <div style={{ fontSize:'40px', marginBottom:'12px' }}>{canProceed ? '⚠️' : '🔒'}</div>
        <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'var(--offwhite)', marginBottom:'8px' }}>
          {canProceed ? 'Points Running Low' : 'Insufficient Points'}
        </h3>
        <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.7, marginBottom:'20px' }}>
          {canProceed
            ? `You have ${balance} points remaining. Unlocking this will cost ${UNLOCK_COST} points, leaving you with ${balance - UNLOCK_COST}. Top up to keep viewing job details and candidate profiles.`
            : `You need ${UNLOCK_COST} points to unlock this content but only have ${balance}. Please top up your wallet to continue.`
          }
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <button onClick={onTopUp} className="btn-gold" style={{ padding:'12px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>
            Top Up Wallet →
          </button>
          {canProceed && onProceed && (
            <button onClick={onProceed} style={{ padding:'10px', borderRadius:'50px', border:'1px solid var(--border)', background:'transparent', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
              Proceed anyway ({UNLOCK_COST} pts)
            </button>
          )}
          <button onClick={onClose} style={{ padding:'8px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--faint)' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
