import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import FloatingTooltip, { TT_HEAD, TT_DOT, TT_VALUE, TT_ROW, TT_TREND, trendColor } from './FloatingTooltip';
import { SEGMENTS, type Segment } from '../data/segments';
import { SPRING } from '../lib/motion';

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

interface SegmentTip {
  label: string;
  value: number;
  /** Viewport coords of the hovered block's top-center. */
  x: number;
  y: number;
}

const GAP = 2; // px between stacked blocks
const ZERO_H = 2; // px sliver for an empty sub-period
const MARGIN = 12; // keep the segment tooltip this far from the viewport edges

/**
 * Drill-down tooltip for a single stacked block. Portalled to <body> with
 * `position: fixed` so a parent's `overflow: hidden` or stacking context can
 * never clip it.
 */
function SegmentTooltip({ tip, valuePrefix, unit }: { tip: SegmentTip | null; valuePrefix: string; unit: string }) {
  if (typeof document === 'undefined') return null;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const left = tip ? Math.max(MARGIN + 50, Math.min(tip.x, vw - MARGIN - 50)) : 0;

  return createPortal(
    <AnimatePresence>
      {tip && (
        <motion.div
          className="pointer-events-none fixed z-9999 -translate-x-1/2 -translate-y-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-menu)] px-2.5 py-1.5 shadow-[0_8px_20px_-8px_rgba(23,37,84,0.20)]"
          style={{ left, top: tip.y - 8 }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
        >
          <div className="text-[11px] leading-tight font-medium text-ink-500">{tip.label}</div>
          <div className="text-[14px] leading-tight font-bold tabular-nums text-ink-900">
            {valuePrefix}
            {tip.value}
            {unit}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
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
  const [segTip, setSegTip] = useState<SegmentTip | null>(null);
  const [hotSeg, setHotSeg] = useState<number | null>(null);

  const hot = ownHover || external;

  const ratio = datum.value / max;
  const barPct = 34 + ratio * 66; // bar height encodes value → reads as a bar chart
  const intensity = 0.26 + ratio * 0.5;

  // Only stack when a real sub-breakdown exists; otherwise one solid block.
  const stack = useMemo(() => {
    const b = datum.breakdown;
    if (!b || b.length === 0) return [datum.value];
    return b.reduce((s, v) => s + v, 0) > 0 ? b : [datum.value];
  }, [datum.breakdown, datum.value]);

  const stacked = stack.length > 1;

  const handleEnter = (e: React.MouseEvent) => {
    setOwnHover(true);
    onEnter(index, e);
  };
  const handleLeave = () => {
    setOwnHover(false);
    setSegTip(null);
    setHotSeg(null);
    onLeave();
  };

  const enterSegment = (i: number, value: number, e: React.MouseEvent) => {
    if (!stacked) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHotSeg(i);
    setSegTip({
      label: datum.breakdownLabels?.[i] ?? `Part ${i + 1}`,
      value,
      x: r.left + r.width / 2,
      y: r.top,
    });
  };
  const leaveSegment = () => {
    setHotSeg(null);
    setSegTip(null);
  };

  return (
    <motion.div
      className="relative flex h-full flex-1 origin-bottom cursor-pointer flex-col items-center justify-end will-change-transform"
      animate={{ scale: ownHover ? 1.05 : external ? 1.02 : 1, y: hot ? -6 : 0 }}
      transition={SPRING}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <motion.div
        className="relative mb-3 font-display text-[clamp(15px,2vw,19px)] font-bold tracking-[-0.02em] text-text-0"
        animate={{ y: hot ? -4 : 0, scale: hot ? 1.07 : 1, filter: hot ? 'brightness(1.18)' : 'brightness(1)' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ textShadow: hot ? `0 0 20px ${datum.glow}` : '0 0 12px #00000066' }}
      >
        <motion.span
          className="pointer-events-none absolute -inset-x-3.5 -inset-y-2 -z-10 rounded-xl"
          style={{ background: `radial-gradient(closest-side, ${datum.glow}, transparent 72%)` }}
          animate={{ opacity: hot ? 0.5 : 0, scale: hot ? 1 : 0.7 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <AnimatedNumber value={datum.value} prefix={valuePrefix} suffix={unit} delay={0.3 + index * 0.08} />
      </motion.div>

      <div
        className="relative mx-auto flex w-full max-w-[92px] flex-col-reverse rounded-[8px] max-[560px]:max-w-[60px]"
        style={{ height: `${barPct}%`, gap: GAP }}
      >
        <motion.span
          className="pointer-events-none absolute -bottom-[6%] left-1/2 -z-10 h-[62%] w-[150%] -translate-x-1/2 rounded-full blur-[18px]"
          style={{ background: `radial-gradient(closest-side, ${datum.glow}, transparent 72%)` }}
          animate={{ opacity: hot ? 1 : intensity, height: hot ? '92%' : '62%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {stack.map((v, i) => {
          const t = stack.length === 1 ? 0 : i / (stack.length - 1);
          const empty = v <= 0;
          return (
            <motion.div
              key={i}
              className="relative w-full origin-bottom will-change-transform"
              style={{
                flexGrow: empty ? 0 : v,
                flexBasis: 0,
                flexShrink: 0,
                height: empty ? ZERO_H : undefined,
                minHeight: empty ? ZERO_H : 3,
                background: empty
                  ? '#94a3b866'
                  : stacked
                    ? `color-mix(in srgb, ${datum.from} ${Math.round(t * 100)}%, ${datum.to})`
                    : `linear-gradient(180deg, ${datum.from}, ${datum.to})`,
                borderTopLeftRadius: i === stack.length - 1 ? 8 : 3,
                borderTopRightRadius: i === stack.length - 1 ? 8 : 3,
                borderBottomLeftRadius: i === 0 ? 8 : 3,
                borderBottomRightRadius: i === 0 ? 8 : 3,
                boxShadow: hotSeg === i ? `0 0 14px -2px ${datum.glow}` : 'none',
              }}
              animate={{
                scaleY: filled ? 1 : 0,
                scaleX: hotSeg === i ? 1.05 : 1,
                filter: hotSeg === i ? 'brightness(1.16)' : 'brightness(1)',
              }}
              transition={{
                scaleY: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.16 + index * 0.09 + i * 0.05 },
                default: { duration: 0.2, ease: 'easeOut' },
              }}
              onMouseEnter={(e) => enterSegment(i, v, e)}
              onMouseLeave={leaveSegment}
            />
          );
        })}
      </div>

      <SegmentTooltip tip={segTip} valuePrefix={valuePrefix} unit={unit} />
    </motion.div>
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

      <div className="mx-1 mt-3.5 h-px bg-[linear-gradient(90deg,transparent,var(--color-border-hi),transparent)]" />
      <div className="flex justify-between gap-[clamp(12px,2.6vw,28px)] px-1 pt-3">
        {data.map((d, i) => {
          const isActive = tip?.index === i || externalActiveKey === d.key;
          return (
            <span
              key={d.key}
              className={`flex-1 text-center text-[12.5px] font-medium transition-[color,text-shadow] duration-400 ${isActive ? 'text-text-0' : 'text-text-2'}`}
              style={isActive ? { textShadow: `0 0 16px ${d.glow}` } : undefined}
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
              <span className="text-text-1">{((active.value / total) * 100).toFixed(1)}%</span>
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
