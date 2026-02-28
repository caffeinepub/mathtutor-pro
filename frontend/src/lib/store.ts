// ─── Types ────────────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  active: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  sessionType: string;
  hours: number;
  status: 'pending' | 'approved' | 'rejected';
  accessCode?: string;
  uniqueCode?: string;
  principalId?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  sessionType: string;
  hours: number;
  pricePerHour: number;
  amount: number;
  upiTransactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  accessCode?: string;
  uniqueCode?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  studentId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  meetLink?: string;
  topic?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Material {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  fileType: 'pdf' | 'video' | 'image' | 'doc' | 'other';
  fileUrl?: string;
  course: string;
  uploadedAt: string;
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

export interface AppStore {
  courses: Course[];
  students: Student[];
  payments: Payment[];
  sessions: Session[];
  materials: Material[];
  notifications: Notification[];
}

// ─── Storage Key ──────────────────────────────────────────────────────────────

const STORE_KEY = 'rajats_equation_store';

// ─── Default Data ─────────────────────────────────────────────────────────────

function getDefaultStore(): AppStore {
  return {
    courses: [
      {
        id: 'course-1',
        name: 'JEE Mathematics',
        description: 'Comprehensive JEE preparation covering all math topics',
        pricePerHour: 500,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'course-2',
        name: 'NEET Mathematics',
        description: 'Mathematics for NEET aspirants',
        pricePerHour: 450,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'course-3',
        name: 'Board Exam Preparation',
        description: 'Class 11 & 12 board exam mathematics',
        pricePerHour: 400,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'course-4',
        name: 'Foundation Mathematics',
        description: 'Class 8-10 foundation mathematics',
        pricePerHour: 350,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ],
    students: [],
    payments: [],
    sessions: [],
    materials: [],
    notifications: [],
  };
}

// ─── Store Helpers ────────────────────────────────────────────────────────────

export function getStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return getDefaultStore();
    const parsed = JSON.parse(raw) as Partial<AppStore>;
    const defaults = getDefaultStore();
    return {
      courses: parsed.courses ?? defaults.courses,
      students: parsed.students ?? defaults.students,
      payments: parsed.payments ?? defaults.payments,
      sessions: parsed.sessions ?? defaults.sessions,
      materials: parsed.materials ?? defaults.materials,
      notifications: parsed.notifications ?? defaults.notifications,
    };
  } catch {
    return getDefaultStore();
  }
}

export function saveStore(store: AppStore): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
}

export function initializeStore(): void {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      saveStore(getDefaultStore());
    }
  } catch {
    // ignore
  }
}

// ─── Convenience getters ──────────────────────────────────────────────────────

export function getCourses(): Course[] {
  return getStore().courses;
}

export function getMaterials(): Material[] {
  return getStore().materials;
}

export function getApprovedStudents(): Student[] {
  return getStore().students.filter((s) => s.status === 'approved');
}

// ─── CRUD Helpers ─────────────────────────────────────────────────────────────

export function addCourse(course: Omit<Course, 'id' | 'createdAt'>): Course {
  const store = getStore();
  const newCourse: Course = {
    ...course,
    id: `course-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.courses.push(newCourse);
  saveStore(store);
  return newCourse;
}

/** Alias for addCourse used by some pages */
export function createCourse(course: Omit<Course, 'id' | 'createdAt'>): Course {
  return addCourse(course);
}

export function updateCourse(id: string, updates: Partial<Course>): void {
  const store = getStore();
  const idx = store.courses.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.courses[idx] = { ...store.courses[idx], ...updates };
    saveStore(store);
  }
}

export function deleteCourse(id: string): void {
  const store = getStore();
  store.courses = store.courses.filter((c) => c.id !== id);
  saveStore(store);
}

export function addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
  const store = getStore();
  const newStudent: Student = {
    ...student,
    id: `student-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.students.push(newStudent);
  saveStore(store);
  return newStudent;
}

export function updateStudentStatus(
  id: string,
  status: Student['status'],
  accessCode?: string,
  uniqueCode?: string
): void {
  const store = getStore();
  const idx = store.students.findIndex((s) => s.id === id);
  if (idx !== -1) {
    store.students[idx] = {
      ...store.students[idx],
      status,
      ...(accessCode !== undefined ? { accessCode } : {}),
      ...(uniqueCode !== undefined ? { uniqueCode } : {}),
    };
    saveStore(store);
  }
}

export function addPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Payment {
  const store = getStore();
  const newPayment: Payment = {
    ...payment,
    id: `payment-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.payments.push(newPayment);
  saveStore(store);
  return newPayment;
}

export function updatePaymentStatus(
  id: string,
  status: Payment['status'],
  accessCode?: string,
  uniqueCode?: string
): void {
  const store = getStore();
  const idx = store.payments.findIndex((p) => p.id === id);
  if (idx !== -1) {
    store.payments[idx] = {
      ...store.payments[idx],
      status,
      ...(accessCode !== undefined ? { accessCode } : {}),
      ...(uniqueCode !== undefined ? { uniqueCode } : {}),
    };
    saveStore(store);
  }
}

export function addSession(session: Omit<Session, 'id' | 'createdAt'>): Session {
  const store = getStore();
  const newSession: Session = {
    ...session,
    id: `session-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.sessions.push(newSession);
  saveStore(store);
  return newSession;
}

export function deleteSession(id: string): void {
  const store = getStore();
  store.sessions = store.sessions.filter((s) => s.id !== id);
  saveStore(store);
}

export function addMaterial(material: Omit<Material, 'id' | 'uploadedAt'>): Material {
  const store = getStore();
  const newMaterial: Material = {
    ...material,
    id: `material-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
  };
  store.materials.push(newMaterial);
  saveStore(store);
  return newMaterial;
}

export function deleteMaterial(id: string): void {
  const store = getStore();
  store.materials = store.materials.filter((m) => m.id !== id);
  saveStore(store);
}

export function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const store = getStore();
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.notifications.push(newNotification);
  saveStore(store);
  return newNotification;
}

export function markNotificationRead(notificationId: string, studentId: string): void {
  const store = getStore();
  const idx = store.notifications.findIndex((n) => n.id === notificationId);
  if (idx !== -1) {
    const notif = store.notifications[idx];
    if (!notif.readBy.includes(studentId)) {
      store.notifications[idx] = {
        ...notif,
        readBy: [...notif.readBy, studentId],
      };
      saveStore(store);
    }
  }
}

export function findStudentByEmailAndCode(email: string, code: string): Student | undefined {
  const store = getStore();
  return store.students.find(
    (s) =>
      s.email === email &&
      (s.accessCode === code || s.uniqueCode === code)
  );
}

export function getStudentById(id: string): Student | undefined {
  const store = getStore();
  return store.students.find((s) => s.id === id);
}
