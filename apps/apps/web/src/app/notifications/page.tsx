'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import Link from 'next/link';

export default function NotificationsPage() {
  const [page, setPage]         = useState(1);
  const [unreadOnly, setUnread] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page, unreadOnly],
    queryFn:  () => notificationsApi.list({ unread: unreadOnly || undefined, page, limit: 20 }),
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const notifications: any[] = data?.data ?? [];
  const total      = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <section style={{ padding:'48px 4%', maxWidth:'760px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(20px,3vw,32px)', fontWeight:700, color:'#fff', margin:0 }}>Notifications</h1>
          <p style={{ fontSize:'12px', color:'var(--muted)', marginTop:'4px' }}>{total} total</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          {/* Unread filter toggle */}
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
            <div
              onClick={() => { setUnread(v => !v); setPage(1); }}
              style={{
                width:'36px', height:'20px', borderRadius:'50px', position:'relative', cursor:'pointer',
                background: unreadOnly ? 'linear-gradient(135deg,var(--gold),var(--gold2))' : 'rgba(255,255,255,0.1)',
                border: '1px solid var(--border)', transition:'all 0.2s',
              }}
            >
              <div style={{
                position:'absolute', top:'2px', width:'14px', height:'14px', borderRadius:'50%', background:'#fff',
                left: unreadOnly ? '19px' : '3px', transition:'left 0.2s',
              }} />
            </div>
            Unread only
          </label>

          <button
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending || notifications.every(n => n.read)}
            style={{
              padding:'7px 14px', borderRadius:'50px', fontSize:'11px', fontWeight:600, cursor:'pointer',
              background:'rgba(212,160,23,0.08)', border:'1px solid var(--border)', color:'var(--gold3)',
              opacity: markAllMut.isPending || notifications.every(n => n.read) ? 0.4 : 1,
            }}
          >
            {markAllMut.isPending ? 'Marking…' : 'Mark all read'}
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="gc" style={{ overflow:'hidden' }}>
        {isLoading ? (
          <div style={{ padding:'32px', textAlign:'center', color:'var(--muted)' }}>Loading…</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔔</div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'16px', fontWeight:700, color:'#fff', marginBottom:'8px' }}>
              {unreadOnly ? 'All caught up!' : 'No notifications yet'}
            </div>
            <p style={{ fontSize:'13px', color:'var(--muted)' }}>
              {unreadOnly ? 'You have no unread notifications.' : 'Notifications will appear here when your profiles or listings are reviewed.'}
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((n: any) => (
              <div
                key={n.id}
                onClick={() => { if (!n.read) markReadMut.mutate(n.id); }}
                style={{
                  display:'flex', gap:'14px', padding:'16px 20px', cursor: n.read ? 'default' : 'pointer',
                  borderBottom:'1px solid var(--bf)',
                  background: n.read ? 'transparent' : 'rgba(212,160,23,0.03)',
                  transition:'background 0.15s',
                }}
              >
                {/* Unread indicator */}
                <div style={{ width:'8px', flexShrink:0, display:'flex', alignItems:'flex-start', paddingTop:'5px' }}>
                  {!n.read && (
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--gold2)', boxShadow:'0 0 6px var(--goldglow)', flexShrink:0 }} />
                  )}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:'8px', marginBottom:'4px' }}>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color: n.read ? 'var(--muted)' : '#fff' }}>
                      {n.subject}
                    </div>
                    <div style={{ fontSize:'10px', color:'var(--faint)', whiteSpace:'nowrap', flexShrink:0 }}>
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                  <p style={{ fontSize:'12px', color:'var(--muted)', lineHeight:1.65, fontWeight:300, margin:0 }}>{n.body}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={e => e.stopPropagation()}
                      style={{ display:'inline-block', marginTop:'8px', fontSize:'11px', color:'var(--gold3)', textDecoration:'none', fontWeight:600 }}
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px' }}>
                <span style={{ fontSize:'11px', color:'var(--muted)' }}>Page {page} of {totalPages}</span>
                <div style={{ display:'flex', gap:'6px' }}>
                  <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ padding:'5px 12px', borderRadius:'8px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'11px', opacity:page===1?0.4:1 }}>← Prev</button>
                  <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} style={{ padding:'5px 12px', borderRadius:'8px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'11px', opacity:page===totalPages?0.4:1 }}>Next →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
