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
    <div className="glass-raised kpi-card relative flex h-43 flex-col">
      <span className="kpi-edge" style={{ background: accentIcon } as CSSProperties} />

      <div className="kpi-head flex flex-none items-center gap-3 px-4 pt-4">
        <span
          className="kpi-medallion flex h-9 w-9 flex-none items-center justify-center rounded-3xl"
          style={{ background: accentIcon } as CSSProperties}
        >
          <Icon size={17} strokeWidth={2.3} />
        </span>
        <p className="text-kpi-label truncate uppercase">{label}</p>
      </div>

      <div key={value} className="animate-fade flex items-baseline gap-2.5 px-4 pt-5">
        <span
          className="kpi-value text-[30px] leading-9 font-semibold tabular-nums tracking-tight"
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
