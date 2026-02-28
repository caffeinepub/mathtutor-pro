// localStorage-based data store for the math tutor application

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin';
}

export interface Student {
  id: string;
  userId: string; // alias for id, kept for backward compat
  name: string;
  email: string;
  phone: string;
  course: string;
  sessionType: string;
  accessCode: string;
  uniqueCode?: string; // unique login code generated on payment approval
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
  role?: 'student';
  enrolledCourses: string[];
  principalId?: string;
  paymentId?: number;
}

export interface Course {
  id: string;
  name: string;   // primary display name
  title: string;  // alias kept for compat
  description: string;
  price: number;
  pricePerHour: number;
  groupPricePerHour: number;
  oneOnOnePricePerHour: number;
  duration: string;
  level: string;
  active: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  studentId: string;
  studentEmail?: string;
  studentName?: string;
  date: string;
  time: string;
  duration?: string;
  durationHours: number;
  meetLink: string;
  topic?: string;
  courseName?: string;   // kept for compat
  courseId?: string;     // kept for compat
  sessionType?: string;  // kept for compat
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Material {
  id: string;
  studentId: string;
  studentEmail?: string;
  title: string;
  description?: string;
  fileType: 'pdf' | 'video' | 'image' | 'doc' | 'other';
  fileUrl?: string;
  courseId?: string;    // kept for compat
  courseName?: string;  // kept for compat
  relatedCourse: string;
  uploadedAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  sessionType: string;
  hours: number;
  pricePerHour: number;
  amount: number;       // total amount = hours * pricePerHour
  totalAmount?: number; // alias
  upiTransactionId: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  accessCode?: string;
  uniqueCode?: string;  // unique login code generated on payment approval
  date?: string;        // kept for compat
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetStudentId?: string;
  readBy: string[];
  createdAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  sessionId: string;
  status: 'present' | 'absent';
  markedAt: string;
}

export interface AuthState {
  role: 'admin' | 'student';
  userId: string;
  email: string;
  name: string;
}

export interface AppStore {
  admin: AdminUser;
  students: Student[];
  courses: Course[];
  sessions: Session[];
  materials: Material[];
  payments: Payment[];
  notifications: Notification[];
  attendance: Attendance[];
}

const STORE_KEY = 'rajats_equation_store';
const AUTH_KEY = 'rajats_equation_auth';

export const defaultAdmin: AdminUser = {
  id: 'admin-1',
  email: 'admin@mathtutor.com',
  password: 'Admin@123',
  name: 'Admin',
  role: 'admin',
};

const defaultCourses: Course[] = [
  {
    id: 'course-1',
    name: 'Mathematics Foundation',
    title: 'Mathematics Foundation',
    description: 'Build a strong foundation in mathematics with personalized 1-on-1 sessions.',
    price: 5000,
    pricePerHour: 500,
    groupPricePerHour: 300,
    oneOnOnePricePerHour: 500,
    duration: '3 months',
    level: 'Beginner',
    active: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-2',
    name: 'Advanced Calculus',
    title: 'Advanced Calculus',
    description: 'Master calculus concepts with expert guidance and practice problems.',
    price: 8000,
    pricePerHour: 800,
    groupPricePerHour: 500,
    oneOnOnePricePerHour: 800,
    duration: '4 months',
    level: 'Advanced',
    active: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-3',
    name: 'Statistics & Probability',
    title: 'Statistics & Probability',
    description: 'Comprehensive statistics course covering all major topics.',
    price: 6000,
    pricePerHour: 600,
    groupPricePerHour: 400,
    oneOnOnePricePerHour: 600,
    duration: '3 months',
    level: 'Intermediate',
    active: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-4',
    name: 'JEE Mathematics',
    title: 'JEE Mathematics',
    description: 'Comprehensive JEE preparation covering all math topics with problem-solving techniques.',
    price: 10000,
    pricePerHour: 1000,
    groupPricePerHour: 600,
    oneOnOnePricePerHour: 1000,
    duration: '6 months',
    level: 'Advanced',
    active: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

function createDefaultStore(): AppStore {
  return {
    admin: defaultAdmin,
    students: [],
    courses: defaultCourses,
    sessions: [],
    materials: [],
    payments: [],
    notifications: [],
    attendance: [],
  };
}

export function isStoreEmpty(): boolean {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return true;
    const data = JSON.parse(raw) as Partial<AppStore>;
    return (
      (!data.students || data.students.length === 0) &&
      (!data.sessions || data.sessions.length === 0) &&
      (!data.materials || data.materials.length === 0)
    );
  } catch {
    return true;
  }
}

export function getStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const store = createDefaultStore();
      try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* ignore */ }
      return store;
    }

    let store: AppStore;
    try {
      store = JSON.parse(raw) as AppStore;
    } catch {
      const fresh = createDefaultStore();
      try { localStorage.setItem(STORE_KEY, JSON.stringify(fresh)); } catch { /* ignore */ }
      return fresh;
    }

    // Always sync admin credentials to the correct values
    store.admin = { ...defaultAdmin };

    // Ensure arrays exist
    if (!Array.isArray(store.students)) store.students = [];
    if (!Array.isArray(store.courses) || store.courses.length === 0) store.courses = defaultCourses;
    if (!Array.isArray(store.sessions)) store.sessions = [];
    if (!Array.isArray(store.materials)) store.materials = [];
    if (!Array.isArray(store.payments)) store.payments = [];
    if (!Array.isArray(store.notifications)) store.notifications = [];
    if (!Array.isArray(store.attendance)) store.attendance = [];

    // Migrate students
    store.students = store.students.map((s: any) => ({
      ...s,
      userId: s.userId || s.id,
      enrolledCourses: Array.isArray(s.enrolledCourses) ? s.enrolledCourses : [],
      role: s.role || 'student',
      accessCode: s.accessCode || '',
      uniqueCode: s.uniqueCode || undefined,
    }));

    // Migrate courses — ensure all fields exist
    store.courses = store.courses.map((c: any) => ({
      ...c,
      name: c.name || c.title || '',
      title: c.title || c.name || '',
      active: c.active !== undefined ? c.active : true,
      isActive: c.isActive !== undefined ? c.isActive : true,
      pricePerHour: c.pricePerHour || c.price || 0,
      groupPricePerHour: c.groupPricePerHour || 0,
      oneOnOnePricePerHour: c.oneOnOnePricePerHour || c.pricePerHour || 0,
    }));

    // Migrate sessions
    store.sessions = store.sessions.map((s: any) => ({
      ...s,
      durationHours: s.durationHours || 1,
      status: s.status || 'scheduled',
    }));

    // Migrate materials
    store.materials = store.materials.map((m: any) => ({
      ...m,
      relatedCourse: m.relatedCourse || m.courseName || '',
      fileType: (['pdf', 'video', 'image', 'doc', 'other'].includes(m.fileType) ? m.fileType : 'other') as Material['fileType'],
    }));

    // Migrate payments
    store.payments = store.payments.map((p: any) => ({
      ...p,
      amount: p.amount || p.totalAmount || 0,
      totalAmount: p.totalAmount || p.amount || 0,
      createdAt: p.createdAt || p.date || new Date().toISOString(),
      uniqueCode: p.uniqueCode || undefined,
    }));

    // Migrate notifications
    store.notifications = store.notifications.map((n: any) => ({
      ...n,
      readBy: Array.isArray(n.readBy) ? n.readBy : [],
    }));

    return store;
  } catch {
    return createDefaultStore();
  }
}

export function saveStore(store: AppStore): void {
  try {
    // Always keep admin credentials in sync
    store.admin = { ...defaultAdmin };
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch { /* ignore */ }
}

export function initializeStore(): void {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const store = createDefaultStore();
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } else {
      // Force-sync admin credentials on every init
      const store = getStore();
      saveStore(store);
    }
  } catch { /* ignore */ }
}

// Auth helpers
export function getAuthState(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function storeAuthState(auth: AuthState): void {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch { /* ignore */ }
}

export function clearAuthState(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch { /* ignore */ }
}

// ─── Course helpers ───────────────────────────────────────────────────────────

export function getCourses(): Course[] {
  return getStore().courses;
}

export function createCourse(data: Omit<Course, 'id' | 'createdAt'>): Course {
  const store = getStore();
  const id = `course-${Date.now()}`;
  const course: Course = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  store.courses.push(course);
  saveStore(store);
  return course;
}

export function updateCourse(courseId: string, data: Partial<Omit<Course, 'id' | 'createdAt'>>): void {
  const store = getStore();
  store.courses = store.courses.map((c) =>
    c.id === courseId ? { ...c, ...data } : c
  );
  saveStore(store);
}

export function deleteCourse(courseId: string): void {
  const store = getStore();
  store.courses = store.courses.filter((c) => c.id !== courseId);
  saveStore(store);
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export function getSessions(): Session[] {
  return getStore().sessions;
}

export function createSession(data: Omit<Session, 'id' | 'createdAt'>): Session {
  const store = getStore();
  const id = `session-${Date.now()}`;
  const session: Session = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  store.sessions.push(session);
  saveStore(store);
  return session;
}

export function deleteSession(sessionId: string): void {
  const store = getStore();
  store.sessions = store.sessions.filter((s) => s.id !== sessionId);
  saveStore(store);
}

// ─── Material helpers ─────────────────────────────────────────────────────────

export function getMaterials(): Material[] {
  return getStore().materials;
}

export function createMaterial(data: Omit<Material, 'id' | 'uploadedAt'>): Material {
  const store = getStore();
  const id = `material-${Date.now()}`;
  const material: Material = {
    ...data,
    id,
    uploadedAt: new Date().toISOString(),
  };
  store.materials.push(material);
  saveStore(store);
  return material;
}

export function deleteMaterial(materialId: string): void {
  const store = getStore();
  store.materials = store.materials.filter((m) => m.id !== materialId);
  saveStore(store);
}

// ─── Payment helpers ──────────────────────────────────────────────────────────

export function getPayments(): Payment[] {
  return getStore().payments;
}

export function createPayment(data: Omit<Payment, 'id' | 'createdAt'>): Payment {
  const store = getStore();
  const id = `payment-${Date.now()}`;
  const payment: Payment = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
  };
  store.payments.push(payment);
  saveStore(store);
  return payment;
}

// ─── Notification helpers ─────────────────────────────────────────────────────

export function getNotifications(): Notification[] {
  return getStore().notifications;
}

export function markNotificationRead(notificationId: string, studentId: string): void {
  const store = getStore();
  store.notifications = store.notifications.map((n) => {
    if (n.id !== notificationId) return n;
    if (n.readBy.includes(studentId)) return n;
    return { ...n, readBy: [...n.readBy, studentId] };
  });
  saveStore(store);
}

// ─── Student helpers ──────────────────────────────────────────────────────────

/**
 * Find a student by email and unique code (the code generated on payment approval).
 * Accepts either the accessCode (RJMATH-XXX) or the uniqueCode (random alphanumeric).
 */
export function findStudentByEmailAndCode(email: string, code: string): Student | null {
  try {
    const store = getStore();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();
    return store.students.find(
      s =>
        s.email.toLowerCase() === normalizedEmail &&
        (s.accessCode === normalizedCode || s.uniqueCode === normalizedCode) &&
        s.status === 'approved'
    ) || null;
  } catch {
    return null;
  }
}

export function updateStudentStatus(
  studentId: string,
  status: 'pending' | 'approved' | 'rejected',
  accessCode?: string,
  uniqueCode?: string
): void {
  try {
    const store = getStore();
    store.students = store.students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status,
          accessCode: accessCode !== undefined ? accessCode : s.accessCode,
          uniqueCode: uniqueCode !== undefined ? uniqueCode : s.uniqueCode,
        };
      }
      return s;
    });
    saveStore(store);
  } catch { /* ignore */ }
}

export function generateAccessCode(index: number): string {
  const padded = String(index).padStart(3, '0');
  return `RJMATH-${padded}`;
}

export function getApprovedStudents(): Student[] {
  try {
    const store = getStore();
    return store.students.filter(s => s.status === 'approved');
  } catch {
    return [];
  }
}
