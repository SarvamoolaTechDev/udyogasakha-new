'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import { SkeletonRow } from '@/components/ui/Skeleton';

type Mode = 'recent' | 'entity' | 'actor';

const ENTITY_TYPES = ['listing', 'profile', 'user', 'auth'];

const ACTION_COLOR: Record<string, string> = {
  APPROVED:    'var(--ok)',
  REJECTED:    'var(--err)',
  REACTIVATED: 'var(--info)',
  CREATED:     'var(--gold3)',
  UPDATED:     'var(--warn)',
  LOGIN:       'var(--muted)',
  LOGIN_FAILED:'var(--err)',
  LOGOUT:      'var(--faint)',
  REGISTERED:  'var(--gold2)',
  PASSWORD_CHANGED:              'var(--warn)',
  PROFILE_UPDATED:               'var(--gold3)',
  REFRESH_TOKEN_REPLAY_SUSPECTED:'var(--err)',
};

export default function AuditPage() {
  const [mode,       setMode]       = useState<Mode>('recent');
  const [entityType, setEntityType] = useState('listing');
  const [entityId,   setEntityId]   = useState('');
  const [actorId,    setActorId]    = useState('');
  const [submitted,  setSubmitted]  = useState(false);
  const [page,       setPage]       = useState(1);

  const recentQ = useQuery({
    queryKey: ['audit', 'recent', page],
    queryFn:  () => auditApi.recent({ page, limit: 30 }),
    enabled:  mode === 'recent',
  });

  const entityQ = useQuery({
    queryKey: ['audit', 'entity', entityType, entityId, page],
    queryFn:  () => auditApi.forEntity(entityType, entityId, { page, limit: 30 }),
    enabled:  mode === 'entity' && submitted && !!entityId.trim(),
  });

  const actorQ = useQuery({
    queryKey: ['audit', 'actor', actorId, page],
    queryFn:  () => auditApi.forActor(actorId, { page, limit: 30 }),
    enabled:  mode === 'actor' && submitted && !!actorId.trim(),
  });

  const q          = mode === 'recent' ? recentQ : mode === 'entity' ? entityQ : actorQ;
  const entries    = (q.data as any)?.data       ?? [];
  const total      = (q.data as any)?.total      ?? 0;
  const totalPages = (q.data as any)?.totalPages ?? 1;

  const submit = () => { setSubmitted(true); setPage(1); };

  return (
    <div style={{ padding: '28px' }}>
      <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Audit Log</h1>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>Immutable record of all platform state changes. Read-only.</p>

      {/* Mode + filter controls */}
      <div className="gc" style={{ padding: '20px', marginBottom: '18px' }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(['recent', 'entity', 'actor'] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setSubmitted(false); setPage(1); }} style={{
              padding: '7px 16px', borderRadius: '50px', fontSize: '11px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Raleway,sans-serif', transition: 'all 0.2s', border: '1px solid',
              background:   mode === m ? 'rgba(212,160,23,0.12)' : 'transparent',
              borderColor:  mode === m ? 'var(--border)' : 'var(--bf)',
              color:        mode === m ? 'var(--gold3)' : 'var(--muted)',
            }}>
              {m === 'recent' ? '⏱ Recent' : m === 'entity' ? '🔍 By Entity' : '👤 By Actor'}
            </button>
          ))}
        </div>

        {mode === 'entity' && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label className="il">Entity Type</label>
              <select value={entityType} onChange={e => setEntityType(e.target.value)} className="fi" style={{ width: '130px' }}>
                {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="il">Entity ID (UUID)</label>
              <input value={entityId} onChange={e => setEntityId(e.target.value)} className="fi"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                style={{ fontFamily: 'monospace', fontSize: '12px' }} />
            </div>
            <button onClick={submit} disabled={!entityId.trim()} className="btn-gold"
              style={{ padding: '11px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '12px', opacity: entityId.trim() ? 1 : 0.4, alignSelf: 'flex-end' }}>
              Search
            </button>
          </div>
        )}

        {mode === 'actor' && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="il">Actor User ID (UUID)</label>
              <input value={actorId} onChange={e => setActorId(e.target.value)} className="fi"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                style={{ fontFamily: 'monospace', fontSize: '12px' }} />
            </div>
            <button onClick={submit} disabled={!actorId.trim()} className="btn-gold"
              style={{ padding: '11px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontSize: '12px', opacity: actorId.trim() ? 1 : 0.4, alignSelf: 'flex-end' }}>
              Search
            </button>
          </div>
        )}
      </div>

      {/* Results table */}
      <div className="gc" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px' }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
            {total > 0 ? `${total} entries` : 'No results yet'}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="rt">
            <thead>
              <tr>
                {['Timestamp', 'Action', 'Entity', 'Entity ID', 'Actor', 'Metadata'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {q.isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    {mode === 'recent' ? 'No audit entries yet.' : 'No results for this query.'}
                  </td>
                </tr>
              ) : (
                entries.map((e: any) => (
                  <tr key={e.id}>
                    <td style={{ fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {new Date(e.ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}<br />
                      <span style={{ color: 'var(--faint)' }}>
                        {new Date(e.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '50px', fontSize: '9px', fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: ACTION_COLOR[e.action] ?? 'var(--offwhite)' }}>
                        {e.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--gold3)', fontWeight: 600 }}>{e.entityType}</td>
                    <td style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                      {e.entityId?.slice(-12) ?? '—'}
                    </td>
                    <td style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                      {e.actorEmail || (e.actorId ? e.actorId.slice(-8) : '—')}
                    </td>
                    <td style={{ fontSize: '10px', color: 'var(--muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.metadata ? JSON.stringify(e.metadata).slice(0, 90) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--bf)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{total} entries · page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--bf)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '11px', opacity: page === 1 ? 0.4 : 1 }}>
                ← Prev
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--bf)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '11px', opacity: page === totalPages ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
