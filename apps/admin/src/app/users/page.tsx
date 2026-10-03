'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAdminAuthStore } from '@/store/auth.store';
import { SkeletonRow } from '@/components/ui/Skeleton';

const ROLE_STYLE: Record<string,{ bg:string; color:string }> = {
  ADMIN:       { bg:'rgba(255,107,107,0.12)', color:'var(--err)'  },
  MODERATOR:   { bg:'rgba(96,165,250,0.12)',  color:'var(--info)' },
  PARTICIPANT: { bg:'rgba(212,160,23,0.08)',  color:'var(--gold3)'},
};

const PROFILE_STATUS_STYLE: Record<string,{ bg:string; color:string; label:string }> = {
  PENDING:  { bg:'rgba(245,158,11,0.1)',  color:'var(--warn)', label:'Pending'  },
  APPROVED: { bg:'rgba(74,222,128,0.1)',  color:'var(--ok)',   label:'Approved' },
  REJECTED: { bg:'rgba(255,107,107,0.1)', color:'var(--err)',  label:'Rejected' },
};

const ROLE_LABELS: Record<string,string> = {
  INTERN:'Intern', FRESHER:'Fresher', JOB_SEEKER:'Job Seeker', CONSULTANT:'Consultant',
  HIRING_MANAGER:'Hiring Manager', RECRUITER:'Recruiter', TRAINER:'Trainer',
  VENDOR:'Vendor', RFP_PROVIDER:'RFP Provider',
};

export default function AdminUsersPage() {
  const { isAdmin } = useAdminAuthStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [query,  setQuery]  = useState('');
  const [page,   setPage]   = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [viewUser,   setViewUser]   = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [confirmEmail, setConfirmEmail] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', query, page],
    queryFn:  () => usersApi.list({ search: query || undefined, page, limit: 25 }),
    placeholderData: (prev: any) => prev,
  });

  const { data: fullUser, isLoading: fullUserLoading } = useQuery({
    queryKey: ['admin-user-detail', viewUser?.id],
    queryFn:  () => usersApi.getById(viewUser.id),
    enabled:  !!viewUser,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.deleteByAdmin(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteUser(null);
      setConfirmEmail('');
    },
  });

  const users: any[]  = (data as any)?.data      ?? [];
  const total: number = (data as any)?.total      ?? 0;
  const totalPages    = (data as any)?.totalPages ?? 1;

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setQuery(v); setPage(1); }, 400);
  };

  const closeMenu = () => setMenuOpenId(null);

  return (
    <div style={{ padding:'28px' }} onClick={closeMenu}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'22px', fontWeight:700, color:'var(--offwhite)', margin:0 }}>User Management</h1>
          <p style={{ fontSize:'12px', color:'var(--muted)', marginTop:'4px' }}>{total} registered users</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', borderRadius:'50px', padding:'9px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--bf)' }}>
          <span style={{ fontSize:'13px', color:'var(--faint)' }}>🔍</span>
          <input value={search} onChange={e=>handleSearch(e.target.value)} placeholder="Search by name, email or phone…"
            style={{ background:'transparent', border:'none', outline:'none', color:'var(--offwhite)', fontSize:'12px', width:'220px', fontFamily:'Raleway,sans-serif' }} />
        </div>
      </div>

      <div className="gc" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="rt">
            <thead>
              <tr>{['Name & Email','Phone','City','Roles','Profiles','Joined',''].map(h=><th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length:8 }).map((_,i)=><SkeletonRow key={i} cols={7} />)
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'32px', color:'var(--muted)' }}>No users found.</td></tr>
              ) : (
                users.map((u:any)=>(
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight:600, color:'var(--offwhite)' }}>{u.name}</div>
                      <div style={{ fontSize:'12px',fontWeight:400,  color:'var(--muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ fontSize:'12px', fontWeight: 500, color:'var(--muted)' }}>{u.phone||'—'}</td>
                    <td style={{ fontSize:'12px', fontWeight: 500, color:'var(--muted)' }}>{u.city||'—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                        {(u.roles??[]).map((r:string)=>{ const s=ROLE_STYLE[r]??{ bg:'rgba(255,255,255,0.05)', color:'var(--muted)' }; return <span key={r} style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:s.bg, color:s.color }}>{r}</span>; })}
                      </div>
                    </td>
                    <td style={{ fontSize:'12px', fontWeight: 400, color:'var(--muted)', textAlign:'center' }}>{u.profiles?.length??'—'}</td>
                    <td style={{ fontSize:'12px', fontWeight: 400, color:'var(--muted)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' }) : '—'}</td>
                    <td style={{ position:'relative' }}>
                      {u.email === 'admin@sarvamoola.in' ? (
                        <span style={{ fontSize:'10px', color:'var(--faint)', fontStyle:'italic' }}>Platform Admin</span>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === u.id ? null : u.id); }}
                            style={{ background:'transparent', border:'1px solid var(--bf)', borderRadius:'8px', width:'28px', height:'28px', cursor:'pointer', color:'var(--muted)', fontSize:'14px', lineHeight:1 }}
                          >
                            ⋮
                          </button>
                          {menuOpenId === u.id && (
                            <div onClick={(e) => e.stopPropagation()} style={{
                              position:'absolute', right:0, top:'32px', zIndex:50,
                              background:'#fff', border:'1px solid var(--border)', borderRadius:'10px',
                              boxShadow:'0 8px 24px rgba(0,0,0,0.15)', minWidth:'160px', overflow:'hidden',
                            }}>
                              <button
                                onClick={() => { setViewUser(u); closeMenu(); }}
                                style={{ display:'block', width:'100%', textAlign:'left', padding:'10px 14px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--offwhite)' }}
                              >
                                View Account Details
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => { setDeleteUser(u); closeMenu(); }}
                                  style={{ display:'block', width:'100%', textAlign:'left', padding:'10px 14px', background:'transparent', border:'none', borderTop:'1px solid var(--bf)', cursor:'pointer', fontSize:'12px', color:'var(--err)' }}
                                >
                                  Delete Account
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', borderTop:'1px solid var(--bf)' }}>
            <span style={{ fontSize:'11px', color:'var(--muted)' }}>{total} users · page {page} of {totalPages}</span>
            <div style={{ display:'flex', gap:'6px' }}>
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ padding:'5px 12px', borderRadius:'8px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'11px', opacity:page===1?0.4:1 }}>← Prev</button>
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} style={{ padding:'5px 12px', borderRadius:'8px', border:'1px solid var(--bf)', background:'transparent', color:'var(--muted)', cursor:'pointer', fontSize:'11px', opacity:page===totalPages?0.4:1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* View Account Details popup */}
      {viewUser && (
        <div onClick={() => setViewUser(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'18px', border:'1px solid var(--border)', padding:'28px', maxWidth:'480px', width:'100%', maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'18px' }}>
              <div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:'18px', fontWeight:700, color:'var(--offwhite)' }}>{viewUser.name}</div>
                <div style={{ fontSize:'12px', color:'var(--muted)' }}>{viewUser.email}</div>
              </div>
              <button onClick={() => setViewUser(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:'var(--muted)' }}>✕</button>
            </div>

            {fullUserLoading ? (
              <div style={{ textAlign:'center', padding:'30px', color:'var(--muted)', fontSize:'13px' }}>Loading…</div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px', fontSize:'13px' }}>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight: 300, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px' }}>Phone</div>
                    <div style={{ color:'var(--offwhite)', fontWeight:500 }}>{(fullUser as any)?.phone || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:'13px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px' }}>City</div>
                    <div style={{ color:'var(--offwhite)', fontWeight:500 }}>{(fullUser as any)?.city || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:'10px', color:'var(--faint)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px' }}>Joined</div>
                    <div style={{ color:'var(--offwhite)', fontWeight:500 }}>
                      {(fullUser as any)?.createdAt ? new Date((fullUser as any).createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' }) : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:'13px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'2px' }}>System Role</div>
                    <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                      {((fullUser as any)?.roles ?? []).map((r:string) => {
                        const s = ROLE_STYLE[r] ?? { bg:'rgba(255,255,255,0.05)', color:'var(--muted)' };
                        return <span key={r} style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:s.bg, color:s.color }}>{r}</span>;
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize:'11px', fontWeight:700, color:'var(--gold3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px', paddingTop:'14px', borderTop:'1px solid var(--bf)' }}>
                  Profiles ({(fullUser as any)?.profiles?.length ?? 0})
                </div>
                {((fullUser as any)?.profiles ?? []).length === 0 ? (
                  <p style={{ fontSize:'12px', color:'var(--muted)' }}>No profiles created yet.</p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                    {((fullUser as any)?.profiles ?? []).map((p: any, i: number) => {
                      const st = PROFILE_STATUS_STYLE[p.status] ?? PROFILE_STATUS_STYLE.PENDING;
                      return (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:'8px', background:'rgba(200,146,10,0.03)', border:'1px solid var(--bf)' }}>
                          <span style={{ fontSize:'12px', color:'var(--offwhite)', fontWeight:600 }}>{ROLE_LABELS[p.roleType] ?? p.roleType}</span>
                          <span style={{ padding:'2px 8px', borderRadius:'50px', fontSize:'9px', fontWeight:700, background:st.bg, color:st.color }}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            <button onClick={() => setViewUser(null)} style={{ width:'100%', marginTop:'20px', padding:'10px', borderRadius:'50px', border:'1px solid', background:'transparent', cursor:'pointer', fontSize:'12px', fontWeight: 400, color:'var(--offwhite)' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Account confirmation popup */}
      {deleteUser && (
        <div onClick={() => { setDeleteUser(null); setConfirmEmail(''); }} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'18px', border:'1px solid rgba(220,38,38,0.3)', padding:'28px', maxWidth:'420px', width:'100%' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px', textAlign:'center' }}>⚠️</div>
            <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'var(--offwhite)', marginBottom:'10px', textAlign:'center' }}>
              Delete This Account?
            </h3>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.75, marginBottom:'16px', textAlign:'center' }}>
              This permanently removes <strong>{deleteUser.name}</strong>'s account, all their profiles, wallet balance, listings, ads, and activity. This cannot be undone.
            </p>
            <label style={{ fontSize:'11px', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'6px' }}>
              Type the user's email to confirm: <span style={{ color:'var(--offwhite)' }}>{deleteUser.email}</span>
            </label>
            <input
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
              placeholder="Enter email to confirm"
              style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'1px solid var(--bf)', fontSize:'13px', marginBottom:'18px', boxSizing:'border-box' }}
            />
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <button
                disabled={confirmEmail !== deleteUser.email || deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteUser.id)}
                style={{
                  padding:'12px', borderRadius:'50px', border:'none', cursor: confirmEmail === deleteUser.email ? 'pointer' : 'not-allowed',
                  fontSize:'12px', fontFamily:'Raleway,sans-serif', fontWeight:700, color:'#fff',
                  background: confirmEmail === deleteUser.email ? 'var(--err)' : 'rgba(220,38,38,0.3)',
                }}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete This Account'}
              </button>
              <button onClick={() => { setDeleteUser(null); setConfirmEmail(''); }} style={{ padding:'10px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}