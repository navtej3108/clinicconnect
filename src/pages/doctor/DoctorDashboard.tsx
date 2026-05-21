import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Appointment, Doctor } from '../../lib/supabase';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Footer from '../../components/Footer';

interface Props { navigate: (path: string) => void; }

export default function DoctorDashboard({ navigate }: Props) {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: doc } = await supabase.from('doctors').select('*').eq('user_id', user!.id).maybeSingle();
      setDoctor(doc as Doctor);
      if (doc) {
        const { data: appts } = await supabase.from('appointments').select('*')
          .eq('doctor_id', doc.id).order('appointment_date', { ascending: false }).limit(20);
        setAppointments((appts as Appointment[]) ?? []);
      }
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Spinner size="lg" /></div>;

  if (doctor?.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Under Review</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Your doctor account is being verified. Our admin team will review your license and activate your account within 24–48 hours.
          </p>
        </div>
      </div>
    );
  }

  if (doctor?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-900 rounded-2xl p-10 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registration Rejected</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Your registration was not approved. Please contact support for assistance.</p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.appointment_date === today);
  const upcomingAppts = appointments.filter(a => a.appointment_date >= today && (a.status === 'pending' || a.status === 'confirmed'));
  const completedAppts = appointments.filter(a => a.status === 'completed');
  const emergencies = appointments.filter(a => a.is_emergency && (a.status === 'pending' || a.status === 'confirmed'));

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Upcoming Total', value: upcomingAppts.length, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Completed', value: completedAppts.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Emergencies', value: emergencies.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}, Dr. {doctor?.full_name?.split(' ').slice(-1)[0]}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{doctor?.clinic_name} · {doctor?.specialization}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/doctor/appointments')}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors">
              View All
            </button>
            <button onClick={() => navigate('/doctor/profile')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
              Manage Profile
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className={`inline-flex items-center justify-center w-10 h-10 ${stat.bg} rounded-xl mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Emergency alerts */}
        {emergencies.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                {emergencies.length} emergency appointment{emergencies.length > 1 ? 's' : ''} pending attention
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                Patients: {emergencies.map(e => e.patient_name).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Today's schedule */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Today's Schedule</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>

          {todayAppts.length === 0 ? (
            <div className="text-center py-14">
              <Calendar className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments today</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Your schedule is clear for today</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {todayAppts.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)).map(appt => (
                <div key={appt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    #{appt.token_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{appt.patient_name}</p>
                      {appt.is_emergency && <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded">Emergency</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Age {appt.patient_age} · {appt.patient_gender}</p>
                    {appt.symptoms && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{appt.symptoms}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{appt.appointment_time.slice(0, 5)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={appt.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
