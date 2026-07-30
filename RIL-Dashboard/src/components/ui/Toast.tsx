import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, onDismiss, duration = 3200 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
      role="status"
      className="animate-rise glass-raised fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 px-4 py-3 shadow-[0_4px_12px_-4px_rgba(16,24,40,0.16)]"
    >
      <span className="text-body-strong">{message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-ink-400 transition-colors duration-200 hover:text-ink-700"
      >
        <X size={15} strokeWidth={2.4} />
      </button>
    </div>
  );
}
