import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, Plus, Stethoscope, TrendingUp, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Appointment } from '../../lib/supabase';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Footer from '../../components/Footer';

interface Props { navigate: (path: string) => void; }

export default function PatientDashboard({ navigate }: Props) {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('appointments')
        .select('*, doctors(*)')
        .order('appointment_date', { ascending: false })
        .limit(10);
      setAppointments((data as Appointment[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.appointment_date >= today && a.status !== 'cancelled' && a.status !== 'rejected');
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected');

  const stats = [
    { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Cancelled', value: cancelled.length, icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' },
    { label: 'Total Visits', value: appointments.length, icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {greeting}, {profile?.full_name?.split(' ')[0] ?? 'there'}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your health appointments</p>
          </div>
          <button
            onClick={() => navigate('/patient/clinics')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
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

        {/* Upcoming appointments */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h2>
            <button onClick={() => navigate('/patient/appointments')} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              View all
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-14">
              <Stethoscope className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No upcoming appointments</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Find a clinic and book your first appointment</p>
              <button onClick={() => navigate('/patient/clinics')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Find Clinics
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {upcoming.slice(0, 5).map(appt => (
                <div key={appt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {appt.doctors?.clinic_name ?? 'Clinic'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Dr. {appt.doctors?.full_name} · {appt.doctors?.specialization}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {appt.appointment_time.slice(0, 5)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={appt.status} />
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold">
                      #{appt.token_number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/patient/clinics')}
            className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 transition-colors text-left shadow-sm">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Find Clinics</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Browse by specialization or location</p>
            </div>
          </button>
          <button onClick={() => navigate('/patient/appointments')}
            className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 transition-colors text-left shadow-sm">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">My Appointments</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View history, cancel or reschedule</p>
            </div>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
