'use client';
import { useEffect, useRef } from 'react';

interface Bubble {
  x: number; y: number; r: number; s: number;
  op: number; d: number; c: 'g' | 'b'; w: number; ws: number;
}

export function BubbleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let bubs: Bubble[] = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const mkb = (): Bubble => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 200,
      r: Math.random() * 22 + 4,
      s: Math.random() * 0.42 + 0.14,
      op: Math.random() * 0.13 + 0.03,
      d: (Math.random() - 0.5) * 0.4,
      c: Math.random() > 0.5 ? 'g' : 'b',
      w: Math.random() * Math.PI * 2,
      ws: Math.random() * 0.02 + 0.005,
    });

    for (let i = 0; i < 48; i++) { const b = mkb(); b.y = Math.random() * canvas.height; bubs.push(b); }

    const draw = (b: Bubble) => {
      const g = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.05, b.x, b.y, b.r);
      if (b.c === 'g') {
        g.addColorStop(0, `rgba(245,208,122,${b.op * 1.5})`);
        g.addColorStop(0.5, `rgba(212,160,23,${b.op})`);
        g.addColorStop(1, `rgba(180,120,10,${b.op * 0.3})`);
      } else {
        g.addColorStop(0, `rgba(100,150,255,${b.op * 1.2})`);
        g.addColorStop(0.5, `rgba(45,107,228,${b.op})`);
        g.addColorStop(1, `rgba(10,30,100,${b.op * 0.3})`);
      }
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = b.c === 'g' ? `rgba(245,208,122,${b.op * 0.8})` : `rgba(100,160,255,${b.op * 0.5})`;
      ctx.lineWidth = 0.7; ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.32, b.r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = b.c === 'g' ? `rgba(255,240,180,${b.op * 1.2})` : `rgba(180,210,255,${b.op * 0.9})`;
      ctx.fill();
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubs.forEach(b => {
        b.y -= b.s; b.w += b.ws; b.x += Math.sin(b.w) * 0.4 + b.d;
        draw(b);
        if (b.y + b.r < 0) Object.assign(b, mkb());
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={ref} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} />
  );
}
