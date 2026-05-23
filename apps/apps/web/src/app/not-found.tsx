import Link from 'next/link';
export default function NotFound() {
  return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px' }}>
      <div style={{ fontSize:'64px', marginBottom:'16px' }}>🔍</div>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(24px,4vw,48px)', fontWeight:700, color:'#fff', marginBottom:'12px' }}>
        <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>404</span> — Page Not Found
      </h1>
      <p style={{ color:'var(--muted)', fontSize:'14px', marginBottom:'28px', maxWidth:'400px', lineHeight:1.8 }}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link href="/" style={{
        padding:'12px 28px', borderRadius:'50px', textDecoration:'none', fontSize:'12px', fontWeight:700,
        background:'linear-gradient(135deg,var(--gold),var(--gold2))', color:'var(--navy)',
        boxShadow:'0 5px 20px var(--goldglow)', textTransform:'uppercase', letterSpacing:'0.8px',
      }}>
        ← Back to Home
      </Link>
    </div>
  );
}
