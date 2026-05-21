import { useEffect, useState } from 'react';
import { Calendar, Clock, Trash2, X } from 'lucide-react';
import { supabase, Appointment } from '../../lib/supabase';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import Footer from '../../components/Footer';

interface Props { navigate: (path: string) => void; }

const FILTERS = ['all', 'upcoming', 'confirmed', 'completed', 'cancelled'] as const;
type FilterType = typeof FILTERS[number];

export default function MyAppointments({ navigate }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    const { data } = await supabase.from('appointments')
      .select('*, doctors(*)')
      .order('appointment_date', { ascending: false });
    setAppointments((data as Appointment[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().split('T')[0];

  const filtered = appointments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return a.appointment_date >= today && a.status !== 'cancelled' && a.status !== 'rejected';
    return a.status === filter;
  });

  async function handleCancel() {
    if (!cancelTarget) return;
    setActionLoading(true);
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', cancelTarget.id);
    setCancelTarget(null);
    setActionLoading(false);
    load();
  }

  const canModify = (a: Appointment) =>
    (a.status === 'pending' || a.status === 'confirmed') && a.appointment_date >= today;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage all your bookings</p>
          </div>
          <button onClick={() => navigate('/patient/clinics')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
            + New Appointment
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Calendar className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              {filter !== 'all' ? 'Try a different filter' : 'Book your first appointment'}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('/patient/clinics')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl">
                Find Clinics
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(appt => (
              <div key={appt.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-0">
                  {/* Token sidebar */}
                  <div className="sm:w-24 bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center p-4 sm:flex-col">
                    <div className="text-center">
                      <p className="text-xs opacity-75">Token</p>
                      <p className="text-3xl font-bold">#{appt.token_number}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{appt.doctors?.clinic_name}</h3>
                          <StatusBadge status={appt.status} />
                          {appt.is_emergency && (
                            <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">Emergency</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Dr. {appt.doctors?.full_name} · {appt.doctors?.specialization}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(appt.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          {appt.appointment_time.slice(0, 5)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Patient: <strong className="text-gray-700 dark:text-gray-300">{appt.patient_name}</strong></span>
                      <span>Age: <strong className="text-gray-700 dark:text-gray-300">{appt.patient_age}</strong></span>
                      <span>Gender: <strong className="text-gray-700 dark:text-gray-300 capitalize">{appt.patient_gender}</strong></span>
                    </div>
                    {appt.symptoms && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Reason:</span> {appt.symptoms}
                      </p>
                    )}
                    {appt.estimated_wait_mins > 0 && appt.status !== 'completed' && appt.status !== 'cancelled' && (
                      <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        Estimated wait: ~{appt.estimated_wait_mins} minutes
                      </p>
                    )}

                    {canModify(appt) && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setCancelTarget(appt)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Appointment" size="sm">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-1">Are you sure you want to cancel?</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-6">
            {cancelTarget?.doctors?.clinic_name} on {cancelTarget?.appointment_date}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setCancelTarget(null)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium">Keep</button>
            <button onClick={handleCancel} disabled={actionLoading}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              {actionLoading ? <Spinner size="sm" /> : 'Cancel Appointment'}
            </button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
