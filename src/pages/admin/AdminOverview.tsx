import { useEffect, useState } from 'react';
import { Activity, Calendar, CheckCircle, Clock, Stethoscope, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Spinner from '../../components/Spinner';
import Footer from '../../components/Footer';

interface Props { navigate: (path: string) => void; }

export default function AdminOverview({ navigate }: Props) {
  const [stats, setStats] = useState({
    totalDoctors: 0, pendingDoctors: 0, approvedDoctors: 0,
    totalAppointments: 0, todayAppointments: 0, totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentDoctors, setRecentDoctors] = useState<{ id: string; full_name: string; clinic_name: string; specialization: string; status: string; created_at: string }[]>([]);

  useEffect(() => {
    async function load() {
      const [
        { count: totalDoctors },
        { count: pendingDoctors },
        { count: approvedDoctors },
        { count: totalAppointments },
        { count: totalPatients },
      ] = await Promise.all([
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const { count: todayAppointments } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today);

      setStats({
        totalDoctors: totalDoctors ?? 0,
        pendingDoctors: pendingDoctors ?? 0,
        approvedDoctors: approvedDoctors ?? 0,
        totalAppointments: totalAppointments ?? 0,
        todayAppointments: todayAppointments ?? 0,
        totalPatients: totalPatients ?? 0,
      });

      const { data: docs } = await supabase.from('doctors').select('id,full_name,clinic_name,specialization,status,created_at')
        .order('created_at', { ascending: false }).limit(5);
      setRecentDoctors(docs ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Pending Review', value: stats.pendingDoctors, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Active Doctors', value: stats.approvedDoctors, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
    { label: 'Total Appointments', value: stats.totalAppointments, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: "Today's Appointments", value: stats.todayAppointments, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">ClinicConnect Platform Overview</p>
          </div>
          {stats.pendingDoctors > 0 && (
            <button onClick={() => navigate('/admin/doctors')}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors text-sm">
              <Clock className="w-4 h-4" />
              {stats.pendingDoctors} Pending Review{stats.pendingDoctors > 1 ? 's' : ''}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map(card => (
            <div key={card.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className={`inline-flex items-center justify-center w-10 h-10 ${card.bg} rounded-xl mb-3`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Doctor Registrations</h2>
            <button onClick={() => navigate('/admin/doctors')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">View all</button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentDoctors.map(doc => (
              <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{doc.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{doc.clinic_name} · {doc.specialization}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    doc.status === 'approved' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    doc.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
