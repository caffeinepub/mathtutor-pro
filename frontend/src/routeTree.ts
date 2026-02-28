import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';

// Pages - lazy imports replaced with direct imports to avoid chunk loading issues
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminCourses from './pages/admin/Courses';
import AdminSessions from './pages/admin/Sessions';
import AdminMaterials from './pages/admin/Materials';
import AdminPayments from './pages/admin/Payments';
import AdminNotifications from './pages/admin/Notifications';
import ManageStudentSessions from './pages/admin/ManageStudentSessions';
import ManageStudentMaterials from './pages/admin/ManageStudentMaterials';
import AttendanceManagement from './pages/admin/AttendanceManagement';

import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentSessions from './pages/student/Sessions';
import StudentMaterials from './pages/student/Materials';
import StudentPayments from './pages/student/Payments';
import StudentBook from './pages/student/Book';
import StudentProfile from './pages/student/Profile';
import MySessions from './pages/student/MySessions';
import MyMaterials from './pages/student/MyMaterials';

import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// Auth helpers — must match the key used in store.ts / auth.ts
const AUTH_KEY = 'rajats_equation_auth';

function getAuthState(): { role?: string; userId?: string } {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Public routes
const landingRoute = createRoute({
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

// Admin layout route with guard
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
  beforeLoad: () => {
    try {
      const auth = getAuthState();
      if (!auth.role || auth.role !== 'admin') {
        throw redirect({ to: '/login' });
      }
    } catch (e) {
      if ((e as any)?.isRedirect) throw e;
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

const adminCoursesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/courses',
  component: AdminCourses,
});

const adminSessionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/sessions',
  component: AdminSessions,
});

const adminMaterialsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/materials',
  component: AdminMaterials,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/payments',
  component: AdminPayments,
});

const adminNotificationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/notifications',
  component: AdminNotifications,
});

const manageStudentSessionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/manage-sessions',
  component: ManageStudentSessions,
});

const manageStudentMaterialsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/manage-materials',
  component: ManageStudentMaterials,
});

const attendanceManagementRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/attendance',
  component: AttendanceManagement,
});

// Student layout route with guard
const studentLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student',
  component: StudentLayout,
  beforeLoad: () => {
    try {
      const auth = getAuthState();
      if (!auth.role || auth.role !== 'student') {
        throw redirect({ to: '/login' });
      }
    } catch (e) {
      if ((e as any)?.isRedirect) throw e;
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

const mySessionsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/my-sessions',
  component: MySessions,
});

const myMaterialsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/my-materials',
  component: MyMaterials,
});

// Build route tree
export const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminLayoutRoute.addChildren([
    adminDashboardRoute,
    adminStudentsRoute,
    adminCoursesRoute,
    adminSessionsRoute,
    adminMaterialsRoute,
    adminPaymentsRoute,
    adminNotificationsRoute,
    manageStudentSessionsRoute,
    manageStudentMaterialsRoute,
    attendanceManagementRoute,
  ]),
  studentLayoutRoute.addChildren([
    studentDashboardRoute,
    studentCoursesRoute,
    studentSessionsRoute,
    studentMaterialsRoute,
    studentPaymentsRoute,
    studentBookRoute,
    studentProfileRoute,
    mySessionsRoute,
    myMaterialsRoute,
  ]),
]);
