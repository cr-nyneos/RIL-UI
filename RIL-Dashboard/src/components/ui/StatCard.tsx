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
  trendTone: TrendTone;
  accentId: string;
  accentFill: string;
  accentText: string;
  accentIcon: string;
  sparkline?: number[];
  href?: string;
  delay?: number;
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
  trendTone,
  accentId,
  accentFill,
  accentText,
  accentIcon,
  sparkline,
  href,
  delay = 0,
}: StatCardProps) {
  const content = (
    <GlassCard bloom={bloom} interactive className="group flex h-[186px] flex-col p-5" onMouseMove={handleSpotlight}>
      <div
        className="glass-inset flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl"
        style={{ color: accentIcon } as CSSProperties}
      >
        <Icon size={18} strokeWidth={2.2} />
      </div>

      <p className="mt-3 truncate text-kpi-label uppercase">{label}</p>

      <div key={value} className="animate-fade mt-0.5 flex items-baseline gap-2.5">
        <span
          className="text-[26px] leading-tight font-extrabold tabular-nums tracking-tight"
          style={{ color: accentText } as CSSProperties}
        >
          {value}
        </span>
        {trend && trendValue && <TrendChip direction={trend} value={trendValue} tone={trendTone} />}
      </div>

      {sparkline && (
        <>
          <span className="absolute inset-x-0 bottom-[40%] h-px bg-glass-hairline" />
          <Sparkline
            data={sparkline}
            uid={accentId}
            fill={accentFill}
            text={accentIcon}
            className="absolute inset-x-0 bottom-0 h-[40%] w-full"
          />
        </>
      )}

      <span className="kpi-spotlight" />
    </GlassCard>
  );

  const style = { animationDelay: `${delay}ms` } as CSSProperties;

  if (href) {
    return (
      <Link to={href} className="animate-rise block h-full" style={style}>
        {content}
      </Link>
    );
  }
  return (
    <div className="animate-rise h-full" style={style}>
      {content}
    </div>
  );
}
