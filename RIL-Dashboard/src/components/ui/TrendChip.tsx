import { ArrowUp, ArrowDown } from 'lucide-react';

export type TrendTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface TrendChipProps {
  direction: 'up' | 'down';
  value: string;
  tone?: TrendTone;
}

const TONE_CLASSES: Record<TrendTone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-glass-fill-deep text-ink-500',
};

export default function TrendChip({ direction, value, tone = 'neutral' }: TrendChipProps) {
  const Icon = direction === 'up' ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold tabular-nums ${TONE_CLASSES[tone]}`}
    >
      <Icon size={11} strokeWidth={2.6} />
      {value}
    </span>
  );
}
