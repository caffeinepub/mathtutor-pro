const AUTH_KEY = 'rajats_equation_auth';

export interface AuthState {
  role: 'admin' | 'student';
  studentId?: string;
  principalId?: string;
  email?: string;
  name?: string;
}

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
  if (!auth || auth.role !== 'student') return null;
  return auth.studentId ?? null;
}

export function isAdmin(): boolean {
  const auth = getAuthState();
  return auth?.role === 'admin';
}

export function isStudent(): boolean {
  const auth = getAuthState();
  return auth?.role === 'student';
}
