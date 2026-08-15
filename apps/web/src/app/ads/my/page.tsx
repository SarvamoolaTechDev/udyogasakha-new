'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const STATUS_STYLE: Record<string,any> = {
  ACTIVE:  { bg:'rgba(22,163,74,0.08)',   border:'rgba(22,163,74,0.25)',   color:'var(--ok)',   label:'● Live'    },
  EXPIRED: { bg:'rgba(217,119,6,0.08)',   border:'rgba(217,119,6,0.25)',   color:'var(--warn)', label:'⏱ Expired' },
  DELETED: { bg:'rgba(220,38,38,0.08)',   border:'rgba(220,38,38,0.25)',   color:'var(--err)',  label:'✕ Deleted' },
};

export default function MyAdsPage() {
  const { isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string|null>(null);

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['my-ads'],
    queryFn:  adsApi.getMine,
    enabled:  isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-ads'] }); setDeleteId(null); },
  });

  const extendMutation = useMutation({
    mutationFn: (id: string) => adsApi.extend(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-ads'] }),
    onError:   (e: any) => alert(e?.response?.data?.message ?? 'Failed to extend'),
  });

  if (!isAuthenticated) return <div style={{ padding:'60px', textAlign:'center' }}>Please sign in.</div>;

  const myAds = ads as any[];
  const activeCount = myAds.filter(a => a.status === 'ACTIVE' && !a.isExpired).length;

  return (
    <div style={{ maxWidth:'860px', margin:'0 auto', padding:'36px 4%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, color:'var(--offwhite)', marginBottom:'4px' }}>My Ads</h1>
          <p style={{ fontSize:'12px', color:'var(--muted)' }}>{activeCount}/2 active slots used</p>
        </div>
        {activeCount < 2 && (
          <Link href="/ads/create" className="btn-gold" style={{ padding:'10px 22px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>+ Post New Ad</Link>
        )}
      </div>

      {isLoading && <p style={{ color:'var(--muted)', fontSize:'13px' }}>Loading…</p>}

      {!isLoading && myAds.length === 0 && (
        <div className="gc" style={{ padding:'48px', textAlign:'center' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>📢</div>
          <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'var(--offwhite)', marginBottom:'8px' }}>No Ads Yet</h3>
          <p style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'20px' }}>Post your first ad to let recruiters find you directly.</p>
          <Link href="/ads/create" className="btn-gold" style={{ padding:'12px 24px', borderRadius:'50px', textDecoration:'none', fontSize:'12px' }}>Post Your First Ad →</Link>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        {myAds.map((ad: any) => {
          const st = STATUS_STYLE[ad.isExpired ? 'EXPIRED' : ad.status] ?? STATUS_STYLE.ACTIVE;
          return (
            <div key={ad.id} className="gc" style={{ padding:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                    <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'var(--offwhite)' }}>{ad.title}</h3>
                    <span style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>{st.label}</span>
                  </div>
                  <p style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'12px', lineHeight:1.6 }}>
                    {ad.description?.slice(0,120)}{ad.description?.length > 120 ? '…' : ''}
                  </p>

                  {/* Stats */}
                  <div style={{ display:'flex', gap:'20px', fontSize:'12px' }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'var(--offwhite)' }}>{ad.viewCount}</div>
                      <div style={{ color:'var(--muted)', fontSize:'10px' }}>Views</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color:'var(--gold3)' }}>{ad.unlockCount}</div>
                      <div style={{ color:'var(--muted)', fontSize:'10px' }}>Contact Unlocks</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:'Cinzel,serif', fontSize:'20px', fontWeight:700, color: ad.daysRemaining <= 3 ? 'var(--warn)' : 'var(--offwhite)' }}>{ad.daysRemaining}</div>
                      <div style={{ color:'var(--muted)', fontSize:'10px' }}>Days Left</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', minWidth:'130px' }}>
                  <Link href={`/ads/${ad.id}`} style={{ padding:'8px 14px', borderRadius:'50px', border:'1px solid var(--border)', color:'var(--gold3)', textDecoration:'none', fontSize:'11px', fontWeight:600, textAlign:'center' }}>
                    View Ad
                  </Link>
                  <Link href={`/ads/${ad.id}/edit`} style={{ padding:'8px 14px', borderRadius:'50px', border:'1px solid var(--bf)', color:'var(--muted)', textDecoration:'none', fontSize:'11px', textAlign:'center' }}>
                    Edit
                  </Link>
                  {(ad.isExpired || ad.status === 'ACTIVE') && (
                    <button onClick={() => extendMutation.mutate(ad.id)} disabled={extendMutation.isPending}
                      style={{ padding:'8px 14px', borderRadius:'50px', border:'1px solid rgba(200,146,10,0.3)', background:'rgba(200,146,10,0.06)', color:'var(--gold3)', cursor:'pointer', fontSize:'11px', fontWeight:600 }}>
                      {extendMutation.isPending ? '…' : 'Extend (30 pts)'}
                    </button>
                  )}
                  <button onClick={() => setDeleteId(ad.id)}
                    style={{ padding:'8px 14px', borderRadius:'50px', border:'1px solid rgba(220,38,38,0.2)', background:'transparent', color:'var(--err)', cursor:'pointer', fontSize:'11px' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div onClick={() => setDeleteId(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'20px', border:'1px solid rgba(220,38,38,0.3)', padding:'28px', maxWidth:'360px', width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>🗑️</div>
            <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'var(--offwhite)', marginBottom:'8px' }}>Delete This Ad?</h3>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.7, marginBottom:'20px' }}>This cannot be undone. All view and contact data for this ad will also be removed.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending}
                style={{ padding:'12px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', fontFamily:'Raleway,sans-serif', fontWeight:700, background:'var(--err)', color:'#fff' }}>
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteId(null)} style={{ padding:'10px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
