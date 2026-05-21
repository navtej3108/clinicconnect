import { useEffect, useState, FormEvent } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, AlertTriangle } from 'lucide-react';
import { supabase, Doctor, DoctorAvailability } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../../components/StarRating';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import Footer from '../../components/Footer';

interface Props {
  navigate: (path: string) => void;
  doctor: Doctor | null;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function generateTimeSlots(start: string, end: string, durationMins: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + durationMins <= endMin) {
    const h = Math.floor(cur / 60).toString().padStart(2, '0');
    const m = (cur % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    cur += durationMins;
  }
  return slots;
}

export default function ClinicDetail({ navigate, doctor }: Props) {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [_bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookModal, setBookModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient_name: '', patient_age: '', patient_gender: 'male', symptoms: '',
    is_emergency: false, selected_slot: '',
  });
  const [confirmation, setConfirmation] = useState<{ token: number; time: string; wait: number } | null>(null);

  useEffect(() => {
    if (!doctor) return;
    async function load() {
      const { data } = await supabase.from('doctor_availability').select('*').eq('doctor_id', doctor!.id).eq('is_active', true);
      setAvailability((data as DoctorAvailability[]) ?? []);
    }
    load();
  }, [doctor]);

  useEffect(() => {
    if (!selectedDate || !doctor) { setAvailableSlots([]); return; }
    const dayOfWeek = new Date(selectedDate + 'T12:00:00').getDay();
    const avail = availability.find(a => a.day_of_week === dayOfWeek);
    if (!avail) { setAvailableSlots([]); return; }

    async function loadBooked() {
      const { data } = await supabase.from('appointments').select('appointment_time')
        .eq('doctor_id', doctor!.id).eq('appointment_date', selectedDate)
        .not('status', 'in', '(cancelled,rejected)');
      const taken = (data ?? []).map((a: { appointment_time: string }) => a.appointment_time.slice(0, 5));
      setBookedSlots(taken);
      const all = generateTimeSlots(avail!.start_time, avail!.end_time, doctor!.consultation_duration_mins);
      setAvailableSlots(all.filter(s => !taken.includes(s)));
    }
    loadBooked();
  }, [selectedDate, availability, doctor]);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    if (!doctor || !form.selected_slot || !selectedDate) return;
    setLoading(true);

    const { data: existing } = await supabase.from('appointments').select('token_number')
      .eq('doctor_id', doctor.id).eq('appointment_date', selectedDate)
      .not('status', 'in', '(cancelled,rejected)').order('token_number', { ascending: false }).limit(1);

    const lastToken = existing?.[0]?.token_number ?? 0;
    const tokenNumber = lastToken + 1;
    const estimatedWait = (tokenNumber - 1) * doctor.consultation_duration_mins;

    const { error } = await supabase.from('appointments').insert({
      doctor_id: doctor.id,
      patient_id: user!.id,
      patient_name: form.patient_name,
      patient_age: parseInt(form.patient_age),
      patient_gender: form.patient_gender,
      symptoms: form.symptoms,
      appointment_date: selectedDate,
      appointment_time: form.selected_slot + ':00',
      token_number: tokenNumber,
      estimated_wait_mins: estimatedWait,
      is_emergency: form.is_emergency,
      status: 'confirmed',
    });

    setLoading(false);
    if (!error) {
      setConfirmation({ token: tokenNumber, time: form.selected_slot, wait: estimatedWait });
      setBookModal(false);
      setSuccessModal(true);
    }
  }

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">No clinic selected.</p>
          <button onClick={() => navigate('/patient/clinics')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm">Back to Clinics</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <button onClick={() => navigate('/patient/clinics')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Clinics
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
          <div className="relative h-48 sm:h-64">
            <img
              src="https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt={doctor.clinic_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-2">
                {doctor.specialization}
              </span>
              <h1 className="text-2xl font-bold">{doctor.clinic_name}</h1>
              <p className="text-white/80 text-sm">{doctor.full_name}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <StarRating rating={doctor.rating} size="md" />
              <span className="text-sm text-gray-500 dark:text-gray-400">({doctor.review_count} reviews)</span>
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" /> {doctor.consultation_duration_mins} min slots
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{doctor.address}, {doctor.city}, {doctor.state}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{doctor.phone}</span>
              </div>
            </div>

            {doctor.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{doctor.bio}</p>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Working Hours</h2>
          {availability.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No schedule set yet</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {availability.map(a => (
                <div key={a.id} className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">{DAY_NAMES[a.day_of_week]}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Book an Appointment</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Date</label>
            <input type="date" min={minDate} max={maxDate} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setForm(f => ({ ...f, selected_slot: '' })); }}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>

          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Slots {availableSlots.length > 0 && <span className="text-gray-400 font-normal">({availableSlots.length} available)</span>}
              </label>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center bg-gray-50 dark:bg-gray-800 rounded-xl">
                  No available slots for this date
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setForm(f => ({ ...f, selected_slot: slot }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        form.selected_slot === slot
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => { if (user) setBookModal(true); else navigate('/login'); }}
            disabled={!selectedDate || !form.selected_slot}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {user ? 'Confirm & Book' : 'Sign In to Book'}
          </button>
        </div>
      </div>

      {/* Book Modal */}
      <Modal open={bookModal} onClose={() => setBookModal(false)} title="Complete Booking" size="md">
        <form onSubmit={handleBook} className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm text-blue-700 dark:text-blue-400">
            <strong>{doctor.clinic_name}</strong> · {selectedDate} at {form.selected_slot}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient Name</label>
              <input type="text" value={form.patient_name} onChange={set('patient_name')} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
              <input type="number" value={form.patient_age} onChange={set('patient_age')} required min="1" max="120"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Age" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
              <select value={form.patient_gender} onChange={set('patient_gender')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symptoms / Reason for Visit</label>
              <textarea value={form.symptoms} onChange={set('symptoms')} required rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Describe your symptoms..." />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={form.is_emergency} onChange={e => setForm(f => ({ ...f, is_emergency: e.target.checked }))}
                    className="sr-only" />
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.is_emergency ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${form.is_emergency ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className={`w-4 h-4 ${form.is_emergency ? 'text-red-500' : 'text-gray-400'}`} />
                  <span className={form.is_emergency ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                    Emergency appointment
                  </span>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : 'Confirm Appointment'}
          </button>
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal open={successModal} onClose={() => { setSuccessModal(false); navigate('/patient/appointments'); }} title="Appointment Confirmed!">
        {confirmation && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <div className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">#{confirmation.token}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Your Token Number</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400">Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">{confirmation.time}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400">Clinic</p>
                <p className="font-semibold text-gray-900 dark:text-white truncate">{doctor.clinic_name}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-gray-500 dark:text-gray-400">Est. Wait</p>
                <p className="font-semibold text-gray-900 dark:text-white">~{confirmation.wait} mins</p>
              </div>
            </div>
            <button
              onClick={() => { setSuccessModal(false); navigate('/patient/appointments'); }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              View My Appointments
            </button>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
