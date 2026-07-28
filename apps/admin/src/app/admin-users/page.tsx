'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAdminAuthStore } from '@/store/auth.store';

const adminUsersApi = {
  list:          ()                                       => api.get('/admin-users').then(r => r.data),
  create:        (dto: any)                               => api.post('/admin-users', dto).then(r => r.data),
  update:        (id: string, dto: any)                   => api.patch(`/admin-users/${id}`, dto).then(r => r.data),
  remove:        (id: string)                             => api.delete(`/admin-users/${id}`).then(r => r.data),
  resetPassword: (id: string, newPassword: string)        => api.post(`/admin-users/${id}/reset-password`, { newPassword }).then(r => r.data),
};

const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  ADMIN:     { bg: 'rgba(220,38,38,0.08)',  color: 'var(--err)'  },
  MODERATOR: { bg: 'rgba(217,119,6,0.08)',  color: 'var(--warn)' },
};

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{ padding:'2px 9px', borderRadius:'50px', fontSize:'9px', fontWeight:700,
      background: active ? 'rgba(22,163,74,0.08)' : 'rgba(0,0,0,0.06)',
      color: active ? 'var(--ok)' : 'var(--muted)',
      border: `1px solid ${active ? 'rgba(22,163,74,0.2)' : 'var(--bf)'}` }}>
      {active ? '● Active' : '○ Inactive'}
    </span>
  );
}

export default function ManageAdminsPage() {
  const { isAdmin } = useAdminAuthStore();
  const qc = useQueryClient();

  const [showForm,       setShowForm]       = useState(false);
  const [resetTarget,    setResetTarget]    = useState<any>(null);
  const [newPassword,    setNewPassword]    = useState('');
  const [form,           setForm]           = useState({ email:'', name:'', password:'', role:'MODERATOR' });
  const [error,          setError]          = useState('');

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn:  adminUsersApi.list,
    enabled:  isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: adminUsersApi.create,
    onSuccess:  () => { qc.invalidateQueries({ queryKey:['admin-users'] }); setShowForm(false); setForm({ email:'', name:'', password:'', role:'MODERATOR' }); setError(''); },
    onError:    (e: any) => setError(e?.response?.data?.message ?? 'Failed to create'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: any) => adminUsersApi.update(id, { isActive }),
    onSuccess:  () => qc.invalidateQueries({ queryKey:['admin-users'] }),
  });

  const removeMutation = useMutation({
    mutationFn: adminUsersApi.remove,
    onSuccess:  () => qc.invalidateQueries({ queryKey:['admin-users'] }),
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, pwd }: any) => adminUsersApi.resetPassword(id, pwd),
    onSuccess:  () => { setResetTarget(null); setNewPassword(''); },
  });

  if (!isAdmin) {
    return (
      <div style={{ padding:'40px', textAlign:'center', color:'var(--muted)' }}>
        <div style={{ fontSize:'36px', marginBottom:'12px' }}>🔒</div>
        <p>Only ADMIN accounts can manage admin users.</p>
      </div>
    );
  }

  return (
    <div style={{ padding:'28px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'22px', fontWeight:700, color:'var(--offwhite)', marginBottom:'4px' }}>Manage Admins & Moderators</h1>
          <p style={{ fontSize:'12px', color:'var(--muted)' }}>Add or deactivate admin portal users. These accounts are separate from the main platform.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-gold"
          style={{ padding:'10px 20px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>
          + Add Admin/Moderator
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'16px', padding:'22px', marginBottom:'20px' }}>
          <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'var(--offwhite)', marginBottom:'16px' }}>New Admin/Moderator</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {[
              { label:'Full Name',    key:'name',     type:'text',     placeholder:'e.g. Priya Sharma'         },
              { label:'Email',        key:'email',    type:'email',    placeholder:'their@email.com'            },
              { label:'Password',     key:'password', type:'password', placeholder:'Min 8 characters'          },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'5px' }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  className="fi" />
              </div>
            ))}
            <div>
              <label style={{ fontSize:'10px', fontWeight:700, color:'var(--muted)', letterSpacing:'1px', textTransform:'uppercase', display:'block', marginBottom:'5px' }}>Role</label>
              <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))} className="fi">
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          {error && <p style={{ fontSize:'11px', color:'var(--err)', marginTop:'10px' }}>{error}</p>}
          <div style={{ display:'flex', gap:'10px', marginTop:'16px' }}>
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
              className="btn-gold" style={{ padding:'10px 20px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>
              {createMutation.isPending ? 'Creating…' : 'Create Account'}
            </button>
            <button onClick={() => { setShowForm(false); setError(''); }}
              style={{ padding:'10px 20px', borderRadius:'50px', border:'1px solid var(--bf)', background:'transparent', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div onClick={() => setResetTarget(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'16px', padding:'24px', width:'340px', border:'1px solid var(--border)' }}>
            <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'15px', fontWeight:700, color:'var(--offwhite)', marginBottom:'6px' }}>Reset Password</h3>
            <p style={{ fontSize:'12px', color:'var(--muted)', marginBottom:'14px' }}>Set a new password for <strong>{resetTarget.name}</strong></p>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)" className="fi" style={{ marginBottom:'14px' }} />
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => resetMutation.mutate({ id: resetTarget.id, pwd: newPassword })}
                disabled={newPassword.length < 8 || resetMutation.isPending}
                className="btn-gold" style={{ flex:1, padding:'10px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px' }}>
                {resetMutation.isPending ? 'Resetting…' : 'Reset Password'}
              </button>
              <button onClick={() => setResetTarget(null)}
                style={{ padding:'10px 16px', borderRadius:'50px', border:'1px solid var(--bf)', background:'transparent', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <p style={{ color:'var(--muted)', fontSize:'12px' }}>Loading…</p>
      ) : (
        <div className="gc" style={{ overflow:'hidden' }}>
          <div className="table-scroll">
            <table className="rt rt-striped" style={{ minWidth:'600px' }}>
              <thead>
                <tr>
                  <th>Name / Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(admins as any[]).map((a: any) => {
                  const rb = ROLE_BADGE[a.role] ?? ROLE_BADGE.MODERATOR;
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight:600, color:'var(--offwhite)', fontSize:'13px' }}>{a.name}</div>
                        <div style={{ fontSize:'11px', color:'var(--muted)' }}>{a.email}</div>
                      </td>
                      <td>
                        <span style={{ padding:'3px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:700, background:rb.bg, color:rb.color, border:`1px solid ${rb.color}33` }}>
                          {a.role}
                        </span>
                      </td>
                      <td><StatusBadge active={a.isActive} /></td>
                      <td style={{ fontSize:'11px', color:'var(--muted)' }}>{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                          <button onClick={() => toggleMutation.mutate({ id: a.id, isActive: !a.isActive })}
                            style={{ padding:'4px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:600, border:'1px solid var(--bf)', background:'transparent', cursor:'pointer', color:'var(--muted)' }}>
                            {a.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => setResetTarget(a)}
                            style={{ padding:'4px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:600, border:'1px solid var(--bf)', background:'transparent', cursor:'pointer', color:'var(--muted)' }}>
                            Reset Pwd
                          </button>
                          <button onClick={() => { if (confirm(`Remove ${a.name}?`)) removeMutation.mutate(a.id); }}
                            style={{ padding:'4px 10px', borderRadius:'50px', fontSize:'10px', fontWeight:600, border:'1px solid rgba(220,38,38,0.3)', background:'transparent', cursor:'pointer', color:'var(--err)' }}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(admins as any[]).length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--muted)', padding:'32px', fontSize:'12px' }}>No admin users yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
