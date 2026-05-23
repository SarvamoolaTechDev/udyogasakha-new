'use client';

interface SkeletonProps {
  height?: string | number;
  width?:  string | number;
  radius?: string | number;
  style?:  React.CSSProperties;
}

const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
`;

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(212,160,23,0.07) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '600px 100%',
  animation: 'shimmer 1.6s infinite linear',
  borderRadius: '10px',
};

export function Skeleton({ height = '18px', width = '100%', radius = '10px', style }: SkeletonProps) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ height, width, borderRadius: radius, ...shimmerStyle, ...style }} />
    </>
  );
}

/** Full gold-card skeleton — matches .gc height/padding for job cards, profile cards etc. */
export function SkeletonCard({ height = '260px' }: { height?: string }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{
        height,
        borderRadius: '18px',
        border: '1px solid var(--border)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'linear-gradient(160deg,rgba(13,30,90,0.6),rgba(6,13,42,0.7))',
      }}>
        {/* Icon + title row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, ...shimmerStyle }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '10px', width: '50%', ...shimmerStyle }} />
            <div style={{ height: '14px', width: '80%', ...shimmerStyle }} />
          </div>
        </div>
        {/* Meta row */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ height: '10px', width: '30%', ...shimmerStyle }} />
          <div style={{ height: '10px', width: '25%', ...shimmerStyle }} />
        </div>
        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[40, 55, 45].map(w => (
            <div key={w} style={{ height: '18px', width: `${w}px`, borderRadius: '50px', ...shimmerStyle }} />
          ))}
        </div>
        {/* Description lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div style={{ height: '10px', width: '100%', ...shimmerStyle }} />
          <div style={{ height: '10px', width: '90%',  ...shimmerStyle }} />
          <div style={{ height: '10px', width: '70%',  ...shimmerStyle }} />
        </div>
        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(212,160,23,0.08)' }}>
          <div style={{ height: '14px', width: '35%', ...shimmerStyle }} />
          <div style={{ height: '28px', width: '90px', borderRadius: '50px', ...shimmerStyle }} />
        </div>
      </div>
    </>
  );
}

/** Skeleton for a table row */
export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <>
      <style>{shimmer}</style>
      <tr>
        {Array.from({ length: cols }).map((_, i) => (
          <td key={i} style={{ padding: '12px 14px' }}>
            <div style={{ height: '12px', width: i === 0 ? '70%' : '50%', ...shimmerStyle }} />
          </td>
        ))}
      </tr>
    </>
  );
}

/** Skeleton for a profile detail card in the sidebar */
export function SkeletonProfileCard() {
  return (
    <>
      <style>{shimmer}</style>
      <div className="gc" style={{ overflow: 'hidden', marginBottom: '18px' }}>
        <div style={{ height: '90px', ...shimmerStyle, borderRadius: 0 }} />
        <div style={{ padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ height: '18px', width: '55%', ...shimmerStyle }} />
          <div style={{ height: '12px', width: '35%', ...shimmerStyle }} />
          <div style={{ height: '6px', width: '100%', borderRadius: '50px', ...shimmerStyle }} />
          <div style={{ height: '24px', width: '160px', borderRadius: '50px', ...shimmerStyle }} />
        </div>
      </div>
    </>
  );
}
