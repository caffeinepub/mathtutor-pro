// Authentication helpers — thin wrappers that delegate to store.ts auth helpers
// Kept for backward compatibility with files that import from lib/auth

export type { AuthState } from './store';
export { getAuthState, storeAuthState, clearAuthState } from './store';

export function getCurrentStudentId(): string | null {
  try {
    const raw = localStorage.getItem('rajats_equation_auth');
    if (!raw) return null;
    const auth = JSON.parse(raw) as { role?: string; userId?: string };
    if (auth?.role === 'student') return auth.userId ?? null;
    return null;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  try {
    const raw = localStorage.getItem('rajats_equation_auth');
    if (!raw) return false;
    const auth = JSON.parse(raw) as { role?: string };
    return auth?.role === 'admin';
  } catch {
    return false;
  }
}

export function isStudent(): boolean {
  try {
    const raw = localStorage.getItem('rajats_equation_auth');
    if (!raw) return false;
    const auth = JSON.parse(raw) as { role?: string };
    return auth?.role === 'student';
  } catch {
    return false;
  }
}
