import { createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import RootLayout from './layouts/RootLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminCourses from './pages/admin/Courses';
import AdminSessions from './pages/admin/Sessions';
import AdminMaterials from './pages/admin/Materials';
import AdminNotifications from './pages/admin/Notifications';
import AdminPayments from './pages/admin/Payments';
import ManageStudentSessions from './pages/admin/ManageStudentSessions';
import ManageStudentMaterials from './pages/admin/ManageStudentMaterials';
import AttendanceManagement from './pages/admin/AttendanceManagement';

// Student pages
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentMaterials from './pages/student/Materials';
import StudentSessions from './pages/student/Sessions';
import StudentPayments from './pages/student/Payments';
import StudentBook from './pages/student/Book';
import StudentProfile from './pages/student/Profile';
import MySessions from './pages/student/MySessions';
import MyMaterials from './pages/student/MyMaterials';

import { getAuthState } from './lib/auth';

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

// Guards
function requireAdmin() {
  const auth = getAuthState();
  if (!auth || auth.role !== 'admin') {
    throw redirect({ to: '/login' });
  }
}

function requireStudent() {
  const auth = getAuthState();
  if (!auth || auth.role !== 'student') {
    throw redirect({ to: '/login' });
  }
}

// Admin layout route
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
  beforeLoad: requireAdmin,
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

const adminNotificationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/notifications',
  component: AdminNotifications,
});

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/payments',
  component: AdminPayments,
});

const adminManageSessionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/manage-sessions',
  component: ManageStudentSessions,
});

const adminManageMaterialsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/manage-materials',
  component: ManageStudentMaterials,
});

const adminAttendanceRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/attendance',
  component: AttendanceManagement,
});

// Student layout route
const studentLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student',
  component: StudentLayout,
  beforeLoad: requireStudent,
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

const studentMaterialsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/materials',
  component: StudentMaterials,
});

const studentSessionsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/sessions',
  component: StudentSessions,
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
  component: MySessions,
});

const studentMyMaterialsRoute = createRoute({
  getParentRoute: () => studentLayoutRoute,
  path: '/my-materials',
  component: MyMaterials,
});

// Route tree export
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
    adminNotificationsRoute,
    adminPaymentsRoute,
    adminManageSessionsRoute,
    adminManageMaterialsRoute,
    adminAttendanceRoute,
  ]),
  studentLayoutRoute.addChildren([
    studentDashboardRoute,
    studentCoursesRoute,
    studentMaterialsRoute,
    studentSessionsRoute,
    studentPaymentsRoute,
    studentBookRoute,
    studentProfileRoute,
    studentMySessionsRoute,
    studentMyMaterialsRoute,
  ]),
]);
