import { CheckCircle2, Circle } from 'lucide-react';

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-glass-hairline)] py-3 last:border-b-0">
      <span className="text-meta">{label}</span>
      <span className="max-w-[58%] truncate text-right text-body-strong tabular-nums">{value || 'Pending'}</span>
    </div>
  );
}

export function CheckRow({ label, done, waiting }: { label: string; done: boolean; waiting?: boolean }) {
  return (
    <div className="glass-inset flex items-center gap-3 p-3">
      {done ? (
        <CheckCircle2 size={18} strokeWidth={2.4} className="text-success" />
      ) : (
        <Circle size={18} strokeWidth={2.4} className={waiting ? 'text-ink-500' : 'text-warning'} />
      )}
      <span className="text-body-strong">{label}</span>
    </div>
  );
}
