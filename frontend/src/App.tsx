import './styles/design-system.css';
import './index.css';
import { useState } from 'react';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { DashboardShell } from './components/Dashboard/DashboardShell';

function App() {
  const [ready, setReady] = useState(false);
  const [major, setMajor]   = useState('Environmental Engineering');

  // We store the major so the dashboard personalises the Focus Garden
  const handleComplete = (m?: string) => {
    if (m) setMajor(m);
    setReady(true);
  };

  return ready
    ? <DashboardShell major={major} />
    : <OnboardingFlow onComplete={handleComplete as any} />;
}

export default App;
