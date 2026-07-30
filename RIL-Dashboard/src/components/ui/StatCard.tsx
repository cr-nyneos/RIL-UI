import type { CSSProperties, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import GlassCard, { type BloomTone } from './GlassCard';
import TrendChip, { type TrendTone } from './TrendChip';
import Sparkline from './Sparkline';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  bloom: BloomTone;
  accentId: string;
  accentFill: string;
  accentText: string;
  sparkline?: number[];
  href?: string;
  gradientValue?: boolean;
}

function handleSpotlight(e: MouseEvent<HTMLDivElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  bloom,
  accentId,
  accentFill,
  accentText,
  sparkline,
  href,
  gradientValue = false,
}: StatCardProps) {
  const content = (
    <GlassCard bloom={bloom} interactive className="group flex h-[200px] flex-col p-5" onMouseMove={handleSpotlight}>
      <div
        className="glass-inset flex h-10 w-10 flex-none items-center justify-center rounded-xl"
        style={{ color: accentText } as CSSProperties}
      >
        <Icon size={18} strokeWidth={2.2} />
      </div>

      <p className="mt-3.5 truncate text-[11px] font-semibold tracking-[0.1em] text-ink-400 uppercase">{label}</p>

      <div className="mt-1 flex items-baseline gap-2.5">
        <span
          className={`text-[26px] leading-tight font-semibold tabular-nums tracking-tight ${gradientValue ? 'text-gradient-liquid' : ''}`}
          style={gradientValue ? undefined : ({ color: accentText } as CSSProperties)}
        >
          {value}
        </span>
        {trend && trendValue && <TrendChip direction={trend} value={trendValue} tone={bloom as TrendTone} />}
      </div>

      {sparkline && (
        <Sparkline
          data={sparkline}
          uid={accentId}
          fill={accentFill}
          text={accentText}
          className="absolute inset-x-0 bottom-0 h-[42%] w-full"
        />
      )}

      <span className="kpi-spotlight" />
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
