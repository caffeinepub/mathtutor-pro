import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
} from '@tanstack/react-router';

import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminPayments from './pages/admin/Payments';
import AdminSessions from './pages/admin/Sessions';
import AdminCourses from './pages/admin/Courses';
import AdminMaterials from './pages/admin/Materials';
import AdminNotifications from './pages/admin/Notifications';
import AdminManageStudentSessions from './pages/admin/ManageStudentSessions';
import AdminManageStudentMaterials from './pages/admin/ManageStudentMaterials';
import AdminAttendance from './pages/admin/AttendanceManagement';

import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentSessions from './pages/student/Sessions';
import StudentMaterials from './pages/student/Materials';
import StudentPayments from './pages/student/Payments';
import StudentBook from './pages/student/Book';
import StudentProfile from './pages/student/Profile';
import StudentMySessions from './pages/student/MySessions';
import StudentMyMaterials from './pages/student/MyMaterials';

import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

const AUTH_KEY = 'rajats_equation_auth';

function getAuthRole(): 'admin' | 'student' | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { role?: string };
    if (parsed.role === 'admin' || parsed.role === 'student') return parsed.role;
    return null;
  } catch {
    return null;
  }
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: RootLayout,
});

// ─── Public Routes ────────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Landing,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

// ─── Admin Layout Route ───────────────────────────────────────────────────────

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
  beforeLoad: () => {
    const role = getAuthRole();
    if (role !== 'admin') {
      throw redirect({ to: '/login' });
    }
  },
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  component: AdminDashboard,
});

const adminStudentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/students',
  component: AdminStudents,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/payments',
  component: AdminPayments,
});

const adminSessionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/sessions',
  component: AdminSessions,
});

const adminCoursesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/courses',
  component: AdminCourses,
});

const adminMaterialsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/materials',
  component: AdminMaterials,
});

const adminNotificationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/notifications',
  component: AdminNotifications,
});

const adminManageStudentSessionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/manage-sessions',
  component: AdminManageStudentSessions,
});

const adminManageStudentMaterialsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/manage-materials',
  component: AdminManageStudentMaterials,
});

const adminAttendanceRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/attendance',
  component: AdminAttendance,
});

// ─── Student Layout Route ─────────────────────────────────────────────────────

const studentLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student',
  component: StudentLayout,
  beforeLoad: () => {
    const role = getAuthRole();
    if (role !== 'student') {
      throw redirect({ to: '/login' });
    }
  },
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/',
  component: StudentDashboard,
});

const studentCoursesRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/courses',
  component: StudentCourses,
});

const studentSessionsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/sessions',
  component: StudentSessions,
});

const studentMaterialsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/materials',
  component: StudentMaterials,
});

const studentPaymentsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/payments',
  component: StudentPayments,
});

const studentBookRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/book',
  component: StudentBook,
});

const studentProfileRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/profile',
  component: StudentProfile,
});

const studentMySessionsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/my-sessions',
  component: StudentMySessions,
});

const studentMyMaterialsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/my-materials',
  component: StudentMyMaterials,
});

// ─── Route Tree ───────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminStudentsRoute,
    adminPaymentsRoute,
    adminSessionsRoute,
    adminCoursesRoute,
    adminMaterialsRoute,
    adminNotificationsRoute,
    adminManageStudentSessionsRoute,
    adminManageStudentMaterialsRoute,
    adminAttendanceRoute,
  ]),
  studentLayoutRoute.addChildren([
    studentDashboardRoute,
    studentCoursesRoute,
    studentSessionsRoute,
    studentMaterialsRoute,
    studentPaymentsRoute,
    studentBookRoute,
    studentProfileRoute,
    studentMySessionsRoute,
    studentMyMaterialsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
