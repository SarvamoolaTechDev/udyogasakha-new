import axios from 'axios';
import { useAdminAuthStore } from '@/store/auth.store';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const api = axios.create({ baseURL: BASE, timeout: 15_000 });

api.interceptors.request.use(cfg => {
  const token = useAdminAuthStore.getState().accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => {
    if (res.data && typeof res.data === 'object' && 'data' in res.data && 'statusCode' in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  err => {
    if (err.response?.status === 401) {
      useAdminAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (dto: any) => api.post('/auth/login', dto).then(r => r.data),
};

export const profilesApi = {
  getPending:  (params?: any) => api.get('/profiles/pending',  { params }).then(r => r.data),
  getApproved: (params?: any) => api.get('/profiles/approved', { params }).then(r => r.data),
  getRejected: (params?: any) => api.get('/profiles/rejected', { params }).then(r => r.data),
  approve:     (id: string)               => api.patch(`/profiles/${id}/approve`).then(r => r.data),
  reject:      (id: string, reason: string) => api.patch(`/profiles/${id}/reject`, { reason }).then(r => r.data),
  reactivate:  (id: string)               => api.patch(`/profiles/${id}/reactivate`).then(r => r.data),
};

export const listingsApi = {
  getPending: (params?: any)              => api.get('/listings/pending', { params }).then(r => r.data),
  approve:    (id: string)                => api.patch(`/listings/${id}/approve`).then(r => r.data),
  reject:     (id: string, reason: string) => api.patch(`/listings/${id}/reject`, { reason }).then(r => r.data),
};

export const marketApi = {
  getStats:      () => api.get('/market/stats').then(r => r.data),
  getByRole:     () => api.get('/market/by-role').then(r => r.data),
  getAllApproved: (params?: any) => api.get('/market/all-approved', { params }).then(r => r.data),
};

export const usersApi = {
  list:    (params?: any) => api.get('/users',    { params }).then(r => r.data),
  getById: (id: string)   => api.get(`/users/${id}`).then(r => r.data),
};

export const auditApi = {
  recent:    (params?: any)                       => api.get('/audit/recent', { params }).then(r => r.data),
  forEntity: (type: string, id: string, p?: any)  => api.get(`/audit/entity/${type}/${id}`, { params: p }).then(r => r.data),
  forActor:  (actorId: string, p?: any)           => api.get(`/audit/actor/${actorId}`, { params: p }).then(r => r.data),
};
