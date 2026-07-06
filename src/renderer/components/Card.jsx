import { clsx } from 'clsx';

export default function Card({ children, className }) {
  return (
    <div className={clsx('rounded-lg border border-zinc-800 bg-zinc-900/75 shadow-xl shadow-black/20', className)}>
      {children}
    </div>
  );
}
