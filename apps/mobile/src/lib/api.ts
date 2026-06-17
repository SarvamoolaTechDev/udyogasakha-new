import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

// Change to your LAN IP when testing on a physical device
// e.g. 'http://192.168.1.100:3001/api/v1'
const BASE = 'http://localhost:3001/api/v1';

export const api = axios.create({ baseURL: BASE, timeout: 15_000 });

api.interceptors.request.use(cfg => {
  const token = useAuthStore.getState().accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => {
    // Unwrap TransformInterceptor envelope { data, statusCode, timestamp }
    if (res.data && 'data' in res.data && 'statusCode' in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  async err => {
    if (err.response?.status === 401) {
      await useAuthStore.getState().clearAuth();
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login:    (dto: { email: string; password: string }) => api.post('/auth/login', dto).then(r => r.data),
  register: (dto: { email: string; password: string; name: string; phone?: string }) => api.post('/auth/register', dto).then(r => r.data),
  logout:   () => api.post('/auth/logout').then(r => r.data),
  changePassword: (dto: any) => api.post('/auth/change-password', dto).then(r => r.data),
};

export const listingsApi = {
  browse:     (params?: any)              => api.get('/listings', { params }).then(r => r.data),
  getById:    (id: string)                => api.get(`/listings/${id}`).then(r => r.data),
  getSimilar: (id: string, role: string)  => api.get(`/listings/${id}/similar`, { params: { role } }).then(r => r.data),
  post:       (dto: any)                  => api.post('/listings', dto).then(r => r.data),
  // Moderator
  getPending: (params?: any)              => api.get('/listings/pending', { params }).then(r => r.data),
  approve:    (id: string)                => api.patch(`/listings/${id}/approve`).then(r => r.data),
  reject:     (id: string, reason: string) => api.patch(`/listings/${id}/reject`, { reason }).then(r => r.data),
};

export const profilesApi = {
  upsert:       (dto: any)                => api.post('/profiles', dto).then(r => r.data),
  getMine:      ()                        => api.get('/profiles/me').then(r => r.data),
  getMineByRole:(role: string)            => api.get(`/profiles/me/${role}`).then(r => r.data),
  addExp:       (role: string, dto: any)  => api.post(`/profiles/me/${role}/experience`, dto).then(r => r.data),
  // Moderator
  getPending:   (params?: any)            => api.get('/profiles/pending', { params }).then(r => r.data),
  approve:      (id: string)              => api.patch(`/profiles/${id}/approve`).then(r => r.data),
  reject:       (id: string, reason: string) => api.patch(`/profiles/${id}/reject`, { reason }).then(r => r.data),
  reactivate:   (id: string)              => api.patch(`/profiles/${id}/reactivate`).then(r => r.data),
};

export const notificationsApi = {
  list:        (params?: any) => api.get('/notifications', { params }).then(r => r.data),
  unreadCount: ()             => api.get('/notifications/unread-count').then(r => r.data),
  markRead:    (id: string)   => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: ()             => api.patch('/notifications/read-all').then(r => r.data),
};

export const usersApi = {
  getMe:    () => api.get('/users/me').then(r => r.data),
  updateMe: (dto: any) => api.patch('/users/me', dto).then(r => r.data),
};
