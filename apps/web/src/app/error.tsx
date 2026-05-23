'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px' }}>
      <div style={{ fontSize:'64px', marginBottom:'16px' }}>⚠️</div>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'28px', fontWeight:700, color:'#fff', marginBottom:'12px' }}>Something went wrong</h1>
      <p style={{ color:'var(--muted)', fontSize:'14px', marginBottom:'28px' }}>An unexpected error occurred. Please try again.</p>
      <button onClick={reset} style={{
        padding:'12px 28px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700,
        background:'linear-gradient(135deg,var(--gold),var(--gold2))', color:'var(--navy)',
        boxShadow:'0 5px 20px var(--goldglow)', textTransform:'uppercase', letterSpacing:'0.8px',
      }}>
        Try Again
      </button>
    </div>
  );
}
