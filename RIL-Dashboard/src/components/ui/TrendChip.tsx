import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Tone } from '../../lib/types/ui';
import Badge from './Badge';

export type TrendTone = Extract<Tone, 'success' | 'warning' | 'danger' | 'info' | 'cyan' | 'violet' | 'neutral'>;

interface TrendChipProps {
  direction: 'up' | 'down';
  value: string;
  tone?: TrendTone;
}

export default function TrendChip({ direction, value, tone = 'neutral' }: TrendChipProps) {
  const Icon = direction === 'up' ? ArrowUp : ArrowDown;
  return (
    <Badge tone={tone} shape="square" size="sm" icon={<Icon size={11} strokeWidth={2.6} />}>
      {value}
    </Badge>
  );
}
