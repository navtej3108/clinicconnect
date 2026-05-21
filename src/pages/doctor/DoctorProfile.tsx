import { useEffect, useState, FormEvent } from 'react';
import { Building2, Clock, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Doctor, DoctorAvailability } from '../../lib/supabase';
import Spinner from '../../components/Spinner';
import Footer from '../../components/Footer';

interface Props { navigate?: (path: string) => void; }

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SPECIALIZATIONS = ['General', 'Dental', 'Dermatology', 'ENT', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Ophthalmology', 'Gynecology', 'Neurology', 'Psychiatry', 'Urology'];

export default function DoctorProfile({ navigate: _navigate }: Props) {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<Partial<DoctorAvailability>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveAvail, setSaveAvail] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: doc } = await supabase.from('doctors').select('*').eq('user_id', user!.id).maybeSingle();
      setDoctor(doc as Doctor);
      if (doc) {
        const { data: avail } = await supabase.from('doctor_availability').select('*').eq('doctor_id', doc.id);
        const existing = (avail as DoctorAvailability[]) ?? [];
        // Fill all 7 days
        const full = Array.from({ length: 7 }, (_, i) => {
          const found = existing.find(a => a.day_of_week === i);
          return found ?? { doctor_id: doc.id, day_of_week: i, start_time: '09:00', end_time: '17:00', max_slots: 20, is_active: false };
        });
        setAvailability(full);
      }
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!doctor) return;
    setSaving(true);
    await supabase.from('doctors').update({
      full_name: doctor.full_name,
      clinic_name: doctor.clinic_name,
      specialization: doctor.specialization,
      phone: doctor.phone,
      address: doctor.address,
      city: doctor.city,
      state: doctor.state,
      bio: doctor.bio,
      consultation_duration_mins: doctor.consultation_duration_mins,
    }).eq('id', doctor.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleSaveAvailability() {
    if (!doctor) return;
    setSaveAvail(true);
    for (const avail of availability) {
      if (!avail.id) {
        if (avail.is_active) {
          await supabase.from('doctor_availability').upsert({
            doctor_id: doctor.id,
            day_of_week: avail.day_of_week,
            start_time: avail.start_time,
            end_time: avail.end_time,
            max_slots: avail.max_slots ?? 20,
            is_active: true,
          }, { onConflict: 'doctor_id,day_of_week' });
        }
      } else {
        await supabase.from('doctor_availability').update({
          start_time: avail.start_time,
          end_time: avail.end_time,
          max_slots: avail.max_slots,
          is_active: avail.is_active,
        }).eq('id', avail.id);
      }
    }
    setSaveAvail(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateAvail(dayIdx: number, key: keyof DoctorAvailability, value: string | number | boolean) {
    setAvailability(prev => prev.map((a, i) => i === dayIdx ? { ...a, [key]: value } : a));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Spinner size="lg" /></div>;
  if (!doctor) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">No doctor profile found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clinic Profile</h1>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium animate-pulse">
              <Save className="w-4 h-4" /> Saved!
            </div>
          )}
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Clinic Information
          </h2>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" value={doctor.full_name} onChange={e => setDoctor(d => d ? { ...d, full_name: e.target.value } : d)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clinic Name</label>
              <input type="text" value={doctor.clinic_name} onChange={e => setDoctor(d => d ? { ...d, clinic_name: e.target.value } : d)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
              <select value={doctor.specialization} onChange={e => setDoctor(d => d ? { ...d, specialization: e.target.value } : d)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="tel" value={doctor.phone} onChange={e => setDoctor(d => d ? { ...d, phone: e.target.value } : d)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consultation Duration (mins)</label>
              <select value={doctor.consultation_duration_mins} onChange={e => setDoctor(d => d ? { ...d, consultation_duration_mins: parseInt(e.target.value) } : d)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                {[10, 15, 20, 25, 30, 45, 60].map(n => <option key={n} value={n}>{n} minutes</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input type="text" value={doctor.address} onChange={e => setDoctor(d => d ? { ...d, address: e.target.value } : d)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input type="text" value={doctor.city} onChange={e => setDoctor(d => d ? { ...d, city: e.target.value } : d)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
              <input type="text" value={doctor.state} onChange={e => setDoctor(d => d ? { ...d, state: e.target.value } : d)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea value={doctor.bio} onChange={e => setDoctor(d => d ? { ...d, bio: e.target.value } : d)} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
                {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Availability */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" /> Weekly Schedule
          </h2>
          <div className="space-y-3">
            {availability.map((avail, idx) => (
              <div key={idx} className={`flex flex-wrap items-center gap-4 p-4 rounded-xl transition-colors ${avail.is_active ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900' : 'bg-gray-50 dark:bg-gray-800 border border-transparent'}`}>
                <label className="flex items-center gap-2 w-28 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" checked={avail.is_active ?? false} onChange={e => updateAvail(idx, 'is_active', e.target.checked)} className="sr-only" />
                    <div className={`w-9 h-5 rounded-full transition-colors ${avail.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${avail.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${avail.is_active ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {DAY_NAMES[idx]}
                  </span>
                </label>
                {avail.is_active && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">From</span>
                      <input type="time" value={avail.start_time?.slice(0, 5) ?? '09:00'} onChange={e => updateAvail(idx, 'start_time', e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">To</span>
                      <input type="time" value={avail.end_time?.slice(0, 5) ?? '17:00'} onChange={e => updateAvail(idx, 'end_time', e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Max slots</span>
                      <input type="number" value={avail.max_slots ?? 20} min="1" max="100" onChange={e => updateAvail(idx, 'max_slots', parseInt(e.target.value))}
                        className="w-20 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={handleSaveAvailability} disabled={saveAvail}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
              {saveAvail ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
              Save Schedule
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
