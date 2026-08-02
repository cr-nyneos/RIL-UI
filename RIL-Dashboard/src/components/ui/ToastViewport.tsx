import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

import type { ToastItem, ToastTone } from '../../lib/types/notifications';

const TONE: Record<ToastTone, { icon: typeof Info; color: string; soft: string }> = {
  success: { icon: CheckCircle2, color: 'var(--color-success)', soft: 'var(--color-success-soft)' },
  info: { icon: Info, color: 'var(--color-info)', soft: 'var(--color-info-soft)' },
  warning: { icon: AlertTriangle, color: 'var(--color-warning)', soft: 'var(--color-warning-soft)' },
  error: { icon: XCircle, color: 'var(--color-danger)', soft: 'var(--color-danger-soft)' },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const tone = TONE[toast.tone];
  const Icon = tone.icon;

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="status"
      className={`glass-raised pointer-events-auto flex w-[340px] items-start gap-3 py-3 pr-3 pl-3.5 shadow-[0_10px_28px_-14px_rgba(11,23,53,0.45)] ${
        toast.leaving ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      <span
        className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full"
        style={{ background: tone.soft, color: tone.color }}
      >
        <Icon size={15} strokeWidth={2.3} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-5 font-semibold text-ink-900">{toast.message}</p>
        {toast.description && (
          <p className="mt-0.5 text-[12.5px] leading-[18px] text-ink-600">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="mt-0.5 flex-none cursor-pointer text-ink-400 transition-colors duration-150 hover:text-ink-900"
      >
        <X size={15} strokeWidth={2.4} />
      </button>
    </div>
  );
}

export default function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-[84px] right-5 z-[70] flex flex-col items-end gap-2.5">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
