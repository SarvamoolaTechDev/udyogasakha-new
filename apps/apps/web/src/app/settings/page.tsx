'use client';
import { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { usersApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth.store';

export default function SettingsPage() {
  const { toast }  = useToast();
  const { userName } = useAuthStore();
  const { register, handleSubmit, setValue } = useForm();

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn:  () => usersApi.getMe(),
  });

  // Pre-fill form once data loads
  useEffect(() => {
    if (!me) return;
    setValue('name',  (me as any).name  ?? '');
    setValue('phone', (me as any).phone ?? '');
    setValue('city',  (me as any).city  ?? '');
  }, [me, setValue]);

  const updateMut = useMutation({
    mutationFn: (dto: any) => usersApi.updateMe(dto),
    onSuccess:  () => toast('Account updated!', 'ok'),
    onError:    () => toast('Update failed — please try again', 'err'),
  });

  const IL = ({ children }: { children: React.ReactNode }) => (
    <label className="il">{children}</label>
  );
  const mb: React.CSSProperties = { marginBottom:'18px' };

  return (
    <section style={{ padding:'48px 4%', maxWidth:'640px', margin:'0 auto' }}>
      <h1 style={{ fontFamily:'Cinzel,serif', fontSize:'clamp(20px,3vw,32px)', fontWeight:700, color:'#fff', marginBottom:'6px' }}>
        Account <span style={{ background:'linear-gradient(135deg,var(--gold),var(--gold3))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Settings</span>
      </h1>
      <p style={{ fontSize:'13px', color:'var(--muted)', marginBottom:'32px' }}>Manage your account information.</p>

      {isLoading ? (
        <div className="gc" style={{ height:'300px', animation:'pulse 1.5s ease infinite' }} />
      ) : (
        <>
          {/* Read-only account info */}
          <div className="gc" style={{ padding:'24px', marginBottom:'18px' }}>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'16px' }}>Account Information</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              {[
                ['📧 Email',     (me as any)?.email,     'Cannot be changed'],
                ['🛡️ Roles',    ((me as any)?.roles ?? []).join(', '), ''],
                ['📅 Joined',   (me as any)?.createdAt ? new Date((me as any).createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : '—', ''],
                ['🔑 User ID',  (me as any)?.id?.slice(-8) ?? '—', 'Last 8 chars'],
              ].map(([label, value, note]) => (
                <div key={String(label)}>
                  <div style={{ fontSize:'9px', fontWeight:700, color:'var(--faint)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'3px' }}>{label}</div>
                  <div style={{ fontSize:'13px', color:'var(--offwhite)', fontWeight:500 }}>{value || '—'}</div>
                  {note && <div style={{ fontSize:'10px', color:'var(--faint)', marginTop:'2px' }}>{note}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Editable fields */}
          <div className="gc" style={{ padding:'24px' }}>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:'13px', fontWeight:700, color:'var(--gold3)', marginBottom:'16px' }}>Edit Profile</div>
            <form onSubmit={handleSubmit(d => updateMut.mutate(d))}>
              <div style={mb}>
                <IL>Full Name</IL>
                <input {...register('name')} className="fi" placeholder="Your full name" />
              </div>
              <div style={mb}>
                <IL>Mobile Number</IL>
                <input {...register('phone')} className="fi" placeholder="+91 98765 43210" />
              </div>
              <div style={mb}>
                <IL>City / Location</IL>
                <input {...register('city')} className="fi" placeholder="e.g. Bengaluru, Karnataka" />
              </div>

              <button
                type="submit"
                disabled={updateMut.isPending}
                className="btn-gold"
                style={{ padding:'11px 24px', borderRadius:'50px', border:'none', cursor:'pointer', fontSize:'12px', opacity:updateMut.isPending?0.6:1 }}
              >
                {updateMut.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </>
      )}
    </section>
  );
}
