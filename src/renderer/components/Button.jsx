import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const variants = {
  primary: 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20',
  success: 'bg-green-500 text-white hover:bg-green-400 shadow-lg shadow-green-500/20',
  danger: 'bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/20',
  ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50',
  secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-7 text-base'
};

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
