import { useEffect, useState } from 'react';
import { Calendar, Clock, Search } from 'lucide-react';
import { supabase, Appointment } from '../../lib/supabase';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Footer from '../../components/Footer';

interface Props { navigate?: (path: string) => void; }

interface AppointmentWithDoctor extends Omit<Appointment, 'doctors'> {
  doctors: { full_name: string; clinic_name: string; specialization: string };
}

export default function AdminAppointments({ navigate: _navigate }: Props) {
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('appointments').select('*, doctors(full_name, clinic_name, specialization)')
        .order('appointment_date', { ascending: false }).limit(100);
      setAppointments((data as AppointmentWithDoctor[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = appointments.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (dateFilter && a.appointment_date !== dateFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.patient_name.toLowerCase().includes(q) ||
        a.doctors?.clinic_name?.toLowerCase().includes(q) ||
        a.doctors?.full_name?.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Appointments</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patients or clinics..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" />
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" />
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{filtered.length} appointments</p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Calendar className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {['Token', 'Patient', 'Doctor / Clinic', 'Date & Time', 'Status', 'Emergency'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtered.map(appt => (
                    <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                          #{appt.token_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{appt.patient_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Age {appt.patient_age} · {appt.patient_gender}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-white">{appt.doctors?.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{appt.doctors?.clinic_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                          <Calendar className="w-3 h-3" />
                          {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {appt.appointment_time.slice(0, 5)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="px-4 py-3">
                        {appt.is_emergency && (
                          <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">Yes</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
