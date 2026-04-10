import { useRef, useEffect } from 'react';
import { Send, Sparkles, Zap, Clock, Brain, BookOpen, X, RotateCcw } from 'lucide-react';
import Markdown from 'react-markdown';
import type { Msg } from './usePilotChat';

const QUICK_PROMPTS = [
  { icon: <Brain size={13} />,    label: 'I have an upcoming exam' },
  { icon: <Clock size={13} />,    label: 'Help me plan my week'    },
  { icon: <BookOpen size={13} />, label: 'Give me study tips'      },
];

interface Props {
  open: boolean;
  isStudyMode: boolean;
  messages: Msg[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  send: (override?: string) => void;
  retry: (userText: string) => void;
  onClose: () => void;
}

export const PacePilot = ({ open, isStudyMode, messages, input, setInput, loading, send, retry, onClose }: Props) => {
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Reset textarea height after a message is sent
  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const hasUserMsg = messages.some(m => m.role === 'user');

  return (
    <div className={`pilot-panel-wrap${open ? '' : ' pilot-panel-wrap--closed'}`}>
    <aside className="pilot-panel">

      {/* ── Header ── */}
      <div className="pilot-header">
        <div className="pilot-avatar-lg">
          <Sparkles size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pilot-title">Pace Pilot</div>
          <div className="pilot-status">
            <div className={`pilot-status-dot${isStudyMode ? ' active' : ''}`} />
            {isStudyMode ? 'Monitoring session' : 'Ready to help'}
          </div>
        </div>
        {isStudyMode && (
          <div className="pilot-mode-badge">
            <Zap size={11} /> Live
          </div>
        )}
        <button className="pilot-close-btn" onClick={onClose} title="Hide Pilot">
          <X size={14} />
        </button>
      </div>

      {/* ── Study mode strip ── */}
      {isStudyMode && (
        <div className="pilot-study-strip">
          <div className="pilot-study-strip-dot" />
          <span>Study Mode active — recommendations tailored to your session</span>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="pilot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`pilot-msg-row ${m.role}`}>
            {m.role === 'bot' && (
              <div className="pilot-msg-avatar">
                <Sparkles size={10} />
              </div>
            )}
            <div className="pilot-msg-col">
              <div className={`pilot-msg ${m.role}`}>
                {m.role === 'bot'
                  ? <Markdown>{m.text}</Markdown>
                  : m.text}
              </div>
              {m.failed && m.retryText && (
                <button className="pilot-retry-btn" onClick={() => retry(m.retryText!)}>
                  <RotateCcw size={11} /> Retry
                </button>
              )}
              <span className="pilot-msg-ts">{m.ts}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="pilot-msg-row bot">
            <div className="pilot-msg-avatar">
              <Sparkles size={10} />
            </div>
            <div className="pilot-typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick prompts ── */}
      {!hasUserMsg && (
        <div className="pilot-chips">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p.label}
              className="pilot-chip"
              onClick={() => send(p.label)}
              disabled={loading}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="pilot-input-wrap">
        <div className="pilot-input-row">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isStudyMode ? 'Ask about your session…' : 'Ask anything…'}
            rows={1}
          />
          <button
            className="pilot-send-btn"
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            <Send size={13} />
          </button>
        </div>
        <p className="pilot-input-hint">Enter to send · Shift+Enter for new line</p>
      </div>

    </aside>
    </div>
  );
};
