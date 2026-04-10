import './styles/design-system.css';
import './index.css';
import { useState } from 'react';
import { OnboardingFlow } from './components/profile/OnboardingFlow';
import { DashboardShell } from './components/Dashboard/DashboardShell';

const STORAGE_KEY = 'pace_profile';

function App() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const [ready, setReady] = useState(!!saved);
  const [major, setMajor] = useState(() => {
    try { return saved ? JSON.parse(saved).major : 'Environmental Engineering'; }
    catch { return 'Environmental Engineering'; }
  });

  const handleComplete = (m?: string) => {
    if (m) setMajor(m);
    setReady(true);
  };

  return ready
    ? <DashboardShell major={major} />
    : <OnboardingFlow onComplete={handleComplete as any} />;
}

export default App;
