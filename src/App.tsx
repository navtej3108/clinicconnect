import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Doctor } from './lib/supabase';
import { PageLoader } from './components/Spinner';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import RegisterPatient from './pages/auth/RegisterPatient';
import RegisterDoctor from './pages/auth/RegisterDoctor';
import AdminLogin from './pages/auth/AdminLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import BrowseClinics from './pages/patient/BrowseClinics';
import ClinicDetail from './pages/patient/ClinicDetail';
import MyAppointments from './pages/patient/MyAppointments';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorProfile from './pages/doctor/DoctorProfile';
import AdminOverview from './pages/admin/AdminOverview';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAppointments from './pages/admin/AdminAppointments';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [path, setPath] = useState(window.location.hash.replace('#', '') || '/');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  function navigate(to: string) {
    window.location.hash = to;
    setPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    function onHashChange() {
      setPath(window.location.hash.replace('#', '') || '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Redirect after login based on role
  useEffect(() => {
    if (!loading && user && profile) {
      const publicPaths = ['/', '/login', '/register', '/register-doctor', '/admin/login'];
      if (publicPaths.includes(path)) {
        if (profile.role === 'doctor') navigate('/doctor/dashboard');
        else if (profile.role === 'admin') navigate('/admin/overview');
        else navigate('/patient/dashboard');
      }
    }
  }, [user, profile, loading]);

  if (loading) return <PageLoader />;

  const noNavPaths = ['/login', '/register', '/register-doctor', '/admin/login'];
  const showNav = !noNavPaths.includes(path);

  const role = profile?.role ?? null;

  function requireRole(allowedRole: string | string[], component: JSX.Element): JSX.Element {
    if (!user) { navigate('/login'); return <PageLoader />; }
    const allowed = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (role && !allowed.includes(role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Access denied.</p>
        </div>
      );
    }
    return component;
  }

  function renderPage() {
    switch (path) {
      case '/':
        return <Landing navigate={navigate} />;
      case '/login':
        return <Login navigate={navigate} />;
      case '/register':
        return <RegisterPatient navigate={navigate} />;
      case '/register-doctor':
        return <RegisterDoctor navigate={navigate} />;
      case '/admin/login':
        return <AdminLogin navigate={navigate} />;

      case '/patient/dashboard':
        return requireRole('patient', <PatientDashboard navigate={navigate} />);
      case '/patient/clinics':
        return requireRole('patient', <BrowseClinics navigate={navigate} setSelectedDoctor={setSelectedDoctor} />);
      case '/patient/clinic-detail':
        return requireRole('patient', <ClinicDetail navigate={navigate} doctor={selectedDoctor} />);
      case '/patient/appointments':
        return requireRole('patient', <MyAppointments navigate={navigate} />);

      case '/doctor/dashboard':
        return requireRole('doctor', <DoctorDashboard navigate={navigate} />);
      case '/doctor/appointments':
        return requireRole('doctor', <DoctorAppointments navigate={navigate} />);
      case '/doctor/profile':
        return requireRole('doctor', <DoctorProfile navigate={navigate} />);

      case '/admin/overview':
        return requireRole('admin', <AdminOverview navigate={navigate} />);
      case '/admin/doctors':
        return requireRole('admin', <AdminDoctors navigate={navigate} />);
      case '/admin/appointments':
        return requireRole('admin', <AdminAppointments navigate={navigate} />);

      default:
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Page not found</p>
              <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold">
                Go Home
              </button>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {showNav && <Navbar navigate={navigate} currentPath={path} />}
      <main className="flex-1">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
