import { ArrowUp, ArrowDown } from 'lucide-react';

export type TrendTone = 'success' | 'warning' | 'danger' | 'info' | 'cyan' | 'violet' | 'neutral';

interface TrendChipProps {
  direction: 'up' | 'down';
  value: string;
  tone?: TrendTone;
}

const TONE_CLASSES: Record<TrendTone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-chip-warning text-kpi-warning-text',
  danger: 'bg-chip-danger text-kpi-danger-text',
  info: 'bg-info-soft text-info',
  cyan: 'bg-cyan-soft text-cyan',
  violet: 'bg-violet-soft text-violet',
  neutral: 'bg-chip-neutral text-ink-600',
};

export default function TrendChip({ direction, value, tone = 'neutral' }: TrendChipProps) {
  const Icon = direction === 'up' ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[12px] font-bold tabular-nums ${TONE_CLASSES[tone]}`}
    >
      <Icon size={11} strokeWidth={2.6} />
      {value}
    </span>
  );
}
