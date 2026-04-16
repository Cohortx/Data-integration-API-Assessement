import { ExternalLink } from 'lucide-react';

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const endpoints = [
  { method: 'POST', path: '/api/profiles', color: 'bg-blue-100 text-blue-700', desc: 'Enrich a name and create a profile' },
  { method: 'GET', path: '/api/profiles', color: 'bg-teal-100 text-teal-700', desc: 'List all profiles with optional filters' },
  { method: 'GET', path: '/api/profiles/:id', color: 'bg-teal-100 text-teal-700', desc: 'Get a single profile by ID' },
  { method: 'DELETE', path: '/api/profiles/:id', color: 'bg-red-100 text-red-700', desc: 'Delete a profile by ID' },
];

const externalApis = [
  { name: 'Genderize', url: 'https://api.genderize.io' },
  { name: 'Agify', url: 'https://api.agify.io' },
  { name: 'Nationalize', url: 'https://api.nationalize.io' },
];

export default function ApiReference() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">API Reference</h2>
      <p className="text-xs text-gray-500 mb-4 font-mono break-all">{BASE}</p>

      <div className="space-y-2 mb-6">
        {endpoints.map((e) => (
          <div key={e.method + e.path} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md shrink-0 ${e.color}`}>{e.method}</span>
            <span className="text-xs font-mono text-gray-700 shrink-0">{e.path}</span>
            <span className="text-xs text-gray-400 hidden sm:block">{e.desc}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">External APIs</p>
        <div className="flex flex-wrap gap-2">
          {externalApis.map((a) => (
            <span key={a.name} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <ExternalLink size={11} />
              {a.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
