import { useState } from 'react';
import { Cpu } from 'lucide-react';
import CreateProfile from './components/CreateProfile';
import ProfileList from './components/ProfileList';
import ApiReference from './components/ApiReference';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Cpu size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">Profile Intelligence Service</h1>
            <p className="text-xs text-gray-400 mt-0.5">Genderize · Agify · Nationalize</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <ApiReference />
        <CreateProfile onCreated={() => setRefreshKey((k) => k + 1)} />
        <ProfileList refreshKey={refreshKey} />
      </main>
    </div>
  );
}
