import { ExternalLink, KeyRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';

export default function SettingsModal({ open, initialKey = '', onClose, onSave }) {
  const [key, setKey] = useState(initialKey || '');

  useEffect(() => {
    if (open) setKey(initialKey || '');
  }, [initialKey, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-lg animate-fade-in rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-bold">Настройки</h2>
          </div>
          <button className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100" onClick={onClose} aria-label="Закрыть">
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-2 block text-sm font-medium text-zinc-300">OpenRouter API key</label>
        <input
          value={key}
          onChange={(event) => setKey(event.target.value)}
          type="password"
          placeholder="sk-or-v1-..."
          className="mb-4 h-12 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
        />

        <a
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noreferrer"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          Получить ключ на openrouter.ai
          <ExternalLink className="h-4 w-4" />
        </a>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={() => onSave(key)}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
