'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast { id: string; msg: string; type: 'ok' | 'err' | 'info'; }
interface ToastCtx { toast: (msg: string, type?: 'ok' | 'err' | 'info') => void; }

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, type: 'ok' | 'err' | 'info' = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setList(p => [...p, { id, msg, type }]);
    setTimeout(() => setList(p => p.filter(t => t.id !== id)), 3400);
  }, []);

  const icon = (t: Toast) => t.type === 'err' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '✦';
  const col  = (t: Toast) => t.type === 'err' ? 'var(--err)' : t.type === 'info' ? 'var(--info)' : 'var(--gold2)';

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div style={{ position:'fixed', bottom:'26px', left:'50%', transform:'translateX(-50%)', zIndex:9999, display:'flex', flexDirection:'column', gap:'8px', alignItems:'center', pointerEvents:'none' }}>
        {list.map(t => (
          <div key={t.id} style={{
            display:'flex', alignItems:'center', gap:'9px',
            padding:'11px 22px', borderRadius:'50px', fontSize:'13px', fontWeight:600,
            color:'#fff', whiteSpace:'nowrap', pointerEvents:'auto',
            background:'linear-gradient(135deg,rgba(13,30,90,0.98),rgba(6,13,42,0.99))',
            border:`1px solid ${col(t)}`, boxShadow:'0 12px 40px rgba(0,0,0,0.6)',
            fontFamily:'Raleway,sans-serif',
          }}>
            <span>{icon(t)}</span>
            <span style={{ color: col(t) }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
