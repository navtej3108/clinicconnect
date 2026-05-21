import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, Search, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Appointment, Doctor } from '../../lib/supabase';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Footer from '../../components/Footer';

interface Props { navigate?: (path: string) => void; }

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

export default function DoctorAppointments({ navigate: _navigate }: Props) {
  const { user } = useAuth();
  const [_doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  async function load() {
    const { data: doc } = await supabase.from('doctors').select('*').eq('user_id', user!.id).maybeSingle();
    setDoctor(doc as Doctor);
    if (doc) {
      const { data } = await supabase.from('appointments').select('*')
        .eq('doctor_id', doc.id).order('appointment_date', { ascending: false });
      setAppointments((data as Appointment[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { if (user) load(); }, [user]);

  async function updateStatus(id: string, status: string) {
    setActionLoading(id);
    await supabase.from('appointments').update({ status }).eq('id', id);
    setActionLoading(null);
    load();
  }

  const filtered = appointments.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (dateFilter && a.appointment_date !== dateFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.patient_name.toLowerCase().includes(q) || a.symptoms.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Patient Appointments</h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Calendar className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(appt => (
              <div key={appt.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400 font-bold text-sm">
                      #{appt.token_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{appt.patient_name}</h3>
                        <StatusBadge status={appt.status} />
                        {appt.is_emergency && (
                          <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">Emergency</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span>Age: {appt.patient_age}</span>
                        <span className="capitalize">Gender: {appt.patient_gender}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appt.appointment_time.slice(0, 5)}
                        </div>
                      </div>
                      {appt.symptoms && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Symptoms: </span>{appt.symptoms}
                        </div>
                      )}
                      {appt.notes && (
                        <div className="mt-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
                          <span className="font-medium">Notes: </span>{appt.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {(appt.status === 'pending' || appt.status === 'confirmed') && (
                    <div className="flex gap-2 flex-shrink-0">
                      {appt.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(appt.id, 'confirmed')}
                          disabled={actionLoading === appt.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                          {actionLoading === appt.id ? <Spinner size="sm" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Confirm
                        </button>
                      )}
                      {appt.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(appt.id, 'completed')}
                          disabled={actionLoading === appt.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                          {actionLoading === appt.id ? <Spinner size="sm" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(appt.id, 'rejected')}
                        disabled={actionLoading === appt.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
