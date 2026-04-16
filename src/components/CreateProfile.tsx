import { useState } from 'react';
import { UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createProfile, Profile } from '../lib/api';

interface Props {
  onCreated: () => void;
}

export default function CreateProfile({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: number; profile?: Profile; message?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await createProfile(name.trim());
      setResult({
        status: res.status,
        profile: res.body.data,
        message: res.body.message ?? res.body.message,
      });
      if (res.status === 201) {
        onCreated();
        setName('');
      } else if (res.status === 200 && res.body.message === 'Profile already exists') {
        onCreated();
      }
    } catch {
      setResult({ status: 500, message: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = result && (result.status === 201 || result.status === 200);
  const isExisting = result?.status === 200;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <UserPlus size={18} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Enrich a Name</h2>
          <p className="text-xs text-gray-500">POST /api/profiles</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name (e.g. ella, james, sofia)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? 'Processing...' : 'Enrich'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 rounded-xl p-4 ${isSuccess ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            {isSuccess
              ? <CheckCircle size={15} className="text-green-600" />
              : <AlertCircle size={15} className="text-red-500" />}
            <span className={`text-xs font-semibold ${isSuccess ? 'text-green-700' : 'text-red-600'}`}>
              {result.status} {isExisting ? '— Profile already exists' : isSuccess ? '— Profile created' : '— Error'}
            </span>
          </div>
          {result.profile && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {Object.entries(result.profile).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500 font-mono">{k}</span>
                  <span className="text-gray-800 font-medium truncate ml-2 max-w-[160px]">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          {!result.profile && result.message && (
            <p className="text-xs text-red-700">{result.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
