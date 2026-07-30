import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import TrendChip, { type TrendTone } from './TrendChip';
import Sparkline from './Sparkline';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  trendTone: TrendTone;
  accentId: string;
  accentFill: string;
  accentText: string;
  accentIcon: string;
  sparkline?: number[];
  href?: string;
  delay?: number;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
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
    <div className="glass-raised kpi-card relative flex h-[152px] flex-col p-4">
      <div className="kpi-head flex items-center gap-2">
        <span className="flex-none" style={{ color: accentIcon } as CSSProperties}>
          <Icon size={16} strokeWidth={2.2} />
        </span>
        <p className="text-kpi-label truncate uppercase">{label}</p>
      </div>

      <div key={value} className="animate-fade mt-2 flex items-baseline gap-2">
        <span
          className="kpi-value text-[24px] leading-8 font-bold tabular-nums tracking-tight"
          style={{ color: accentText } as CSSProperties}
        >
          {value}
        </span>
        {trend && trendValue && <TrendChip direction={trend} value={trendValue} tone={trendTone} />}
      </div>

      {sparkline && (
        <Sparkline
          data={sparkline}
          uid={accentId}
          fill={accentFill}
          text={accentIcon}
          className="kpi-spark absolute inset-x-0 bottom-0 h-[38%] w-full"
        />
      )}
    </div>
  );

  const style = { animationDelay: `${delay}ms` } as CSSProperties;

  if (href) {
    return (
      <Link to={href} className="animate-fade block h-full" style={style}>
        {content}
      </Link>
    );
  }
  return (
    <div className="animate-fade h-full" style={style}>
      {content}
    </div>
  );
}
