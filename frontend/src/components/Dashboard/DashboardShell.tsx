import { useState, useEffect } from 'react';
import { UploadPipeline } from '../calendar/UploadPipeline';
import { PacePilot } from '../pilot/PacePilot';
import { PomodoroTimer } from '../garden/PomodoroTimer';
import { PilotChat } from '../pilot/PilotChat';
import { usePilotChat } from '../pilot/usePilotChat';
import {
  LayoutDashboard, Upload, Search, Bell,
  BookOpen, CalendarClock, BarChart3, Settings,
  Zap, Sparkles, MessageSquare, Moon, Sun,
} from 'lucide-react';

const NAV = [
  { id: 'overview',  label: 'Overview',        icon: LayoutDashboard },
  { id: 'syllabus',  label: 'Syllabus Upload',  icon: Upload },
  { id: 'schedule',  label: 'Schedule',         icon: CalendarClock },
  { id: 'analytics', label: 'Analytics',        icon: BarChart3 },
  { id: 'pilot',     label: 'Pace Pilot',       icon: Sparkles },
];

// Mock upcoming deadlines
const DEADLINES = [
  { course: 'ENV 3210',   type: 'Midterm Exam',   date: 'Apr 10', color: '#ef4444' },
  { course: 'MATH 2401',  type: 'Problem Set 7',  date: 'Apr 12', color: '#f97316' },
  { course: 'ENV 3210',   type: 'Lab Report',     date: 'Apr 15', color: '#8b5cf6' },
  { course: 'CS 3600',    type: 'Project Draft',  date: 'Apr 18', color: '#3b82f6' },
  { course: 'MATH 2401',  type: 'Final Exam',     date: 'May 15', color: '#ef4444' },
];

interface Props { major?: string; }

export const DashboardShell = ({ major = 'Environmental Engineering' }: Props) => {
  const [tab, setTab]             = useState('overview');
  const [studyMode, setStudyMode] = useState(false);
  const [pilotOpen, setPilotOpen] = useState(true);
  const [darkMode, setDarkMode]   = useState(() => {
    const saved = localStorage.getItem('pace-dark');
    return saved ? saved === 'true' : false;
  });
  const pilotChat = usePilotChat();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pace-dark', String(darkMode));
  }, [darkMode]);

  const firstName = 'Atharva';

  return (
    <div className="dash-shell">

      {/* ── Left sidebar ── */}
      <nav className="dash-sidebar">
        <div className="dash-logo">
          <div className="dash-logo-icon">P</div>
          Pace
        </div>

        <span className="sidebar-section-label">Menu</span>
        <div className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`sidebar-nav-btn ${tab === n.id ? 'active' : ''}`}
              onClick={() => setTab(n.id)}
            >
              <n.icon size={16} className="nav-icon" />
              {n.label}
            </button>
          ))}
        </div>

        <span className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Other</span>
        <div className="sidebar-nav">
          <button className="sidebar-nav-btn">
            <Settings size={16} className="nav-icon" /> Settings
          </button>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <span className="sidebar-footer-label">{major.split(' ')[0]}</span>
          <span className="sidebar-footer-sub">15 credits this semester</span>
          <div className="sidebar-bar-wrap">
            <div className="sidebar-bar-fill" style={{ width: '58%' }} />
          </div>
          <span className="sidebar-footer-sub" style={{ marginTop: '0.1rem' }}>58% of semester complete</span>
        </div>
      </nav>

      {/* ── Main ── */}
      <div className="dash-main">

        {/* Top bar */}
        <header className="dash-topbar">
          <div className="topbar-search">
            <Search size={14} color="var(--text-3)" />
            <input placeholder="Search courses, deadlines, notes…" />
          </div>

          <div className="topbar-right">
            <div
              className={`study-mode-pill ${studyMode ? 'on' : ''}`}
              onClick={() => setStudyMode(m => !m)}
              role="button"
            >
              <Zap size={13} />
              Study Mode
              <div className="study-mode-switch" />
            </div>

            <button className="topbar-icon-btn" onClick={() => setDarkMode(d => !d)} title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button className="topbar-icon-btn"><Bell size={15} /></button>

            {/* Pilot panel toggle — only visible when not on the full pilot tab */}
            {tab !== 'pilot' && (
              <button
                className={`topbar-icon-btn${pilotOpen ? ' active' : ''}`}
                onClick={() => setPilotOpen(o => !o)}
                title={pilotOpen ? 'Hide Pilot' : 'Show Pilot'}
              >
                <MessageSquare size={15} />
              </button>
            )}
          </div>
        </header>

        {/* Body */}
        <div className={`dash-body${tab === 'pilot' ? ' dash-body--full' : ''}`}>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="anim-in">
              <h1 className="dash-greeting-title">Hello, {firstName} 👋</h1>
              <p className="dash-greeting-sub">Here's your academic snapshot for today.</p>

              {studyMode && (
                <div className="study-banner">
                  <div className="study-banner-dot" />
                  <span className="study-banner-text">
                    Study Mode is active — Pace Pilot will adjust sessions dynamically based on your schedule.
                  </span>
                </div>
              )}

              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-card-tint" style={{ background: 'var(--tint-blue)' }} />
                  <p className="stat-card-label">Credits</p>
                  <p className="stat-card-value">15</p>
                  <p className="stat-card-change"><span className="pos">Standard load</span></p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-tint" style={{ background: 'var(--tint-purple)' }} />
                  <p className="stat-card-label">Focus Hours</p>
                  <p className="stat-card-value">4.2</p>
                  <p className="stat-card-change">this week <span className="pos">↑ 12%</span></p>
                </div>
                <div className="stat-card">
                  <div className="stat-card-tint" style={{ background: 'var(--tint-amber)' }} />
                  <p className="stat-card-label">Upcoming</p>
                  <p className="stat-card-value">3</p>
                  <p className="stat-card-change">deadlines in <span className="neg">7 days</span></p>
                </div>
              </div>

              <div className="dash-content-row">
                <div className="card">
                  <div className="card-header">
                    <div>
                      <p className="card-title">Focus Garden</p>
                      <p className="card-subtitle">Your growing Pomodoro session</p>
                    </div>
                    <BookOpen size={16} color="var(--text-3)" />
                  </div>
                  <PomodoroTimer major={major} isStudyMode={studyMode} />
                </div>

                <div className="card" style={{ overflow: 'hidden' }}>
                  <div className="card-header">
                    <div>
                      <p className="card-title">Upcoming Deadlines</p>
                      <p className="card-subtitle">{DEADLINES.length} items this semester</p>
                    </div>
                    <CalendarClock size={16} color="var(--text-3)" />
                  </div>
                  <div className="deadline-list">
                    {DEADLINES.map((d, i) => (
                      <div key={i} className="deadline-item">
                        <div className="deadline-dot" style={{ background: d.color }} />
                        <div style={{ flex: 1 }}>
                          <p className="deadline-course">{d.course}</p>
                          <p className="deadline-type">{d.type}</p>
                        </div>
                        <span className="deadline-date">{d.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SYLLABUS ── */}
          {tab === 'syllabus' && (
            <div className="anim-in">
              <UploadPipeline />
            </div>
          )}

          {/* ── PACE PILOT TAB — always mounted to preserve chat history ── */}
          <div style={{ display: tab === 'pilot' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
            <PilotChat isStudyMode={studyMode} {...pilotChat} />
          </div>

          {/* ── PLACEHOLDER TABS ── */}
          {(tab === 'schedule' || tab === 'analytics') && (
            <div className="anim-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '0.75rem', color: 'var(--text-3)' }}>
              <BarChart3 size={48} strokeWidth={1} />
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-2)' }}>Coming soon</p>
              <p style={{ fontSize: '0.85rem' }}>This feature is being built. Upload a syllabus to get started.</p>
            </div>
          )}

        </div>
      </div>

      {/* ── Right pilot panel — hidden on pilot tab ── */}
      {tab !== 'pilot' && (
        <PacePilot
          open={pilotOpen}
          isStudyMode={studyMode}
          onClose={() => setPilotOpen(false)}
          {...pilotChat}
        />
      )}
    </div>
  );
};
