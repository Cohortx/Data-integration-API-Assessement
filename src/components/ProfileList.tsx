import { useState, useEffect, useCallback } from 'react';
import { Users, Filter, Trash2, Eye, Loader2, RefreshCw } from 'lucide-react';
import { listProfiles, deleteProfile, ProfileSummary } from '../lib/api';
import ProfileDetailModal from './ProfileDetailModal';

interface Props {
  refreshKey: number;
}

const AGE_GROUPS = ['', 'child', 'teenager', 'adult', 'senior'];

export default function ProfileList({ refreshKey }: Props) {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ gender: '', country_id: '', age_group: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProfiles({
        gender: filters.gender || undefined,
        country_id: filters.country_id || undefined,
        age_group: filters.age_group || undefined,
      });
      setProfiles(res.body.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load, refreshKey]);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteProfile(id);
      setProfiles((p) => p.filter((x) => x.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const genderBadge = (g: string) => {
    if (g === 'male') return 'bg-blue-50 text-blue-700';
    if (g === 'female') return 'bg-pink-50 text-pink-700';
    return 'bg-gray-100 text-gray-600';
  };

  const ageBadge = (g: string) => {
    const map: Record<string, string> = {
      child: 'bg-yellow-50 text-yellow-700',
      teenager: 'bg-orange-50 text-orange-700',
      adult: 'bg-teal-50 text-teal-700',
      senior: 'bg-slate-100 text-slate-600',
    };
    return map[g] ?? 'bg-gray-100 text-gray-600';
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">All Profiles</h2>
              <p className="text-xs text-gray-500">GET /api/profiles</p>
            </div>
          </div>
          <button
            onClick={load}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Filter size={13} />
            <span className="text-xs">Filters:</span>
          </div>
          <input
            type="text"
            placeholder="gender"
            value={filters.gender}
            onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
          />
          <input
            type="text"
            placeholder="country_id"
            value={filters.country_id}
            onChange={(e) => setFilters((f) => ({ ...f, country_id: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
          />
          <select
            value={filters.age_group}
            onChange={(e) => setFilters((f) => ({ ...f, age_group: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {AGE_GROUPS.map((g) => (
              <option key={g} value={g}>{g || 'age_group'}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No profiles found</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-3">{profiles.length} result{profiles.length !== 1 ? 's' : ''}</p>
            {profiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0 uppercase">
                    {p.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 capitalize">{p.name}</p>
                    <p className="text-xs text-gray-400 font-mono truncate">{p.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${genderBadge(p.gender)}`}>{p.gender}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ageBadge(p.age_group)}`}>{p.age_group}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{p.country_id}</span>
                  <span className="text-xs text-gray-500 w-6 text-right">{p.age}</span>
                  <button
                    onClick={() => setSelectedId(p.id)}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="View details"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Delete profile"
                  >
                    {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedId && (
        <ProfileDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
