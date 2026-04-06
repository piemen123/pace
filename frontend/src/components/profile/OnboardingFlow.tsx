import { useState } from 'react';
import { createProfile } from '../../services/api';
import {
  BookOpen, Clock, Briefcase, Calendar,
  ArrowRight, ArrowLeft, Sunrise, Sun, Sunset, Moon,
  Coffee, Laptop, Building,
} from 'lucide-react';

interface FormData {
  major: string;
  workload_credits: number;
  employment_status: string;
  schedule_preferences: { preferred_study_time: string; off_days: string[] };
}

const EMPLOYMENT_OPTIONS = [
  { value: 'None',      label: 'Not Working',  icon: <Coffee size={18} /> },
  { value: 'Part-time', label: 'Part-time',     icon: <Laptop size={18} /> },
  { value: 'Full-time', label: 'Full-time',     icon: <Building size={18} /> },
];

const SCHEDULE_OPTIONS = [
  { value: 'Morning',   label: 'Morning',    sub: '6 AM – 12 PM', icon: <Sunrise size={15} /> },
  { value: 'Afternoon', label: 'Afternoon',  sub: '12 – 6 PM',    icon: <Sun size={15} /> },
  { value: 'Evening',   label: 'Evening',    sub: '6 – 11 PM',    icon: <Sunset size={15} /> },
  { value: 'NightOwl',  label: 'Night Owl',  sub: '11 PM – 4 AM', icon: <Moon size={15} /> },
];

const STEP_ICONS = [
  <BookOpen size={20} />,
  <Clock size={20} />,
  <Briefcase size={20} />,
  <Calendar size={20} />,
];

const STEP_TITLES    = ['Your Field',       'Workload',         'Work Status',        'Best Hours'];
const STEP_SUBTITLES = [
  'What are you studying?',
  'How many credits this semester?',
  'Are you working while studying?',
  'When do you focus best?',
];

export const OnboardingFlow = ({ onComplete }: { onComplete: (major: string) => void }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    major: '',
    workload_credits: 15,
    employment_status: 'None',
    schedule_preferences: { preferred_study_time: 'Evening', off_days: [] },
  });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createProfile({ id: generateId(), ...formData });
      onComplete(formData.major);
    } catch (error) {
      console.error(error);
      alert('Could not save profile. Is the backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  const canAdvance = step === 0 ? formData.major.trim().length > 0 : true;

  return (
    <div className="ob-wrap">
      <div className="ob-card">

        {/* Brand */}
        <div className="ob-brand">
          <div className="ob-brand-dot">P</div>
          <span>Pace</span>
        </div>

        {/* Step pills */}
        <div className="ob-steps">
          {[0,1,2,3].map(i => (
            <div
              key={i}
              className={`ob-step-pill ${i < step ? 'done' : i === step ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Step icon */}
        <div className="ob-icon-wrap">{STEP_ICONS[step]}</div>
        <h2 className="ob-title">{STEP_TITLES[step]}</h2>
        <p className="ob-subtitle">{STEP_SUBTITLES[step]}</p>

        {/* Step 0 — Major */}
        {step === 0 && (
          <>
            <label className="ob-label">Major / Field of Study</label>
            <input
              className="ob-input"
              type="text"
              placeholder="e.g. Environmental Engineering"
              value={formData.major}
              onChange={e => setFormData({ ...formData, major: e.target.value })}
              autoFocus
            />
          </>
        )}

        {/* Step 1 — Credits */}
        {step === 1 && (
          <>
            <label className="ob-label">Credit Hours</label>
            <div className="ob-credit-display">
              <span className="ob-credit-num">{formData.workload_credits}</span>
              <input
                type="range"
                className="ob-range"
                min={1} max={30}
                value={formData.workload_credits}
                onChange={e => setFormData({ ...formData, workload_credits: parseInt(e.target.value) })}
              />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.75rem' }}>
              {formData.workload_credits <= 12 ? 'Part-time load — you have breathing room.' :
               formData.workload_credits <= 18 ? 'Standard full-time load.' :
               'Heavy load — we\'ll optimise your schedule carefully.'}
            </p>
          </>
        )}

        {/* Step 2 — Employment */}
        {step === 2 && (
          <div className="ob-employment-grid">
            {EMPLOYMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`ob-emp-btn ${formData.employment_status === opt.value ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, employment_status: opt.value })}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — Schedule */}
        {step === 3 && (
          <div className="ob-schedule-grid">
            {SCHEDULE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`ob-sch-btn ${formData.schedule_preferences.preferred_study_time === opt.value ? 'selected' : ''}`}
                onClick={() => setFormData({
                  ...formData,
                  schedule_preferences: { ...formData.schedule_preferences, preferred_study_time: opt.value }
                })}
              >
                {opt.icon}
                <span>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>{opt.label}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 400 }}>{opt.sub}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="ob-footer">
          <span className="ob-step-label">Step {step + 1} of 4</span>
          <div className="ob-footer-btns">
            {step > 0 && (
              <button className="btn-ghost" onClick={handlePrev}>
                <ArrowLeft size={15} /> Back
              </button>
            )}
            {step < 3 ? (
              <button className="btn-primary-ob" onClick={handleNext} disabled={!canAdvance}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button className="btn-primary-ob" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving…' : 'Launch Pace'} <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
