import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import GlassCard, { type BloomTone } from './GlassCard';
import TrendChip from './TrendChip';
import Sparkline from './Sparkline';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  tone?: BloomTone;
  sparkline?: number[];
  href?: string;
  gradientValue?: boolean;
}

const TILE_CLASSES: Record<Exclude<BloomTone, 'none'>, string> = {
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  tone = 'info',
  sparkline,
  href,
  gradientValue = false,
}: StatCardProps) {
  const tileClass = tone === 'none' ? 'bg-glass-fill-deep text-ink-500' : TILE_CLASSES[tone];

  const content = (
    <GlassCard bloom={tone} interactive className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-3 p-5 pb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tileClass}`}>
          <Icon size={17} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold tracking-[0.1em] text-ink-400 uppercase">{label}</p>
          <p
            className={`mt-1 text-[26px] leading-tight font-semibold tabular-nums tracking-tight ${
              gradientValue ? 'text-gradient-liquid' : 'text-ink-900'
            }`}
          >
            {value}
          </p>
        </div>
        {trend && trendValue && (
          <div>
            <TrendChip direction={trend} value={trendValue} tone={tone === 'none' ? 'neutral' : tone} />
          </div>
        )}
      </div>
      {sparkline && (
        <div className="-mt-1">
          <Sparkline data={sparkline} tone={tone === 'none' ? 'info' : tone} />
        </div>
      )}
    </GlassCard>
  );

  if (href) {
    return (
      <Link to={href} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}
