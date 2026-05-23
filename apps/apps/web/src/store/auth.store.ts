import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken:     string | null;
  refreshToken:    string | null;
  isAuthenticated: boolean;
  isModerator:     boolean;
  userName:        string;
  setTokens: (t: { accessToken:string; refreshToken:string }) => void;
  clearAuth: () => void;
}

function decode(token: string): any {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); }
  catch { return {}; }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null, refreshToken: null,
      isAuthenticated: false, isModerator: false, userName: '',

      setTokens: ({ accessToken, refreshToken }) => {
        const p = decode(accessToken);
        const roles: string[] = p.roles ?? [];
        if (typeof document !== 'undefined') {
          document.cookie = `udyoga_token=${accessToken}; path=/; max-age=900; SameSite=Lax`;
        }
        set({ accessToken, refreshToken, isAuthenticated:true, isModerator: roles.some(r=>['MODERATOR','ADMIN'].includes(r)), userName: p.name ?? '' });
      },

      clearAuth: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'udyoga_token=; path=/; max-age=0';
        }
        set({ accessToken:null, refreshToken:null, isAuthenticated:false, isModerator:false, userName:'' });
      },
    }),
    { name: 'udyoga_auth' },
  ),
);
