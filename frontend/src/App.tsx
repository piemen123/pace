import './styles/design-system.css';
import './index.css';
import { useState } from 'react';
import { OnboardingFlow } from './components/profile/OnboardingFlow';
import { DashboardShell } from './components/Dashboard/DashboardShell';

const STORAGE_KEY = 'pace_profile';

function App() {
  const [ready, setReady] = useState(() => !!localStorage.getItem(STORAGE_KEY));
  const [major, setMajor] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).major : 'Environmental Engineering';
    } catch { return 'Environmental Engineering'; }
  });

  const handleComplete = (m: string) => {
    setMajor(m);
    setReady(true);
  };

  return ready
    ? <DashboardShell major={major} />
    : <OnboardingFlow onComplete={handleComplete} />;
}

export default App;
