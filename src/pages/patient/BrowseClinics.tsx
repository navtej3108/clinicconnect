import { useEffect, useState } from 'react';
import { Filter, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { supabase, Doctor } from '../../lib/supabase';
import DoctorCard from '../../components/DoctorCard';
import Spinner from '../../components/Spinner';
import Footer from '../../components/Footer';

interface Props {
  navigate: (path: string) => void;
  setSelectedDoctor: (d: Doctor) => void;
}

const SPECIALIZATIONS = ['All', 'General', 'Dental', 'Dermatology', 'ENT', 'Pediatrics', 'Cardiology', 'Orthopedics', 'Ophthalmology', 'Gynecology', 'Neurology'];
const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'review_count', label: 'Most Reviewed' },
  { value: 'full_name', label: 'Name A-Z' },
];

export default function BrowseClinics({ navigate, setSelectedDoctor }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const [sort, setSort] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('doctors').select('*').eq('status', 'approved');
      setDoctors((data as Doctor[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = [...doctors];
    if (spec !== 'All') result = result.filter(d => d.specialization === spec);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.full_name.toLowerCase().includes(q) ||
        d.clinic_name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'review_count') return b.review_count - a.review_count;
      return a.full_name.localeCompare(b.full_name);
    });
    setFiltered(result);
  }, [doctors, search, spec, sort]);

  function handleDoctorClick(doctor: Doctor) {
    setSelectedDoctor(doctor);
    navigate('/patient/clinic-detail');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Hero search */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">Find Your Perfect Clinic</h1>
          <div className="max-w-2xl mx-auto flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by doctor, clinic, city, or specialization..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`px-4 py-3.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors ${showFilters ? 'bg-white text-blue-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Filters bar */}
        <div className={`mb-6 overflow-hidden transition-all ${showFilters ? 'max-h-40' : 'max-h-0'}`}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sort by</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Specialization chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {SPECIALIZATIONS.map(s => (
            <button
              key={s}
              onClick={() => setSpec(s)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                spec === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Loading...' : `${filtered.length} clinic${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          {spec !== 'All' && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Filter className="w-4 h-4" />
              <span>{spec}</span>
              <button onClick={() => setSpec('All')} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No clinics found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} onClick={handleDoctorClick} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
