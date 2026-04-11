import { useEffect } from 'react';
import { Send, Sparkles, Zap, X, RotateCcw } from 'lucide-react';
import Markdown from 'react-markdown';
import type { Msg } from './usePilotChat';
import { useChatInput } from './useChatInput';
import { QUICK_PROMPTS } from './quickPrompts';

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
  const { textareaRef, bottomRef, scrollToBottom, handleChange: _handleChange, handleKeyDown } = useChatInput(input, send);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    _handleChange(e);
  };

  const hasUserMsg = messages.some(m => m.role === 'user');

  return (
    <div className={`pilot-panel-wrap${open ? '' : ' pilot-panel-wrap--closed'}`}>
    <aside className="pilot-panel">

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

      {isStudyMode && (
        <div className="pilot-study-strip">
          <div className="pilot-study-strip-dot" />
          <span>Study Mode active — recommendations tailored to your session</span>
        </div>
      )}

      <div className="pilot-messages">
        {messages.map((m, i) => (
          <div key={`${m.ts}-${i}`} className={`pilot-msg-row ${m.role}`}>
            {m.role === 'bot' && (
              <div className="pilot-msg-avatar">
                <Sparkles size={10} />
              </div>
            )}
            <div className="pilot-msg-col">
              <div className={`pilot-msg ${m.role}`}>
                {m.role === 'bot' ? <Markdown>{m.text}</Markdown> : m.text}
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

      {!hasUserMsg && (
        <div className="pilot-chips">
          {QUICK_PROMPTS.slice(0, 3).map(p => (
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
