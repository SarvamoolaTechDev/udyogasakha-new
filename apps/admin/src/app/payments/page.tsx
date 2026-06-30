'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';
import { SkeletonRow } from '@/components/ui/Skeleton';

const STATUS_COLOR: Record<string, string> = {
  CREATED:   'var(--muted)',
  AUTHORIZED:'var(--info)',
  CAPTURED:  'var(--ok)',
  FAILED:    'var(--err)',
  REFUNDED:  'var(--warn)',
};

const METHOD_LABEL: Record<string, string> = {
  CARD:               '💳 Card',
  UPI:                '📱 UPI',
  NETBANKING:         '🏦 Net Banking',
  WALLET:             '👛 Wallet',
  EMI:                '📆 EMI',
  PAYLATER:           '⏳ Pay Later',
  INTERNATIONAL_CARD: '🌍 Intl. Card',
  OTHER:               '— Other',
};

const STATUSES = ['', 'CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'];

export default function PaymentsPage() {
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', status, page],
    queryFn:  () => paymentsApi.getAll({ status: status || undefined, page, limit: 25 }),
    placeholderData: (prev: any) => prev,
  });

  const payments: any[] = (data as any)?.data       ?? [];
  const total:    number = (data as any)?.total      ?? 0;
  const totalPages       = (data as any)?.totalPages ?? 1;

  const capturedTotal = payments
    .filter(p => p.status === 'CAPTURED')
    .reduce((sum, p) => sum + p.amountPaise, 0) / 100;

  return (
    <div style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>Payments</h1>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{total} total transactions</p>
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s || 'all'} onClick={() => { setStatus(s); setPage(1); }} style={{
              padding: '6px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              border: '1px solid', fontFamily: 'Raleway,sans-serif',
              background:  status === s ? 'rgba(212,160,23,0.12)' : 'transparent',
              borderColor: status === s ? 'var(--border)' : 'var(--bf)',
              color:       status === s ? 'var(--gold3)' : 'var(--muted)',
            }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stat — captured total on current page (not a full aggregate, just a glance) */}
      <div className="gc" style={{ padding: '16px 20px', marginBottom: '18px', display: 'inline-block' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
          Captured (this page)
        </div>
        <div style={{ fontFamily: 'Cinzel,serif', fontSize: '20px', fontWeight: 700, color: 'var(--ok)' }}>
          ₹{capturedTotal.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="gc" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="rt">
            <thead>
              <tr>{['User', 'Purpose', 'Amount', 'Method', 'Status', 'Date'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : payments.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No payments found.</td></tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{p.user?.name ?? '—'}</div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{p.user?.email}</div>
                    </td>
                    <td style={{ fontSize: '11px' }}>
                      {p.purpose?.replace(/_/g, ' ')}
                      {p.internationalPayment && <span style={{ marginLeft: '6px', fontSize: '9px', color: 'var(--info)' }}>🌍 intl</span>}
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold3)' }}>
                      {(p.amountPaise / 100).toLocaleString('en-IN')} {p.currency}
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {p.method ? METHOD_LABEL[p.method] ?? p.method : '—'}
                    </td>
                    <td>
                      <span style={{ padding: '2px 9px', borderRadius: '50px', fontSize: '9px', fontWeight: 700, background: 'rgba(255,255,255,0.05)', color: STATUS_COLOR[p.status] ?? 'var(--muted)' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--bf)' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{total} payments · page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--bf)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '11px', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--bf)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '11px', opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
