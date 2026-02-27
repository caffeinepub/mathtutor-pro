export type UserRole = 'admin' | 'student';

export interface AuthState {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
}

const AUTH_KEY = 'mathtutor_auth';

export function storeAuthState(state: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
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
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthState() !== null;
}
