import { useState } from 'react';
import { Send, Bot, Zap } from 'lucide-react';
import { sendChatMessage } from '../../services/api';

interface Msg { role: 'user' | 'bot'; text: string; }

export const PacePilot = ({ isStudyMode }: { isStudyMode: boolean }) => {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: "Hi! I'm Pace Pilot. Tell me about an upcoming exam or ask for study advice." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const next: Msg[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await sendChatMessage(text, next.map(m => ({ role: m.role, content: m.text })));
      setMessages([...next, { role: 'bot', text: res.reply }]);
    } catch {
      setMessages([...next, { role: 'bot', text: 'Servers are resting. Try again soon.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="pilot-panel">
      {/* Header */}
      <div className="pilot-header">
        <div className="pilot-avatar">
          <Bot size={17} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="pilot-title">Pace Pilot</div>
          <div className="pilot-status">
            <div className="pilot-status-dot" style={{ background: isStudyMode ? '#16a34a' : '#9ca3af' }} />
            {isStudyMode ? 'Monitoring Session' : 'Standby'}
          </div>
        </div>
        {isStudyMode && <Zap size={15} color="#16a34a" />}
      </div>

      {/* Messages */}
      <div className="pilot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`pilot-msg ${m.role}`}>{m.text}</div>
        ))}
        {loading && <div className="pilot-typing">Pilot is thinking…</div>}
      </div>

      {/* Input */}
      <div className="pilot-input-wrap">
        <div className="pilot-input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Tell me about a new test…"
          />
          <button
            className="pilot-send-btn"
            onClick={send}
            disabled={loading || !input.trim()}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};
