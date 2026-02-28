import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import RootLayout from './layouts/RootLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminSessions from './pages/admin/Sessions';
import AdminCourses from './pages/admin/Courses';
import AdminPayments from './pages/admin/Payments';
import AdminMaterials from './pages/admin/Materials';
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

const AUTH_KEY = 'rajats_equation_auth';

function getAuthRole(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    const auth = JSON.parse(stored);
    return auth?.role || null;
  } catch {
    return null;
  }
}

function isAuthenticated(): boolean {
  return getAuthRole() !== null;
}

// Root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Public routes
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

// Admin routes - require admin role
const adminRoute = createRoute({
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

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  component: AdminDashboard,
});

const adminStudentsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/students',
  component: AdminStudents,
});

const adminSessionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/sessions',
  component: AdminSessions,
});

const adminCoursesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/courses',
  component: AdminCourses,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/payments',
  component: AdminPayments,
});

const adminMaterialsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/materials',
  component: AdminMaterials,
});

const adminNotificationsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/notifications',
  component: AdminNotifications,
});

const manageStudentSessionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/manage-sessions',
  component: ManageStudentSessions,
});

const manageStudentMaterialsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/manage-materials',
  component: ManageStudentMaterials,
});

const attendanceManagementRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/attendance',
  component: AttendanceManagement,
});

// Student routes - require any authenticated user (student or admin)
const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student',
  component: StudentLayout,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login' });
    }
  },
});

const studentIndexRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: '/',
  component: StudentDashboard,
});

const studentCoursesRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: '/courses',
  component: StudentCourses,
});

const studentSessionsRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: '/sessions',
  component: StudentSessions,
});

const studentMaterialsRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: '/materials',
  component: StudentMaterials,
});

const studentPaymentsRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: '/payments',
  component: StudentPayments,
});

const studentBookRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: '/book',
  component: StudentBook,
});

const studentProfileRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: '/profile',
  component: StudentProfile,
});

const mySessionsRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: '/my-sessions',
  component: MySessions,
});

const myMaterialsRoute = createRoute({
  getParentRoute: () => studentRoute,
  path: '/my-materials',
  component: MyMaterials,
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminRoute.addChildren([
    adminIndexRoute,
    adminStudentsRoute,
    adminSessionsRoute,
    adminCoursesRoute,
    adminPaymentsRoute,
    adminMaterialsRoute,
    adminNotificationsRoute,
    manageStudentSessionsRoute,
    manageStudentMaterialsRoute,
    attendanceManagementRoute,
  ]),
  studentRoute.addChildren([
    studentIndexRoute,
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

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
