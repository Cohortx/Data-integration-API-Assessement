import { useEffect, useState } from 'react';
import { X, Loader2, User } from 'lucide-react';
import { getProfile, Profile } from '../lib/api';

interface Props {
  id: string;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  name: 'Name',
  gender: 'Gender',
  gender_probability: 'Gender Probability',
  sample_size: 'Sample Size',
  age: 'Age',
  age_group: 'Age Group',
  country_id: 'Country ID',
  country_probability: 'Country Probability',
  created_at: 'Created At',
};

export default function ProfileDetailModal({ id, onClose }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile(id).then((res) => {
      if (res.status === 200 && res.body.data) {
        setProfile(res.body.data);
      } else {
        setError(res.body.message ?? 'Profile not found');
      }
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Profile Detail</h3>
              <p className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
          {error && <p className="text-sm text-red-500 text-center py-4">{error}</p>}
          {profile && (
            <div className="space-y-2.5">
              {Object.entries(profile).map(([key, value]) => (
                <div key={key} className="flex justify-between items-start gap-4">
                  <span className="text-xs text-gray-500 shrink-0 w-36">{FIELD_LABELS[key] ?? key}</span>
                  <span className="text-xs text-gray-800 font-medium text-right break-all">
                    {key === 'gender_probability' || key === 'country_probability'
                      ? `${(Number(value) * 100).toFixed(1)}%`
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
