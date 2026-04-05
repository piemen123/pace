import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, TreePine, Building2, Leaf } from 'lucide-react';

interface Props {
  major: string;
  isStudyMode?: boolean;
}

const TOTAL = 25 * 60;

export const PomodoroTimer = ({ major, isStudyMode = false }: Props) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const [isActive, setIsActive] = useState(false);
  const [isWithered, setIsWithered] = useState(false);
  const [growthStage, setGrowthStage] = useState(0); // 0–5

  const elapsed = TOTAL - timeLeft;
  const progress = elapsed / TOTAL; // 0→1
  const r = 60;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  const isCivil = major.toLowerCase().includes('civil');

  const getAsset = () => {
    if (isWithered) return <Leaf size={52 + growthStage * 4} color="#9ca3af" strokeWidth={1.5} />;
    if (isCivil)   return <Building2 size={52 + growthStage * 4} color="var(--text-2)" strokeWidth={1.5} />;
    return <TreePine size={52 + growthStage * 4} color="var(--green)" strokeWidth={1.5} />;
  };

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    if (isActive && timeLeft > 0 && !isWithered) {
      id = setInterval(() => {
        setTimeLeft(t => {
          const next = t - 1;
          if ((TOTAL - next) % 300 === 0) setGrowthStage(s => Math.min(s + 1, 5));
          return next;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => { if (id) clearInterval(id); };
  }, [isActive, timeLeft, isWithered]);

  useEffect(() => {
    const handler = () => {
      if (document.hidden && isActive) {
        setIsActive(false);
        setIsWithered(true);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [isActive]);

  const toggle = () => {
    if (isWithered) {
      if (window.confirm('Your garden withered — you left the app. Reset?')) reset();
      return;
    }
    setIsActive(a => !a);
  };

  const reset = () => {
    setIsActive(false);
    setTimeLeft(TOTAL);
    setGrowthStage(0);
    setIsWithered(false);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  // ring color
  const ringColor = isWithered ? '#d1d5db' : isStudyMode ? '#16a34a' : '#2563eb';

  return (
    <div className="garden-card">
      {/* Ring timer */}
      <div className="timer-ring-wrap">
        <svg viewBox="0 0 150 150">
          <circle className="timer-ring-track" cx="75" cy="75" r={r} />
          <circle
            className="timer-ring-fill"
            cx="75" cy="75" r={r}
            stroke={ringColor}
            style={{ strokeDasharray: circ, strokeDashoffset: offset }}
          />
        </svg>
        <div className="timer-time-overlay">
          <span className="timer-time" style={{ color: ringColor }}>{minutes}:{seconds}</span>
          <span className="timer-label">
            {isWithered ? 'WITHERED' : isActive ? 'FOCUSING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Growing asset */}
      <div className="garden-asset-wrap">{getAsset()}</div>

      <p className="garden-status">
        {isWithered
          ? '⚠️ You left the app — your garden withered.'
          : growthStage === 0
          ? 'Start a session to grow your garden.'
          : `Stage ${growthStage}/5 — keep going!`}
      </p>

      <div className="timer-btn-row">
        <button
          className={`timer-btn-main ${isActive ? 'pausing' : ''}`}
          onClick={toggle}
        >
          {isActive ? <><Pause size={15} /> Pause</> : <><Play size={15} /> {timeLeft === TOTAL ? 'Start' : 'Resume'}</>}
        </button>
        <button className="timer-btn-reset" onClick={reset} title="Reset">
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};
