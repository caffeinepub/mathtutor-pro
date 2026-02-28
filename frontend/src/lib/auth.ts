// auth.ts — thin compatibility wrapper around store.ts auth helpers.
// NOTE: Student authentication now relies on Internet Identity (useInternetIdentity hook).
// After a successful Internet Identity login + approval check, storeAuthState is called
// with role='student' so that route guards can verify access via localStorage.
// Admin authentication continues to use a hardcoded email check (mrjain950761@gmail.com).

const AUTH_KEY = 'rajats_equation_auth';

export interface AuthState {
  userId: string;
  role: 'admin' | 'student';
  name: string;
  /** Optional — kept for backward compatibility with student pages that read auth.email */
  email?: string;
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

export function storeAuthState(state: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function clearAuthState(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getCurrentStudentId(): string | null {
  // Student ID is now the Internet Identity principal stored after II login + approval check.
  const state = getAuthState();
  if (state && state.role === 'student') return state.userId;
  return null;
}

export function isAdmin(): boolean {
  const state = getAuthState();
  return state?.role === 'admin';
}

export function isStudent(): boolean {
  const state = getAuthState();
  return state?.role === 'student';
}
