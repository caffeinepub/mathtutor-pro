import { createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/Landing';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminPayments from './pages/admin/Payments';
import AdminSessions from './pages/admin/Sessions';
import AdminCourses from './pages/admin/Courses';
import AdminMaterials from './pages/admin/Materials';
import AdminNotifications from './pages/admin/Notifications';
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentMaterials from './pages/student/Materials';
import StudentSessions from './pages/student/Sessions';
import StudentPayments from './pages/student/Payments';
import StudentBook from './pages/student/Book';
import StudentProfile from './pages/student/Profile';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import { getAuthState } from './lib/auth';

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LandingPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: '/login', component: LoginPage });
const registerRoute = createRoute({ getParentRoute: () => rootRoute, path: '/register', component: RegisterPage });
const paymentSuccessRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-success', component: PaymentSuccess });
const paymentFailureRoute = createRoute({ getParentRoute: () => rootRoute, path: '/payment-failure', component: PaymentFailure });

// Admin routes
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
  beforeLoad: () => {
    const auth = getAuthState();
    if (!auth) throw redirect({ to: '/login' });
    if (auth.role !== 'admin') throw redirect({ to: '/login' });
  },
});
const adminIndexRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/', component: AdminDashboard });
const adminStudentsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/students', component: AdminStudents });
const adminPaymentsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/payments', component: AdminPayments });
const adminSessionsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/sessions', component: AdminSessions });
const adminCoursesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/courses', component: AdminCourses });
const adminMaterialsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/materials', component: AdminMaterials });
const adminNotificationsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/notifications', component: AdminNotifications });

// Student routes
const studentLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student',
  component: StudentLayout,
  beforeLoad: () => {
    const auth = getAuthState();
    if (!auth) throw redirect({ to: '/login' });
    if (auth.role !== 'student') throw redirect({ to: '/login' });
  },
});
const studentIndexRoute = createRoute({ getParentRoute: () => studentLayoutRoute, path: '/', component: StudentDashboard });
const studentCoursesRoute = createRoute({ getParentRoute: () => studentLayoutRoute, path: '/courses', component: StudentCourses });
const studentMaterialsRoute = createRoute({ getParentRoute: () => studentLayoutRoute, path: '/materials', component: StudentMaterials });
const studentSessionsRoute = createRoute({ getParentRoute: () => studentLayoutRoute, path: '/sessions', component: StudentSessions });
const studentPaymentsRoute = createRoute({ getParentRoute: () => studentLayoutRoute, path: '/payments', component: StudentPayments });
const studentBookRoute = createRoute({ getParentRoute: () => studentLayoutRoute, path: '/book', component: StudentBook });
const studentProfileRoute = createRoute({ getParentRoute: () => studentLayoutRoute, path: '/profile', component: StudentProfile });

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminStudentsRoute,
    adminPaymentsRoute,
    adminSessionsRoute,
    adminCoursesRoute,
    adminMaterialsRoute,
    adminNotificationsRoute,
  ]),
  studentLayoutRoute.addChildren([
    studentIndexRoute,
    studentCoursesRoute,
    studentMaterialsRoute,
    studentSessionsRoute,
    studentPaymentsRoute,
    studentBookRoute,
    studentProfileRoute,
  ]),
]);
