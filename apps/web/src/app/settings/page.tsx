'use client';
import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { usersApi, authApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

const Err = ({ msg }: { msg?: string }) =>
  msg ? <p style={{ color:'var(--err)', fontSize:'11px', marginTop:'4px' }}>{msg}</p> : null;

export default function SettingsPage() {
  const { toast } = useToast();

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

  const mb: React.CSSProperties = { marginBottom:'16px' };
  const IL = ({ children }: { children: React.ReactNode }) => <label className="il">{children}</label>;

  return (
    <section style={{ padding:'48px 4%', maxWidth:'640px', margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(20px,3vw,32px)', fontWeight:700, color:'#fff', marginBottom:'6px' }}>
        Account <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Settings</span>
      </h1>
      <p style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'32px' }}>Manage your account information and security.</p>

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
                <div style={{ fontSize:'9px', fontWeight:700, color:'var(--faint)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'3px' }}>{label}</div>
                <div style={{ fontSize:'13px', color:'var(--offwhite)', fontWeight:500 }}>{value || '—'}</div>
                {note && <div style={{ fontSize:'10px', color:'var(--faint)', marginTop:'2px' }}>{note}</div>}
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
            <input {...regPwd('currentPassword', { required:'Current password is required' })} type="password" className="fi" placeholder="••••••••" style={{ borderColor: we.currentPassword ? 'var(--err)' : undefined }} />
            <Err msg={we.currentPassword?.message} />
          </div>
          <div style={mb}>
            <IL>New Password</IL>
            <input {...regPwd('newPassword', { required:'New password is required', minLength:{ value:8, message:'Minimum 8 characters' } })} type="password" className="fi" placeholder="Minimum 8 characters" style={{ borderColor: we.newPassword ? 'var(--err)' : undefined }} />
            <Err msg={we.newPassword?.message} />
          </div>
          <div style={mb}>
            <IL>Confirm New Password</IL>
            <input {...regPwd('confirm', { required:'Please confirm your new password', validate: v => v === newPwd || 'Passwords do not match' })} type="password" className="fi" placeholder="Re-enter new password" style={{ borderColor: we.confirm ? 'var(--err)' : undefined }} />
            <Err msg={we.confirm?.message} />
          </div>
          <div style={{ borderRadius:'10px', padding:'10px 12px', marginBottom:'14px', fontSize:'11px', color:'var(--muted)', lineHeight:1.7, background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)' }}>
            ⚠️ Changing your password will log you out of all devices.
          </div>
          <button type="submit" disabled={changePwdMut.isPending} className="btn-outline" style={{ padding:'11px 24px', borderRadius:'50px', cursor:'pointer', fontSize:'12px', opacity:changePwdMut.isPending?0.6:1 }}>
            {changePwdMut.isPending ? 'Updating…' : 'Change Password'}
          </button>
        </form>
      </div>
    </section>
  );
}
