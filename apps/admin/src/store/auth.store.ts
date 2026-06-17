import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload { sub: string; roles: string[]; exp: number; }

interface AdminAuthState {
  accessToken:     string | null;
  userId:          string | null;
  roles:           string[];
  isAuthenticated: boolean;
  isAdmin:         boolean;
  setTokens: (t: { accessToken: string; refreshToken: string }) => void;
  clearAuth:  () => void;
}

const COOKIE = 'udyoga_admin_token';

function readCookie(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.split(';').map(c => c.trim())
    .find(c => c.startsWith(COOKIE + '='))
    ?.split('=').slice(1).join('=') ?? null;
}

function decode(token: string): Pick<AdminAuthState, 'userId' | 'roles' | 'isAdmin'> | null {
  try {
    const p = jwtDecode<JwtPayload>(token);
    if (Date.now() / 1000 > p.exp) return null;
    const roles = p.roles ?? [];
    // Admin portal only allows MODERATOR or ADMIN roles
    if (!roles.includes('MODERATOR') && !roles.includes('ADMIN')) return null;
    return { userId: p.sub, roles, isAdmin: roles.includes('ADMIN') };
  } catch { return null; }
}

const existing = readCookie();
const decoded  = existing ? decode(existing) : null;

export const useAdminAuthStore = create<AdminAuthState>(() => ({
  accessToken:     decoded ? existing : null,
  userId:          decoded?.userId  ?? null,
  roles:           decoded?.roles   ?? [],
  isAuthenticated: !!decoded,
  isAdmin:         decoded?.isAdmin ?? false,

  setTokens: ({ accessToken }) => {
    const d = decode(accessToken);
    if (!d) return; // reject tokens without admin role
    document.cookie = `${COOKIE}=${accessToken};path=/;max-age=900;SameSite=Strict`;
    useAdminAuthStore.setState({ accessToken, ...d, isAuthenticated: true });
  },

  clearAuth: () => {
    document.cookie = `${COOKIE}=;path=/;max-age=0`;
    useAdminAuthStore.setState({ accessToken:null, userId:null, roles:[], isAuthenticated:false, isAdmin:false });
  },
}));
