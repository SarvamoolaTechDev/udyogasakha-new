'use client';
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { usersApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/components/ui/Toast';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Skeleton } from '@/components/ui/Skeleton';

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{msg}</p> : null;

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const { data: me, isLoading } = useQuery({ queryKey:['me'], queryFn: usersApi.getMe });

  // Profile form
  const { register: regProfile, handleSubmit: handleProfile, setValue, formState: { errors: pe } } = useForm<{ name:string; phone:string; city:string }>();
  useEffect(() => {
    if (!me) return;
    setValue('name',  (me as any).name  ?? '');
    setValue('phone', (me as any).phone ?? '');
    setValue('city',  (me as any).city  ?? '');
  }, [me, setValue]);

  const updateMut = useMutation({
    mutationFn: (dto: any) => usersApi.updateMe(dto),
    onSuccess: () => toast('Account updated!', 'ok'),
    onError:   () => toast('Update failed — please try again', 'err'),
  });

  // Change password form
  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, watch, formState: { errors: we } } = useForm<{ currentPassword:string; newPassword:string; confirm:string }>();
  const newPwd = watch('newPassword');

  const changePwdMut = useMutation({
    mutationFn: ({ currentPassword, newPassword }: any) =>
      authApi.changePassword?.({ currentPassword, newPassword }) ?? Promise.reject('Not implemented'),
    onSuccess: () => { toast('Password changed. Please log in again.', 'ok'); resetPwd(); },
    onError:   (e: any) => toast(e?.response?.data?.message ?? 'Change failed', 'err'),
  });

  const deleteAccountMut = useMutation({
    mutationFn: (password: string) => usersApi.deleteMe(password),
    onSuccess: () => {
      clearAuth();
      router.push('/');
    },
    onError: (e: any) => setDeleteError(e?.response?.data?.message ?? 'Incorrect password'),
  });

  const mb: React.CSSProperties = { marginBottom:'16px' };
  const IL = ({ children }: { children: React.ReactNode }) => <label className="il">{children}</label>;

  return (
    <section style={{ padding:'48px 4%', maxWidth:'640px', margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(20px,3vw,32px)', fontWeight:700, color:'#fff', marginBottom:'6px' }}>
        Account <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Settings</span>
      </h1>
      <p style={{ fontSize:'13px', color:'var(--offwhite)', fontWeight:700, marginBottom:'32px' }}>Manage your account information and security.</p>

      {/* Account info (read-only) */}
      {isLoading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'18px' }}>
          <Skeleton height="80px" style={{ borderRadius:'18px' }} />
        </div>
      ) : (
        <div className="gc" style={{ padding:'24px', marginBottom:'18px' }}>
          <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'16px' }}>Account Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            {[
              ['📧 Email',    (me as any)?.email,    'Cannot be changed'],
              ['🛡️ Roles',   ((me as any)?.roles ?? []).join(', '), ''],
              ['📅 Joined',  (me as any)?.createdAt ? new Date((me as any).createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'long', year:'numeric' }) : '—', ''],
              ['🔑 User ID', (me as any)?.id?.slice(-8) ?? '—', 'Last 8 chars'],
            ].map(([label, value, note]) => (
              <div key={String(label)}>
                <div style={{ fontSize:'10px', fontWeight:700, color:'var(--faint)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'3px' }}>{label}</div>
                <div style={{ fontSize:'13px', color:'var(--offwhite)', fontWeight:500 }}>{value || '—'}</div>
                {note && <div style={{ fontSize:'10px', color:'var(--muted)', marginTop:'2px' }}>{note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit profile */}
      <div className="gc" style={{ padding:'24px', marginBottom:'18px' }}>
        <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'16px' }}>Edit Profile</div>
        <form onSubmit={handleProfile(d => updateMut.mutate(d))}>
          <div style={mb}>
            <IL>Full Name</IL>
            <input {...regProfile('name', { required:'Name is required', maxLength:{ value:100, message:'Too long' } })} className="fi" placeholder="Your full name" style={{ borderColor: pe.name ? 'var(--err)' : undefined }} />
            <Err msg={pe.name?.message} />
          </div>
          <div style={mb}>
            <IL>Mobile Number</IL>
            <input {...regProfile('phone', { maxLength:{ value:20, message:'Too long' } })} className="fi" placeholder="+91 98765 43210" style={{ borderColor: pe.phone ? 'var(--err)' : undefined }} />
            <Err msg={pe.phone?.message} />
          </div>
          <div style={mb}>
            <IL>City / Location</IL>
            <input {...regProfile('city', { maxLength:{ value:100, message:'Too long' } })} className="fi" placeholder="e.g. Bengaluru, Karnataka" style={{ borderColor: pe.city ? 'var(--err)' : undefined }} />
            <Err msg={pe.city?.message} />
          </div>
          <button type="submit" disabled={updateMut.isPending} className="btn-gold" style={{ padding:'11px 24px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', opacity:updateMut.isPending?0.6:1 }}>
            {updateMut.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="gc" style={{ padding:'24px' }}>
        <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'16px' }}>Change Password</div>
        <form onSubmit={handlePwd(({ currentPassword, newPassword }) => changePwdMut.mutate({ currentPassword, newPassword }))}>
          <div style={mb}>
            <IL>Current Password</IL>
            <PasswordInput {...regPwd('currentPassword', { required:'Current password is required' })} className="fi" placeholder="••••••••" style={{ borderColor: we.currentPassword ? 'var(--err)' : undefined }} />
            <Err msg={we.currentPassword?.message} />
          </div>
          <div style={mb}>
            <IL>New Password</IL>
            <PasswordInput {...regPwd('newPassword', { required:'New password is required', minLength:{ value:8, message:'Minimum 8 characters' } })} className="fi" placeholder="Minimum 8 characters" style={{ borderColor: we.newPassword ? 'var(--err)' : undefined }} />
            <Err msg={we.newPassword?.message} />
          </div>
          <div style={mb}>
            <IL>Confirm New Password</IL>
            <PasswordInput {...regPwd('confirm', { required:'Please confirm your new password', validate: v => v === newPwd || 'Passwords do not match' })} className="fi" placeholder="Re-enter new password" style={{ borderColor: we.confirm ? 'var(--err)' : undefined }} />
            <Err msg={we.confirm?.message} />
          </div>
          <div style={{ borderRadius:'10px', padding:'10px 12px', marginBottom:'14px', fontSize:'13px', fontWeight:400, color:'var(--offwhite)', lineHeight:1.7, background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)' }}>
            ⚠️ Changing your password will log you out of all devices.
          </div>
          <button type="submit" disabled={changePwdMut.isPending} className="btn-gold" style={{ padding:'11px 24px', borderRadius:'50px', cursor:'pointer', fontSize:'12px', opacity:changePwdMut.isPending?0.6:1 }}>
            {changePwdMut.isPending ? 'Updating…' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div style={{ marginTop:'18px', borderRadius:'18px', border:'1px solid rgba(220,38,38,0.25)', overflow:'hidden' }}>
        <div style={{ padding:'24px' }}>
          {/*<div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--err)', marginBottom:'6px' }}>Danger Zone</div>*/}
          <p style={{ fontSize:'13px', fontWeight: 500, color:'var(--muted)', lineHeight:1.7, marginBottom:'16px' }}>
            Permanently delete your account, all your profiles, wallet balance, and activity. This cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteAccount(true)}
            style={{ padding:'10px 22px', borderRadius:'50px', border:'1px solid rgba(220,38,38,0.4)', background:'transparent', color:'var(--err)', cursor:'pointer', fontSize:'12px', fontFamily:'Raleway,sans-serif', fontWeight:700 }}
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* Delete account confirmation */}
      {showDeleteAccount && (
        <div onClick={() => { setShowDeleteAccount(false); setDeletePassword(''); setDeleteError(''); }} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'18px', border:'1px solid rgba(220,38,38,0.3)', padding:'28px', maxWidth:'420px', width:'100%' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px', textAlign:'center' }}>⚠️</div>
            <h3 style={{ fontFamily:'Cinzel,serif', fontSize:'17px', fontWeight:700, color:'var(--offwhite)', marginBottom:'10px', textAlign:'center' }}>
              Delete your account permanently?
            </h3>
            <p style={{ fontSize:'13px', color:'var(--muted)', lineHeight:1.75, marginBottom:'18px', textAlign:'center' }}>
              This removes every profile, your wallet balance, and all activity. This cannot be undone.
            </p>
            <label style={{ fontSize:'11px', fontWeight:700, color:'var(--muted)', display:'block', marginBottom:'6px' }}>
              Enter your password to confirm
            </label>
            <PasswordInput
              value={deletePassword}
              onChange={(e: any) => { setDeletePassword(e.target.value); setDeleteError(''); }}
              className="fi"
              placeholder="••••••••"
              style={{ borderColor: deleteError ? 'var(--err)' : undefined }}
            />
            {deleteError && <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{deleteError}</p>}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginTop:'18px' }}>
              <button
                disabled={!deletePassword || deleteAccountMut.isPending}
                onClick={() => deleteAccountMut.mutate(deletePassword)}
                style={{
                  padding:'12px', borderRadius:'50px', border:'none', cursor: deletePassword ? 'pointer' : 'not-allowed',
                  fontSize:'12px', fontFamily:'Raleway,sans-serif', fontWeight:700, color:'#fff',
                  background: deletePassword ? 'var(--err)' : 'rgba(220,38,38,0.3)',
                }}
              >
                {deleteAccountMut.isPending ? 'Deleting…' : 'Yes, Delete My Account'}
              </button>
              <button onClick={() => { setShowDeleteAccount(false); setDeletePassword(''); setDeleteError(''); }} style={{ padding:'10px', background:'transparent', border:'none', cursor:'pointer', fontSize:'12px', color:'var(--muted)' }}>
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
