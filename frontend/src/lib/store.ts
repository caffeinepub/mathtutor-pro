// Store types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'student';
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolledCourses: string[];
  accessCode?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  level: string;
  duration: string;
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  meetLink?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  sessionId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Store {
  users: User[];
  students: Student[];
  courses: Course[];
  sessions: Session[];
  materials: Material[];
  payments: Payment[];
  notifications: Notification[];
}

const STORE_KEY = 'mathtutor_store';

const defaultAdmin: User = {
  id: 'admin_001',
  name: 'Rajat Sir',
  email: 'admin@rajatsequation.com',
  phone: '9424135055',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const defaultStore: Store = {
  users: [defaultAdmin],
  students: [],
  courses: [
    {
      id: 'course_001',
      name: 'JEE Mathematics',
      description: 'Comprehensive JEE Main & Advanced preparation covering algebra, calculus, coordinate geometry, and trigonometry.',
      price: 15000,
      level: 'Advanced',
      duration: '12 months',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'course_002',
      name: 'NEET Mathematics',
      description: 'Focused mathematics preparation for NEET aspirants with biology-context problems.',
      price: 12000,
      level: 'Intermediate',
      duration: '10 months',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'course_003',
      name: 'Class 11-12 Mathematics',
      description: 'Complete CBSE/ICSE board preparation with in-depth coverage of all chapters.',
      price: 10000,
      level: 'Intermediate',
      duration: '8 months',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'course_004',
      name: 'Foundation Mathematics',
      description: 'Strong foundation building for Class 8-10 students with conceptual clarity.',
      price: 8000,
      level: 'Beginner',
      duration: '6 months',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
  sessions: [],
  materials: [],
  payments: [],
  notifications: [],
};

export function getStore(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(defaultStore));
      return JSON.parse(JSON.stringify(defaultStore)) as Store;
    }
    const parsed = JSON.parse(raw) as Partial<Store>;

    // Ensure admin user always exists
    const hasAdmin = (parsed.users || []).some((u) => u.role === 'admin');
    if (!hasAdmin) {
      parsed.users = [defaultAdmin, ...(parsed.users || [])];
    }

    // Merge with defaults to ensure all keys exist
    return {
      users: parsed.users || defaultStore.users,
      students: parsed.students || [],
      courses: parsed.courses || defaultStore.courses,
      sessions: parsed.sessions || [],
      materials: parsed.materials || [],
      payments: parsed.payments || [],
      notifications: parsed.notifications || [],
    };
  } catch {
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultStore));
    return JSON.parse(JSON.stringify(defaultStore)) as Store;
  }
}

export function saveStore(store: Store): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save store:', e);
  }
}

// Legacy compatibility: seedData no-op (data is seeded via defaultStore)
export function seedData(): void {
  // Data is automatically seeded when getStore() is first called
}

// Convenience store accessors that return live arrays from the store
export const studentsStore = {
  getAll: () => getStore().students,
  save: (students: Student[]) => { const s = getStore(); s.students = students; saveStore(s); },
};

export const usersStore = {
  getAll: () => getStore().users,
  save: (users: User[]) => { const s = getStore(); s.users = users; saveStore(s); },
};

export const coursesStore = {
  getAll: () => getStore().courses,
  save: (courses: Course[]) => { const s = getStore(); s.courses = courses; saveStore(s); },
};

export const sessionsStore = {
  getAll: () => getStore().sessions,
  save: (sessions: Session[]) => { const s = getStore(); s.sessions = sessions; saveStore(s); },
};

export const materialsStore = {
  getAll: () => getStore().materials,
  save: (materials: Material[]) => { const s = getStore(); s.materials = materials; saveStore(s); },
};

export const paymentsStore = {
  getAll: () => getStore().payments,
  save: (payments: Payment[]) => { const s = getStore(); s.payments = payments; saveStore(s); },
};

export const notificationsStore = {
  getAll: () => getStore().notifications,
  save: (notifications: Notification[]) => { const s = getStore(); s.notifications = notifications; saveStore(s); },
};
