import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const api = axios.create({ baseURL: BASE, timeout: 15_000 });

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = useAuthStore.getState().accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Unwrap TransformInterceptor envelope { data, statusCode, timestamp }
api.interceptors.response.use(
  res => {
    if (res.data && typeof res.data === 'object' && 'data' in res.data && 'statusCode' in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ── Auth ───────────────────────────────────────────────────────────────────────
export const authApi = {
  register:       (dto: any)  => api.post('/auth/register', dto).then(r => r.data),
  login:          (dto: any)  => api.post('/auth/login', dto).then(r => r.data),
  logout:         ()          => api.post('/auth/logout').then(r => r.data),
  changePassword: (dto: any)  => api.post('/auth/change-password', dto).then(r => r.data),
};

// ── Users ──────────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe:    ()               => api.get('/users/me').then(r => r.data),
  updateMe: (dto: any)       => api.patch('/users/me', dto).then(r => r.data),
  // Admin only
  list:     (params?: any)   => api.get('/users', { params }).then(r => r.data),
  getById:  (id: string)     => api.get(`/users/${id}`).then(r => r.data),
};

// ── Listings ───────────────────────────────────────────────────────────────────
export const listingsApi = {
  browse:    (params?: any)              => api.get('/listings', { params }).then(r => r.data),
  getById:   (id: string)                => api.get(`/listings/${id}`).then(r => r.data),
  getSimilar:(id: string, role: string)  => api.get(`/listings/${id}/similar`, { params: { role } }).then(r => r.data),
  post:      (dto: any)                  => api.post('/listings', dto).then(r => r.data),
  update:    (id: string, dto: any)      => api.patch(`/listings/${id}`, dto).then(r => r.data),
  // Moderator
  getPending:(params?: any)              => api.get('/listings/pending', { params }).then(r => r.data),
  approve:   (id: string)                => api.patch(`/listings/${id}/approve`).then(r => r.data),
  reject:    (id: string, reason:string) => api.patch(`/listings/${id}/reject`, { reason }).then(r => r.data),
};

// ── Profiles ───────────────────────────────────────────────────────────────────
export const profilesApi = {
  upsert:       (dto: any)                          => api.post('/profiles', dto).then(r => r.data),
  getMine:      ()                                  => api.get('/profiles/me').then(r => r.data),
  getMineByRole:(role: string)                      => api.get(`/profiles/me/${role}`).then(r => r.data),
  addExp:       (role: string, dto: any)            => api.post(`/profiles/me/${role}/experience`, dto).then(r => r.data),
  deleteExp:    (id: string)                        => api.delete(`/profiles/experience/${id}`).then(r => r.data),
  // Moderator
  getPending:   (params?: any)                      => api.get('/profiles/pending', { params }).then(r => r.data),
  getApproved:  (params?: any)                      => api.get('/profiles/approved', { params }).then(r => r.data),
  getRejected:  (params?: any)                      => api.get('/profiles/rejected', { params }).then(r => r.data),
  approve:      (id: string, marketField: string)   => api.patch(`/profiles/${id}/approve`, { marketField }).then(r => r.data),
  reject:       (id: string, reason: string)        => api.patch(`/profiles/${id}/reject`, { reason }).then(r => r.data),
  reactivate:   (id: string)                        => api.patch(`/profiles/${id}/reactivate`).then(r => r.data),
};

// ── Documents ──────────────────────────────────────────────────────────────────
export const docsApi = {
  upload: (profileId: string, documentType: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    form.append('documentType', documentType);
    return api.post(`/documents/${profileId}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  getForProfile: (profileId: string) => api.get(`/documents/${profileId}`).then(r => r.data),
  delete:        (docId: string)     => api.delete(`/documents/${docId}`).then(r => r.data),
};

// ── Market ─────────────────────────────────────────────────────────────────────
export const marketApi = {
  getStats:      ()            => api.get('/market/stats').then(r => r.data),
  getByRole:     ()            => api.get('/market/by-role').then(r => r.data),
  getAllApproved: (params?: any) => api.get('/market/all-approved', { params }).then(r => r.data),
};

// ── Notifications ──────────────────────────────────────────────────────────────
export const notificationsApi = {
  list:         (params?: { unread?: boolean; page?: number; limit?: number }) => api.get('/notifications', { params }).then(r => r.data),
  unreadCount:  ()            => api.get('/notifications/unread-count').then(r => r.data),
  markRead:     (id: string)  => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead:  ()            => api.patch('/notifications/read-all').then(r => r.data),
};

// ── Audit (admin) ──────────────────────────────────────────────────────────────
export const auditApi = {
  recent:       (params?: any)                          => api.get('/audit/recent', { params }).then(r => r.data),
  forEntity:    (type: string, id: string, p?: any)     => api.get(`/audit/entity/${type}/${id}`, { params: p }).then(r => r.data),
  forActor:     (actorId: string, p?: any)              => api.get(`/audit/actor/${actorId}`, { params: p }).then(r => r.data),
};
