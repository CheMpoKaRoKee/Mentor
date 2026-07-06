import { MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Button from './Button.jsx';

const starterMessages = [
  {
    role: 'assistant',
    content: 'Привет! Спроси меня о текущей теме, примере кода или непонятном термине.'
  }
];

export default function MentorChat({ lesson, screen, onError }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const disabled = screen !== 'theory';

  useEffect(() => {
    setMessages(starterMessages);
    setDraft('');
    setOpen(false);
  }, [lesson?.topic]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  if (disabled) return null;

  async function sendMessage() {
    const text = draft.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setDraft('');
    setLoading(true);

    try {
      const answer = await window.api.askTutorChat(nextMessages, {
        screen,
        lesson: {
          topic: lesson?.topic,
          theory: lesson?.theory,
          exam_type: lesson?.exam_type
        }
      });
      setMessages((value) => [...value, { role: 'assistant', content: answer }]);
    } catch (error) {
      onError?.(error.message || String(error));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {!open && (
        <button
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-xl shadow-blue-500/25 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => setOpen(true)}
          title="Спросить ментора"
          aria-label="Спросить ментора"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="flex h-[520px] w-[380px] animate-fade-in flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Ментор</h2>
              <p className="text-xs text-zinc-500">{lesson?.topic || 'Текущая тема'}</p>
            </div>
            <button
              className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setOpen(false)}
              aria-label="Закрыть чат"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'ml-auto bg-blue-500 text-white'
                    : 'mr-auto border border-zinc-800 bg-zinc-950 text-zinc-200'
                }`}
              >
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto max-w-[88%] rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-400">
                Думаю над объяснением...
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800 p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              className="h-20 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
              placeholder="Что непонятно в уроке?"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500">Ctrl+Enter</span>
              <Button size="sm" onClick={sendMessage} loading={loading} disabled={!draft.trim()}>
                <Send className="h-4 w-4" />
                Спросить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
