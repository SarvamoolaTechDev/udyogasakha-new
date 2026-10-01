'use client';
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────────
type Period = '24h' | 'week' | 'month' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  '24h':   'Last 24 Hours',
  'week':  'This Week',
  'month': 'This Month',
  'all':   'All Time',
};

const ROLE_LABELS: Record<string, string> = {
  JOB_SEEKER: 'Job Seeker', INTERN: 'Intern', FRESHER: 'Fresher',
  CONSULTANT: 'Consultant', HIRING_MANAGER: 'Hiring Mgr', RECRUITER: 'Recruiter',
  TRAINER: 'Trainer', VENDOR: 'Vendor', RFP_PROVIDER: 'RFP Provider',
};

const TXN_LABELS: Record<string,string> = {
  JOB_UNLOCK: 'Job Unlock', PROFILE_UNLOCK: 'Profile Unlock',
  AD_CONTACT_UNLOCK: 'Ad Contact', AD_EXTEND: 'Ad Extend',
  TOPUP: 'Top-Up', ADMIN_ADJUSTMENT: 'Admin Adj.', SIGNUP_BONUS: 'Bonus',
};
const TXN_COLORS: Record<string,string> = {
  JOB_UNLOCK: '#1A3A6B', PROFILE_UNLOCK: '#2563EB',
  AD_CONTACT_UNLOCK: '#D97706', AD_EXTEND: '#C8920A',
  TOPUP: '#16A34A', ADMIN_ADJUSTMENT: '#7C3AED', SIGNUP_BONUS: '#DB2777',
};

const MARKET_LABELS: Record<string, string> = {
  IT_FIELD: 'IT Field', NON_IT_FIELD: 'Non-IT', SERVICES: 'Services',
};

const MARKET_COLORS: Record<string, string> = {
  IT_FIELD: '#2563EB', NON_IT_FIELD: '#D97706', SERVICES: '#16A34A',
};

const BAR_COLORS = [
  '#1A3A6B','#2563EB','#3B82F6','#60A5FA','#93C5FD',
  '#D4A017','#B8860B','#D97706','#16A34A','#0F2347',
];

// ── CSV Export ─────────────────────────────────────────────────────────────────
function exportCSV(data: any, period: Period) {
  if (!data) return;
  const rows: string[][] = [];
  const label = PERIOD_LABELS[period];

  rows.push(['Udyogasakha Analytics Export', label, new Date().toLocaleString('en-IN')]);
  rows.push([]);
  rows.push(['PLATFORM HEALTH']);
  rows.push(['Metric', 'Value']);
  rows.push(['Total Users',       data.health.totalUsers]);
  rows.push(['Total Profiles (Approved)', data.health.totalProfiles]);
  rows.push(['Active Listings',   data.health.activeListings]);
  rows.push(['Pending Profiles',  data.health.pendingProfiles]);
  rows.push(['Pending Listings',  data.health.pendingListings]);
  rows.push([]);
  rows.push([`GROWTH (${label})`]);
  rows.push(['Metric', 'Value']);
  rows.push(['New Users',     data.growth.newUsers]);
  rows.push(['New Profiles',  data.growth.newProfiles]);
  rows.push(['New Listings',  data.growth.newListings]);
  rows.push([]);
  rows.push([`MODERATION ACTIVITY (${label})`]);
  rows.push(['Metric', 'Value']);
  rows.push(['Profiles Approved', data.moderation.profilesApproved]);
  rows.push(['Profiles Rejected', data.moderation.profilesRejected]);
  rows.push(['Listings Approved', data.moderation.listingsApproved]);
  rows.push(['Listings Rejected', data.moderation.listingsRejected]);
  rows.push([]);
  rows.push(['PROFILES BY ROLE TYPE (All Approved)']);
  rows.push(['Role', 'Count']);
  data.breakdown.byRole.forEach((r: any) => rows.push([ROLE_LABELS[r.roleType] ?? r.roleType, r.count]));
  rows.push([]);
  rows.push(['PROFILES BY MARKET (All Approved)']);
  rows.push(['Market', 'Count']);
  data.breakdown.byMarket.forEach((r: any) => rows.push([MARKET_LABELS[r.marketField] ?? r.marketField, r.count]));
  rows.push([]);
  rows.push([`REVENUE (${label})`]);
  rows.push(['Metric', 'Value']);
  rows.push(['Wallet Top-Up Revenue (₹)', data.revenue.topUpRevenue.toFixed(2)]);
  rows.push(['Top-Up Transactions',       data.revenue.topUpCount]);
  rows.push(['Featured Listing Revenue (₹)', data.revenue.featuredRevenue.toFixed(2)]);
  rows.push(['Featured Listing Transactions', data.revenue.featuredCount]);
  rows.push(['Total Revenue (₹)',          data.revenue.totalRevenue.toFixed(2)]);
  rows.push(['Listing Unlocks',            data.revenue.listingUnlocks]);
  rows.push(['Profile Unlocks',            data.revenue.profileUnlocks]);
  rows.push(['Total Unlocks',              data.revenue.totalUnlocks]);

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `udyogasakha-analytics-${period}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, highlight = false }: { icon:string; label:string; value:number|string; sub?:string; highlight?:boolean }) {
  return (
    <div className="gc" style={{ padding:'22px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:'11px', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>{label}</div>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'28px', fontWeight:700,
            color: highlight ? 'var(--err)' : 'var(--offwhite)', lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:'11px', color:'var(--muted)', marginTop:'6px' }}>{sub}</div>}
        </div>
        <div style={{ fontSize:'28px', opacity:0.7 }}>{icon}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'var(--offwhite)',
      paddingBottom:'10px', borderBottom:'1px solid var(--bf)', marginBottom:'18px' }}>
      {children}
    </h2>
  );
}

function GrowthCard({ label, value, icon }: { label:string; value:number; icon:string }) {
  return (
    <div style={{ background:'#F8F9FF', borderRadius:'12px', border:'1px solid var(--bf)', padding:'18px', textAlign:'center' }}>
      <div style={{ fontSize:'24px', marginBottom:'8px' }}>{icon}</div>
      <div style={{ fontFamily:'Cinzel,serif', fontSize:'24px', fontWeight:700, color:'var(--offwhite)' }}>{value.toLocaleString('en-IN')}</div>
      <div style={{ fontSize:'11px', color:'var(--muted)', marginTop:'4px' }}>{label}</div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('month');

  const { data, isLoading, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey:       ['analytics', period],
    queryFn:        () => analyticsApi.getDashboard(period),
    // Auto-refresh every 2.5 hours
    refetchInterval: 2.5 * 60 * 60 * 1000,
    staleTime:       60 * 60 * 1000,
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey:        ['analytics-daily', 30],
    queryFn:         () => analyticsApi.getDaily(30),
    refetchInterval: 2.5 * 60 * 60 * 1000,
    staleTime:       60 * 60 * 1000,
  });

  const lastRefreshed = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
    : null;

  const d = data as any;

  return (
    <div style={{ padding:'28px', maxWidth:'1200px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'22px', fontWeight:700, color:'var(--offwhite)', marginBottom:'4px' }}>Analytics Dashboard</h1>
          {lastRefreshed && (
            <div style={{ fontSize:'11px', color:'var(--faint)' }}>
              Last refreshed at {lastRefreshed} · Auto-refreshes every 2.5 hrs
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <button onClick={() => refetch()} disabled={isFetching}
            style={{ padding:'8px 16px', borderRadius:'50px', border:'1px solid var(--border)', background:'transparent', cursor:'pointer', fontSize:'11px', color:'var(--gold3)', fontFamily:'Raleway,sans-serif', fontWeight:600, opacity: isFetching ? 0.5 : 1 }}>
            {isFetching ? '↻ Refreshing…' : '↻ Refresh Now'}
          </button>
          <button onClick={() => exportCSV(d, period)} disabled={!d}
            style={{ padding:'8px 16px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'11px', fontFamily:'Raleway,sans-serif', fontWeight:700 }}
            className="btn-gold">
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'28px', flexWrap:'wrap' }}>
        {(['24h','week','month','all'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding:'7px 18px', borderRadius:'50px', border:'1px solid', cursor:'pointer',
            fontSize:'12px', fontWeight:600, fontFamily:'Raleway,sans-serif', transition:'all 0.15s',
            background:  period===p ? 'rgba(26,58,107,0.08)' : 'transparent',
            borderColor: period===p ? 'rgba(26,58,107,0.3)' : 'var(--bf)',
            color:       period===p ? '#1A3A6B' : 'var(--muted)',
          }}>{PERIOD_LABELS[p]}</button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--muted)', fontSize:'13px' }}>
          Loading analytics…
        </div>
      ) : !d ? null : (
        <>
          {/* ── Section 1: Platform Health ─────────────────────────────────── */}
          <SectionTitle>Platform Health</SectionTitle>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'14px', marginBottom:'36px' }}>
            <StatCard icon="👥" label="Total Users"              value={d.health.totalUsers.toLocaleString('en-IN')} />
            <StatCard icon="✅" label="Approved Profiles"         value={d.health.totalProfiles.toLocaleString('en-IN')} />
            <StatCard icon="📋" label="Active Listings"           value={d.health.activeListings.toLocaleString('en-IN')} />
            <StatCard icon="⏳" label="Profiles Pending Review"   value={d.health.pendingProfiles} highlight={d.health.pendingProfiles > 0} />
            <StatCard icon="⏳" label="Listings Pending Review"   value={d.health.pendingListings} highlight={d.health.pendingListings > 0} />
          </div>

          {/* ── Section 2: Growth ─────────────────────────────────────────── */}
          <SectionTitle>Growth — {PERIOD_LABELS[period]}</SectionTitle>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'36px' }}>
            <GrowthCard label="New Users Registered" value={d.growth.newUsers}    icon="🆕" />
            <GrowthCard label="New Profiles Submitted" value={d.growth.newProfiles} icon="📝" />
            <GrowthCard label="New Listings Posted"   value={d.growth.newListings} icon="📌" />
          </div>

          {/* ── Section 3: Moderation Activity ────────────────────────────── */}
          <SectionTitle>Moderation Activity — {PERIOD_LABELS[period]}</SectionTitle>
          <div className="gc" style={{ marginBottom:'36px', overflow:'hidden' }}>
            <table className="rt" style={{ minWidth:'500px' }}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign:'right' }}>Approved</th>
                  <th style={{ textAlign:'right' }}>Rejected</th>
                  <th style={{ textAlign:'right' }}>Total Reviewed</th>
                  <th style={{ textAlign:'right' }}>Approval Rate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label:'Profiles', approved: d.moderation.profilesApproved, rejected: d.moderation.profilesRejected },
                  { label:'Listings', approved: d.moderation.listingsApproved, rejected: d.moderation.listingsRejected },
                ].map(row => {
                  const total = row.approved + row.rejected;
                  const rate  = total > 0 ? Math.round((row.approved / total) * 100) : 0;
                  return (
                    <tr key={row.label}>
                      <td style={{ fontWeight:600 }}>{row.label}</td>
                      <td style={{ textAlign:'right', color:'var(--ok)', fontWeight:700 }}>{row.approved}</td>
                      <td style={{ textAlign:'right', color:'var(--err)', fontWeight:700 }}>{row.rejected}</td>
                      <td style={{ textAlign:'right' }}>{total}</td>
                      <td style={{ textAlign:'right' }}>
                        <span style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'10px', fontWeight:700,
                          background: rate>=80 ? 'rgba(22,163,74,0.08)' : rate>=50 ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                          color: rate>=80 ? 'var(--ok)' : rate>=50 ? 'var(--warn)' : 'var(--err)',
                        }}>{total > 0 ? `${rate}%` : '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Section 3.5: Daily Transactions ──────────────────────────── */}
          <SectionTitle>Daily Transactions (Last 30 Days)</SectionTitle>
          <div className="gc" style={{ padding:'22px', marginBottom:'36px' }}>
            {dailyLoading ? (
              <div style={{ color:'var(--faint)', fontSize:'12px', textAlign:'center', padding:'40px' }}>Loading…</div>
            ) : !dailyData || (dailyData as any[]).length === 0 ? (
              <div style={{ color:'var(--faint)', fontSize:'12px', textAlign:'center', padding:'40px' }}>No transactions in the last 30 days</div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={dailyData as any[]} margin={{ left:0, right:24, top:8, bottom:0 }}>
                  <XAxis dataKey="day" tick={{ fontSize:9, fill:'var(--muted)' }}
                    tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-IN', { day:'numeric', month:'short' })} />
                  <YAxis tick={{ fontSize:10, fill:'var(--muted)' }} />
                  <Tooltip
                    labelFormatter={(v: string) => new Date(v).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    formatter={(v: any, name: string) => [v, TXN_LABELS[name] ?? name]}
                    contentStyle={{ fontSize:'11px', borderRadius:'8px', border:'1px solid var(--border)' }}
                  />
                  <Legend wrapperStyle={{ fontSize:'10px' }} formatter={(v: string) => TXN_LABELS[v] ?? v} />
                  {Object.keys(TXN_LABELS).map(key => (
                    <Bar key={key} dataKey={key} stackId="txns" fill={TXN_COLORS[key]} radius={key === 'SIGNUP_BONUS' ? [4,4,0,0] : undefined} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Section 4: Breakdown ──────────────────────────────────────── */}
          <SectionTitle>Profile Breakdown (All Approved)</SectionTitle>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'36px' }}>
            {/* By Role */}
            <div className="gc" style={{ padding:'22px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'var(--muted)', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'1px' }}>By Role Type</div>
              {d.breakdown.byRole.length === 0 ? (
                <div style={{ color:'var(--faint)', fontSize:'12px', textAlign:'center', padding:'20px' }}>No approved profiles yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(180, d.breakdown.byRole.length * 36)}>
                  <BarChart data={d.breakdown.byRole} layout="vertical" margin={{ left:8, right:24, top:0, bottom:0 }}>
                    <XAxis type="number" tick={{ fontSize:10, fill:'var(--muted)' }} />
                    <YAxis type="category" dataKey="roleType" width={90}
                      tickFormatter={(v: string) => ROLE_LABELS[v] ?? v}
                      tick={{ fontSize:10, fill:'var(--offwhite)' }} />
                    <Tooltip formatter={(v: any) => [v, 'Profiles']} labelFormatter={(v: string) => ROLE_LABELS[v] ?? v}
                      contentStyle={{ fontSize:'11px', borderRadius:'8px', border:'1px solid var(--border)' }} />
                    <Bar dataKey="count" radius={[0,4,4,0]}>
                      {d.breakdown.byRole.map((_: any, i: number) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* By Market */}
            <div className="gc" style={{ padding:'22px' }}>
              <div style={{ fontSize:'12px', fontWeight:700, color:'var(--muted)', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'1px' }}>By Market Field</div>
              {d.breakdown.byMarket.length === 0 ? (
                <div style={{ color:'var(--faint)', fontSize:'12px', textAlign:'center', padding:'20px' }}>No approved profiles yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={d.breakdown.byMarket} margin={{ left:0, right:24, top:0, bottom:0 }}>
                      <XAxis dataKey="marketField" tickFormatter={(v: string) => MARKET_LABELS[v] ?? v} tick={{ fontSize:10, fill:'var(--offwhite)' }} />
                      <YAxis tick={{ fontSize:10, fill:'var(--muted)' }} />
                      <Tooltip formatter={(v: any) => [v, 'Profiles']} labelFormatter={(v: string) => MARKET_LABELS[v] ?? v}
                        contentStyle={{ fontSize:'11px', borderRadius:'8px', border:'1px solid var(--border)' }} />
                      <Bar dataKey="count" radius={[4,4,0,0]}>
                        {d.breakdown.byMarket.map((r: any) => (
                          <Cell key={r.marketField} fill={MARKET_COLORS[r.marketField] ?? '#1A3A6B'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display:'flex', gap:'12px', justifyContent:'center', marginTop:'10px' }}>
                    {d.breakdown.byMarket.map((r: any) => (
                      <div key={r.marketField} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'10px', color:'var(--muted)' }}>
                        <div style={{ width:'10px', height:'10px', borderRadius:'2px', background: MARKET_COLORS[r.marketField] ?? '#1A3A6B' }} />
                        {MARKET_LABELS[r.marketField] ?? r.marketField}: {r.count}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Section 5: Revenue ────────────────────────────────────────── */}
          <SectionTitle>Wallet & Revenue — {PERIOD_LABELS[period]}</SectionTitle>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'14px', marginBottom:'12px' }}>
            <StatCard icon="💰" label="Total Revenue"           value={`₹${d.revenue.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits:2 })}`} />
            <StatCard icon="📈" label="Wallet Top-Ups (₹)"     value={`₹${d.revenue.topUpRevenue.toLocaleString('en-IN', { minimumFractionDigits:2 })}`} sub={`${d.revenue.topUpCount} transactions`} />
            <StatCard icon="⭐" label="Featured Listings (₹)"  value={`₹${d.revenue.featuredRevenue.toLocaleString('en-IN', { minimumFractionDigits:2 })}`} sub={`${d.revenue.featuredCount} listings`} />
            <StatCard icon="🔓" label="Listing Unlocks"         value={d.revenue.listingUnlocks.toLocaleString('en-IN')} />
            <StatCard icon="👤" label="Profile Unlocks"         value={d.revenue.profileUnlocks.toLocaleString('en-IN')} />
          </div>
          {d.revenue.totalRevenue === 0 && (
            <p style={{ fontSize:'11px', color:'var(--faint)', marginBottom:'24px' }}>
              Revenue will appear here once payment processing is active.
            </p>
          )}
        </>
      )}
    </div>
  );
}
