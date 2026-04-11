import { useEffect } from 'react';
import { Send, Sparkles, Zap, RotateCcw } from 'lucide-react';
import Markdown from 'react-markdown';
import type { Msg } from './usePilotChat';
import { useChatInput } from './useChatInput';
import { QUICK_PROMPTS } from './quickPrompts';

interface Props {
  isStudyMode: boolean;
  messages: Msg[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  send: (override?: string) => void;
  retry: (userText: string) => void;
}

export const PilotChat = ({ isStudyMode, messages, input, setInput, loading, send, retry }: Props) => {
  const { textareaRef, bottomRef, scrollToBottom, handleChange: _handleChange, handleKeyDown } = useChatInput(input, send);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    _handleChange(e);
  };

  const hasMessages = messages.some(m => m.role === 'user');

  return (
    <div className="pchat-wrap">
      <div className="pchat-inner">

        {!hasMessages && (
          <div className="pchat-welcome">
            <div className="pchat-welcome-avatar">
              <Sparkles size={28} />
            </div>
            <h2 className="pchat-welcome-title">Pace Pilot</h2>
            <p className="pchat-welcome-sub">
              {isStudyMode
                ? 'Study Mode is active — I\'m monitoring your session and ready to help.'
                : 'Your AI academic companion. Ask about deadlines, study strategies, or anything on your plate.'}
            </p>

            <div className="pchat-prompt-grid">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p.label}
                  className="pchat-prompt-card"
                  onClick={() => send(p.label)}
                  disabled={loading}
                >
                  <span className="pchat-prompt-icon">{p.icon}</span>
                  <span className="pchat-prompt-label">{p.label}</span>
                  <span className="pchat-prompt-sub">{p.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {hasMessages && (
          <div className="pchat-messages">
            {messages.map((m, i) => (
              <div key={`${m.ts}-${i}`} className={`pchat-msg-row ${m.role}`}>
                {m.role === 'bot' && (
                  <div className="pchat-bot-avatar">
                    <Sparkles size={13} />
                  </div>
                )}
                <div className="pchat-msg-col">
                  <div className={`pchat-bubble ${m.role}`}>
                    {m.role === 'bot' ? <Markdown>{m.text}</Markdown> : m.text}
                  </div>
                  {m.failed && m.retryText && (
                    <button className="pchat-retry-btn" onClick={() => retry(m.retryText!)}>
                      <RotateCcw size={12} /> Retry
                    </button>
                  )}
                  <span className="pchat-ts">{m.ts}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="pchat-msg-row bot">
                <div className="pchat-bot-avatar">
                  <Sparkles size={13} />
                </div>
                <div className="pchat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}

        <div className="pchat-input-bar">
          {isStudyMode && (
            <div className="pchat-study-banner">
              <Zap size={12} />
              Study Mode active — recommendations tailored to your session
            </div>
          )}
          <div className="pchat-input-row">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={isStudyMode ? 'Ask about your session…' : 'Message Pace Pilot…'}
              rows={1}
              autoFocus
            />
            <button
              className="pchat-send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              <Send size={15} />
            </button>
          </div>
          <p className="pchat-hint">Enter to send · Shift+Enter for new line</p>
        </div>

      </div>
    </div>
  );
};
