// localStorage-based data store for RJ Math Tutor app

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
  course: string;
  sessionType: 'group' | 'one-on-one';
  status: 'pending' | 'approved' | 'rejected';
  accessCode: string;
  registeredAt: string;
  enrolledCourses: string[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  groupPricePerHour: number;
  oneOnOnePricePerHour: number;
  duration: string;
  level: string;
  isActive: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  sessionType: 'group' | 'one-on-one';
  status: 'scheduled' | 'completed' | 'cancelled';
  meetLink?: string;
  createdAt: string;
}

export interface Material {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'video' | 'image' | 'doc' | 'other';
  fileUrl: string;
  uploadedAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  sessionType: 'group' | 'one-on-one';
  hours: number;
  pricePerHour: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  upiTransactionId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  targetStudentId?: string;
  createdAt: string;
  readBy: string[];
}

export interface AppStore {
  users: User[];
  students: Student[];
  courses: Course[];
  sessions: Session[];
  materials: Material[];
  payments: Payment[];
  notifications: Notification[];
}

const STORE_KEY = 'rjmath_store';

const defaultAdmin: User = {
  id: 'admin-1',
  name: 'Rajat Sir',
  email: 'admin@mathtutor.com',
  phone: '9424135055',
  password: 'Admin@123',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const defaultCourses: Course[] = [
  {
    id: 'course-1',
    name: 'JEE Mains',
    description: 'Comprehensive preparation for JEE Mains with focus on Physics, Chemistry, and Mathematics.',
    groupPricePerHour: 250,
    oneOnOnePricePerHour: 350,
    duration: 'Flexible',
    level: 'Class 11-12',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-2',
    name: 'JEE Advanced',
    description: 'In-depth preparation for JEE Advanced with advanced problem-solving techniques.',
    groupPricePerHour: 350,
    oneOnOnePricePerHour: 500,
    duration: 'Flexible',
    level: 'Class 12',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-3',
    name: 'Board Exams (Class 10 & 12)',
    description: 'Focused preparation for CBSE/State Board exams for Class 10 and 12 students.',
    groupPricePerHour: 150,
    oneOnOnePricePerHour: 250,
    duration: 'Flexible',
    level: 'Class 10 & 12',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-4',
    name: 'Foundation Course (Class 6–8 Math Thinking)',
    description: 'Build strong mathematical foundations and logical thinking for Class 6 to 8 students.',
    groupPricePerHour: 100,
    oneOnOnePricePerHour: 200,
    duration: 'Flexible',
    level: 'Class 6-8',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'course-5',
    name: 'Math Olympiad',
    description: 'Specialized training for Math Olympiad competitions with advanced problem-solving.',
    groupPricePerHour: 200,
    oneOnOnePricePerHour: 300,
    duration: 'Flexible',
    level: 'All Levels',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

function getDefaultStore(): AppStore {
  return {
    users: [defaultAdmin],
    students: [],
    courses: defaultCourses,
    sessions: [],
    materials: [],
    payments: [],
    notifications: [],
  };
}

export function getStore(): AppStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const store = getDefaultStore();
      saveStore(store);
      return store;
    }
    const store: AppStore = JSON.parse(raw);

    // Always ensure admin credentials are correct
    const adminIndex = store.users.findIndex((u) => u.role === 'admin');
    if (adminIndex === -1) {
      store.users.push(defaultAdmin);
    } else {
      store.users[adminIndex] = { ...store.users[adminIndex], ...defaultAdmin };
    }

    // Ensure courses have hourly pricing fields (migration)
    store.courses = store.courses.map((c) => {
      const updated = { ...c } as Course;
      if (!('groupPricePerHour' in updated)) {
        (updated as any).groupPricePerHour = (updated as any).groupPrice || (updated as any).monthlyGroupPrice || 250;
      }
      if (!('oneOnOnePricePerHour' in updated)) {
        (updated as any).oneOnOnePricePerHour = (updated as any).oneOnOnePrice || (updated as any).monthlyOneOnOnePrice || 350;
      }
      return updated;
    });

    // Ensure students have accessCode field
    store.students = store.students.map((s) => ({
      ...s,
      accessCode: s.accessCode || '',
    }));

    saveStore(store);
    return store;
  } catch {
    const store = getDefaultStore();
    saveStore(store);
    return store;
  }
}

export function saveStore(store: AppStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

// User operations
export function getUserByEmail(email: string): User | undefined {
  const store = getStore();
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const store = getStore();
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.users.push(newUser);
  saveStore(store);
  return newUser;
}

// Student operations
export function getStudents(): Student[] {
  return getStore().students;
}

export function getStudentByEmail(email: string): Student | undefined {
  const store = getStore();
  return store.students.find((s) => s.email.toLowerCase() === email.toLowerCase());
}

export function getStudentByUserId(userId: string): Student | undefined {
  const store = getStore();
  return store.students.find((s) => s.userId === userId);
}

export function createStudent(student: Omit<Student, 'id' | 'registeredAt' | 'enrolledCourses' | 'accessCode'>): Student {
  const store = getStore();
  const newStudent: Student = {
    ...student,
    id: `student-${Date.now()}`,
    accessCode: '',
    enrolledCourses: [],
    registeredAt: new Date().toISOString(),
  };
  store.students.push(newStudent);
  saveStore(store);
  return newStudent;
}

export function updateStudent(studentId: string, updates: Partial<Student>): Student | undefined {
  const store = getStore();
  const index = store.students.findIndex((s) => s.id === studentId);
  if (index === -1) return undefined;
  store.students[index] = { ...store.students[index], ...updates };
  saveStore(store);
  return store.students[index];
}

// Generate next RJMATH access code
export function generateNextAccessCode(): string {
  const store = getStore();
  let maxNum = 0;
  store.students.forEach((s) => {
    if (s.accessCode) {
      const match = s.accessCode.match(/^RJMATH-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });
  const next = maxNum + 1;
  const padded = String(next).padStart(3, '0');
  return `RJMATH-${padded}`;
}

// Course operations
export function getCourses(): Course[] {
  return getStore().courses;
}

export function getCourseById(id: string): Course | undefined {
  return getStore().courses.find((c) => c.id === id);
}

export function createCourse(course: Omit<Course, 'id' | 'createdAt'>): Course {
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

export function updateCourse(courseId: string, updates: Partial<Course>): Course | undefined {
  const store = getStore();
  const index = store.courses.findIndex((c) => c.id === courseId);
  if (index === -1) return undefined;
  store.courses[index] = { ...store.courses[index], ...updates };
  saveStore(store);
  return store.courses[index];
}

export function deleteCourse(courseId: string): void {
  const store = getStore();
  store.courses = store.courses.filter((c) => c.id !== courseId);
  saveStore(store);
}

// Session operations
export function getSessions(): Session[] {
  return getStore().sessions;
}

export function createSession(session: Omit<Session, 'id' | 'createdAt'>): Session {
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

export function updateSession(sessionId: string, updates: Partial<Session>): Session | undefined {
  const store = getStore();
  const index = store.sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return undefined;
  store.sessions[index] = { ...store.sessions[index], ...updates };
  saveStore(store);
  return store.sessions[index];
}

export function deleteSession(sessionId: string): void {
  const store = getStore();
  store.sessions = store.sessions.filter((s) => s.id !== sessionId);
  saveStore(store);
}

// Material operations
export function getMaterials(): Material[] {
  return getStore().materials;
}

export function createMaterial(material: Omit<Material, 'id' | 'uploadedAt'>): Material {
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

export function deleteMaterial(materialId: string): void {
  const store = getStore();
  store.materials = store.materials.filter((m) => m.id !== materialId);
  saveStore(store);
}

// Payment operations
export function getPayments(): Payment[] {
  return getStore().payments;
}

export function createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Payment {
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

export function updatePayment(paymentId: string, updates: Partial<Payment>): Payment | undefined {
  const store = getStore();
  const index = store.payments.findIndex((p) => p.id === paymentId);
  if (index === -1) return undefined;
  store.payments[index] = { ...store.payments[index], ...updates };
  saveStore(store);
  return store.payments[index];
}

// Notification operations
export function getNotifications(): Notification[] {
  return getStore().notifications;
}

export function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'readBy'>): Notification {
  const store = getStore();
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
    readBy: [],
  };
  store.notifications.push(newNotification);
  saveStore(store);
  return newNotification;
}

export function markNotificationRead(notificationId: string, studentId: string): void {
  const store = getStore();
  const index = store.notifications.findIndex((n) => n.id === notificationId);
  if (index === -1) return;
  if (!store.notifications[index].readBy.includes(studentId)) {
    store.notifications[index].readBy.push(studentId);
  }
  saveStore(store);
}

// Auth state
export interface AuthState {
  isAuthenticated: boolean;
  role: 'admin' | 'student' | null;
  userId: string | null;
  email: string | null;
}

const AUTH_KEY = 'mathtutor_auth';

export function getAuthState(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { isAuthenticated: false, role: null, userId: null, email: null };
    return JSON.parse(raw);
  } catch {
    return { isAuthenticated: false, role: null, userId: null, email: null };
  }
}

export function storeAuthState(state: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  // Legacy keys for backward compatibility
  if (state.role === 'admin') {
    localStorage.setItem('currentUser', JSON.stringify({ email: state.email, role: 'admin' }));
  } else if (state.role === 'student') {
    localStorage.setItem('currentStudent', JSON.stringify({ email: state.email, role: 'student' }));
  }
}

export function clearAuthState(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentStudent');
}
