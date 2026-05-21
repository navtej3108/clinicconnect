import { useEffect, useState } from 'react';
import { CheckCircle, ExternalLink, FileText, MapPin, Phone, Search, Stethoscope, XCircle } from 'lucide-react';
import { supabase, Doctor } from '../../lib/supabase';
import Spinner from '../../components/Spinner';
import Footer from '../../components/Footer';

interface Props { navigate?: (path: string) => void; }

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const;

export default function AdminDoctors({ navigate: _navigate }: Props) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
    setDoctors((data as Doctor[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setActionLoading(id);
    await supabase.from('doctors').update({ status }).eq('id', id);
    setActionLoading(null);
    load();
  }

  const filtered = doctors.filter(d => {
    if (tab !== 'all' && d.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.full_name.toLowerCase().includes(q) || d.clinic_name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = doctors.filter(d => d.status === 'pending').length;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Doctors</h1>
            {pendingCount > 0 && <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">{pendingCount} application{pendingCount > 1 ? 's' : ''} awaiting review</p>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search doctors, clinics, cities..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm" />
          </div>
          <div className="flex gap-2">
            {STATUS_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  tab === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}>
                {t}
                {t === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Stethoscope className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No doctors found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(doc => (
              <div key={doc.id} className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm overflow-hidden ${
                doc.status === 'pending' ? 'border-amber-200 dark:border-amber-800' : 'border-gray-100 dark:border-gray-800'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-5">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{doc.full_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.status === 'approved' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          doc.status === 'pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>{doc.status}</span>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">{doc.clinic_name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" />{doc.specialization}</span>
                        {doc.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doc.city}, {doc.state}</span>}
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{doc.phone}</span>
                        <span>License #: {doc.license_number}</span>
                      </div>
                      {doc.license_doc_url && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <a href={doc.license_doc_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                            View License Document <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {doc.bio && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{doc.bio}</p>}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Registered: {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {doc.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateStatus(doc.id, 'approved')}
                        disabled={actionLoading === doc.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        {actionLoading === doc.id ? <Spinner size="sm" /> : <CheckCircle className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(doc.id, 'rejected')}
                        disabled={actionLoading === doc.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                  {doc.status === 'approved' && (
                    <button
                      onClick={() => updateStatus(doc.id, 'rejected')}
                      disabled={actionLoading === doc.id}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-red-300 hover:text-red-600 text-sm font-medium rounded-xl transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> Suspend
                    </button>
                  )}
                  {doc.status === 'rejected' && (
                    <button
                      onClick={() => updateStatus(doc.id, 'approved')}
                      disabled={actionLoading === doc.id}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-green-300 hover:text-green-600 text-sm font-medium rounded-xl transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Re-approve
                    </button>
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
