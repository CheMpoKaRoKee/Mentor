import { X } from 'lucide-react';
import { clsx } from 'clsx';

const styles = {
  error: 'border-red-500/40 bg-red-950/90 text-red-100',
  success: 'border-green-500/40 bg-green-950/90 text-green-100',
  info: 'border-blue-500/40 bg-blue-950/90 text-blue-100'
};

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  return (
    <div className={clsx('fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-lg border px-4 py-3 shadow-xl', styles[type])}>
      <p className="text-sm leading-6">{message}</p>
      <button className="rounded-md p-1 transition hover:bg-white/10" onClick={onClose} aria-label="Закрыть уведомление">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
