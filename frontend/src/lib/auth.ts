// Auth state helpers for localStorage-based auth
export interface AuthState {
  role: 'admin' | 'student';
  studentId?: string;
  email?: string;
  principal?: string;
  accessCode?: string;
  uniqueCode?: string;
  name?: string;
}

const AUTH_KEY = 'rajats_equation_auth';
const CACHED_CREDENTIALS_KEY = 'rajats_equation_cached_creds';

export function storeAuthState(state: AuthState): void {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function getAuthState(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function clearAuthState(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}

export function getCurrentStudentId(): string | null {
  const auth = getAuthState();
  return auth?.studentId ?? null;
}

export function isAdmin(): boolean {
  const auth = getAuthState();
  return auth?.role === 'admin';
}

export function isStudent(): boolean {
  const auth = getAuthState();
  return auth?.role === 'student';
}

// ---- Offline credential cache ----

export interface CachedCredentials {
  email: string;
  accessCode: string;
  studentId: string;
  name?: string;
  uniqueCode?: string;
  principal?: string;
  cachedAt: number;
}

export function cacheStudentCredentials(creds: CachedCredentials): void {
  try {
    localStorage.setItem(CACHED_CREDENTIALS_KEY, JSON.stringify(creds));
  } catch {
    // ignore
  }
}

export function getCachedCredentials(): CachedCredentials | null {
  try {
    const raw = localStorage.getItem(CACHED_CREDENTIALS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedCredentials;
  } catch {
    return null;
  }
}

export function clearCachedCredentials(): void {
  try {
    localStorage.removeItem(CACHED_CREDENTIALS_KEY);
  } catch {
    // ignore
  }
}

export function hasCachedCredentials(): boolean {
  return getCachedCredentials() !== null;
}

export function validateCachedCredentials(email: string, accessCode: string): CachedCredentials | null {
  const cached = getCachedCredentials();
  if (!cached) return null;
  const emailMatch = cached.email.trim().toLowerCase() === email.trim().toLowerCase();
  const codeMatch =
    cached.accessCode.trim().toUpperCase() === accessCode.trim().toUpperCase();
  if (emailMatch && codeMatch) return cached;
  return null;
}
