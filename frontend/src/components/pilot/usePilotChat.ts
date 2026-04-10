import { useState, useRef } from 'react';
import { sendChatMessage } from '../../services/api';

export interface Msg {
  role: 'user' | 'bot';
  text: string;
  ts: string;
  failed?: boolean;
  retryText?: string;
}

function now(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const INITIAL: Msg[] = [{
  role: 'bot',
  text: "Hi! I'm Pace Pilot — your academic companion. Tell me about an upcoming exam, ask for study advice, or let me help you plan your week.",
  ts: now(),
}];

export function usePilotChat() {
  // Keep a ref in sync so async callbacks always read fresh state
  const [messages, _setMessages] = useState<Msg[]>(INITIAL);
  const msgRef                   = useRef<Msg[]>(INITIAL);

  const setMessages = (v: Msg[] | ((p: Msg[]) => Msg[])) => {
    const next = typeof v === 'function' ? v(msgRef.current) : v;
    msgRef.current = next;
    _setMessages(next);
  };

  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);

  const _callApi = async (userText: string, history: Msg[]) => {
    setLoading(true);
    try {
      const res = await sendChatMessage(
        userText,
        history.map(m => ({ role: m.role, content: m.text })),
      );
      setMessages(prev => [...prev, { role: 'bot', text: res.reply, ts: now() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Servers are resting — I'll be back shortly.",
        ts: now(),
        failed: true,
        retryText: userText,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const next: Msg[] = [...msgRef.current, { role: 'user', text, ts: now() }];
    setMessages(next);
    setInput('');
    await _callApi(text, next);
  };

  const retry = async (userText: string) => {
    if (loading) return;
    // Strip failed message(s), then re-attempt without adding a duplicate user bubble
    const cleaned = msgRef.current.filter(m => !m.failed);
    setMessages(cleaned);
    await _callApi(userText, cleaned);
  };

  return { messages, input, setInput, loading, send, retry };
}
