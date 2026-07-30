import { useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import FloatingTooltip, { TT_HEAD, TT_DOT, TT_VALUE, TT_ROW, TT_TREND, trendColor } from './FloatingTooltip';
import { SEGMENTS, type Segment } from '../data/segments';

interface BarChartProps {
  /** Key of a segment hovered elsewhere (e.g. the pie) to soft-highlight. */
  externalActiveKey?: string | null;
  /** Reports the key the user is hovering here, for cross-chart linking. */
  onHoverKey?: (key: string | null) => void;
  unit?: string;
  /** Custom dataset; defaults to the demo SEGMENTS so existing usages are unaffected. */
  data?: Segment[];
  valuePrefix?: string;
  shareLabel?: string;
  trendLabel?: string;
  showTrend?: boolean;
}

interface TooltipState {
  index: number;
  /** Hovered bar's rect, so the tooltip can sit safely below it. */
  rect: { left: number; bottom: number; width: number };
}

function Bar({
  datum,
  index,
  external,
  filled,
  onEnter,
  onLeave,
  max,
  valuePrefix,
  unit,
}: {
  datum: Segment;
  index: number;
  external: boolean;
  filled: boolean;
  onEnter: (i: number, e: React.MouseEvent) => void;
  onLeave: () => void;
  max: number;
  valuePrefix: string;
  unit: string;
}) {
  const [ownHover, setOwnHover] = useState(false);
  const hot = ownHover || external;

  const ratio = datum.value / max;
  const barPct = 8 + ratio * 92;

  const handleEnter = (e: React.MouseEvent) => {
    setOwnHover(true);
    onEnter(index, e);
  };
  const handleLeave = () => {
    setOwnHover(false);
    onLeave();
  };

  return (
    <div
      className="relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="mb-2 text-[14px] font-bold tabular-nums tracking-tight text-ink-900">
        <AnimatedNumber value={datum.value} prefix={valuePrefix} suffix={unit} delay={0.2 + index * 0.06} />
      </div>

      <motion.div
        className="mx-auto w-full max-w-[68px] rounded-t-[var(--radius-sm)] max-[560px]:max-w-[44px]"
        style={{ background: datum.to, opacity: hot ? 1 : 0.88 }}
        initial={{ height: 0 }}
        animate={{ height: filled ? `${barPct}%` : 0 }}
        transition={{ duration: 0.45, delay: 0.1 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export default function BarChart({
  externalActiveKey = null,
  onHoverKey,
  unit = 'B',
  data = SEGMENTS,
  valuePrefix = '$',
  shareLabel = 'Share of revenue',
  trendLabel = 'YoY trend',
  showTrend = true,
}: BarChartProps) {
  const [tip, setTip] = useState<TooltipState | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Bars fill only once the section scrolls into view.
  const filled = useInView(wrapRef, { once: true, amount: 0.4 });

  const max = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const handleEnter = (index: number, e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTip({ index, rect: { left: r.left, bottom: r.bottom, width: r.width } });
    onHoverKey?.(data[index].key);
  };
  const clear = () => {
    setTip(null);
    onHoverKey?.(null);
  };

  const active = tip ? data[tip.index] : null;

  return (
    <>
      <div
        className="relative flex h-85 items-end justify-between gap-[clamp(12px,2.6vw,28px)] px-1 pt-2 max-[560px]:h-65"
        ref={wrapRef}
        onMouseLeave={clear}
      >
        {data.map((d, i) => (
          <Bar
            key={d.key}
            datum={d}
            index={i}
            external={externalActiveKey === d.key}
            filled={filled}
            onEnter={handleEnter}
            onLeave={clear}
            max={max}
            valuePrefix={valuePrefix}
            unit={unit}
          />
        ))}
      </div>

      <div className="surface-divider mx-1 mt-3 h-px" />
      <div className="flex justify-between gap-[clamp(12px,2.6vw,28px)] px-1 pt-2.5">
        {data.map((d, i) => {
          const isActive = tip?.index === i || externalActiveKey === d.key;
          return (
            <span
              key={d.key}
              className={`flex-1 text-center text-[12px] transition-colors duration-200 ${
                isActive ? 'font-bold text-ink-900' : 'font-medium text-ink-500'
              }`}
            >
              {d.label}
            </span>
          );
        })}
      </div>

      <FloatingTooltip open={!!(tip && active)} below={tip?.rect} gap={10}>
        {active && (
          <>
            <div className={TT_HEAD}>
              <span className={TT_DOT} style={{ color: active.glow }} />
              <active.icon size={15} strokeWidth={2.2} />
              {active.fullLabel}
            </div>
            <div className={TT_VALUE}>
              {valuePrefix}
              {active.value}
              {unit}
            </div>
            <div className={TT_ROW}>
              <span>{shareLabel}</span>
              <span className="text-ink-700">{((active.value / total) * 100).toFixed(1)}%</span>
            </div>
            {showTrend && (
              <div className={TT_ROW}>
                <span>{trendLabel}</span>
                <span className={`${TT_TREND} ${trendColor(active.trend)}`}>
                  {active.trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {active.trend >= 0 ? '+' : ''}
                  {active.trend.toFixed(1)}%
                </span>
              </div>
            )}
          </>
        )}
      </FloatingTooltip>
    </>
  );
}
