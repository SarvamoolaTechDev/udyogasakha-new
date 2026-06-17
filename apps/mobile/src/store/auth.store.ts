import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';

interface JwtPayload { sub: string; roles: string[]; exp: number; }

interface AuthState {
  accessToken:     string | null;
  userId:          string | null;
  roles:           string[];
  isAuthenticated: boolean;
  isModerator:     boolean;
  hydrated:        boolean;
  setTokens: (t: { accessToken: string; refreshToken: string }) => Promise<void>;
  clearAuth:  () => Promise<void>;
  hydrate:    () => Promise<void>;
}

function decode(token: string): { userId: string; roles: string[]; isModerator: boolean } | null {
  try {
    const p = jwtDecode<JwtPayload>(token);
    if (Date.now() / 1000 > p.exp) return null;
    const roles = p.roles ?? [];
    return { userId: p.sub, roles, isModerator: roles.includes('MODERATOR') || roles.includes('ADMIN') };
  } catch { return null; }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken:     null,
  userId:          null,
  roles:           [],
  isAuthenticated: false,
  isModerator:     false,
  hydrated:        false,

  setTokens: async ({ accessToken, refreshToken }) => {
    const d = decode(accessToken);
    if (!d) return;
    await SecureStore.setItemAsync('access_token',  accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
    set({ accessToken, ...d, isAuthenticated: true });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ accessToken: null, userId: null, roles: [], isAuthenticated: false, isModerator: false });
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        const d = decode(token);
        if (d) { set({ accessToken: token, ...d, isAuthenticated: true }); }
      }
    } catch { /* silently ignore — user will be prompted to log in */ }
    finally { set({ hydrated: true }); }
  },
}));
