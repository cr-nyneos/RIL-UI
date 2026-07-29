import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import FloatingTooltip, { TT_HEAD, TT_DOT, TT_VALUE, TT_ROW, TT_TREND, trendColor } from './FloatingTooltip';
import { SEGMENTS, type Segment } from '../data/segments';
import { SPRING, EASE_OUT } from '../lib/motion';

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const CX = 120;
const CY = 120;
const R_OUT = 100;
const R_IN = 64;
const GAP = 0; // slices touch: the ring reads as one continuous object

const DC_TREND =
  'mt-2 inline-flex items-center gap-1 rounded-full border border-border-hi bg-[#0b0b0b0a] px-[9px] py-[3px] text-xs font-semibold [font-variant-numeric:tabular-nums]';

const polar = (r: number, a: number) => [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;

/** Build an SVG path for one doughnut segment. */
function segmentPath(start: number, end: number, rOut: number, rIn: number) {
  const [x1, y1] = polar(rOut, start);
  const [x2, y2] = polar(rOut, end);
  const [x3, y3] = polar(rIn, end);
  const [x4, y4] = polar(rIn, start);
  const large = end - start > Math.PI ? 1 : 0;
  return `M${x1},${y1} A${rOut},${rOut} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${rIn},${rIn} 0 ${large} 0 ${x4},${y4} Z`;
}

interface SliceGeom extends Segment {
  index: number;
  pct: number;
  mid: number;
  path: string;
}

interface TooltipState {
  index: number;
  x: number;
  y: number;
}

interface PieChartProps {
  externalActiveKey?: string | null;
  onHoverKey?: (key: string | null) => void;
  unit?: string;
  /** Custom dataset; defaults to the demo SEGMENTS so existing usages are unaffected. */
  data?: Segment[];
  valuePrefix?: string;
  shareLabel?: string;
  trendLabel?: string;
  totalLabel?: string;
  shareUnitLabel?: string;
  idleHint?: string;
  showTrend?: boolean;
  ariaLabel?: string;
}

export default function PieChart({
  externalActiveKey = null,
  onHoverKey,
  unit = 'B',
  data = SEGMENTS,
  valuePrefix = '$',
  shareLabel = 'Share',
  trendLabel = 'YoY trend',
  totalLabel = 'Total Revenue',
  shareUnitLabel = 'of revenue',
  idleHint = 'Hover a segment for the breakdown',
  showTrend = true,
  ariaLabel = 'Revenue by segment',
}: PieChartProps) {
  const [tip, setTip] = useState<TooltipState | null>(null);
  const ownHover = tip?.index ?? null;

  const donutRef = useRef<HTMLDivElement>(null);
  const inView = useInView(donutRef, { once: true, amount: 0.5 });
  // Once the circumference finishes drawing we drop the reveal mask so hover
  // explosions are never clipped, and let the center / legend fade in.
  const [built, setBuilt] = useState(reduceMotion);

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const segments = useMemo<SliceGeom[]>(() => {
    const steps = data.map((d) => (d.value / total) * Math.PI * 2);
    // Cumulative start angle for each slice, beginning at 12 o'clock.
    const starts = steps.reduce<number[]>((arr, _, i) => {
      arr.push(i === 0 ? -Math.PI / 2 : arr[i - 1] + steps[i - 1]);
      return arr;
    }, []);
    return data.map((d, index) => {
      const start = starts[index] + GAP / 2;
      const end = starts[index] + steps[index] - GAP / 2;
      const mid = (start + end) / 2;
      return {
        ...d,
        index,
        pct: (d.value / total) * 100,
        mid,
        path: segmentPath(start, end, R_OUT, R_IN),
      };
    });
  }, [data, total]);

  const extIndex = externalActiveKey ? segments.findIndex((s) => s.key === externalActiveKey) : -1;
  // The center panel follows a direct hover first, then any external highlight.
  const centerIndex = ownHover ?? (extIndex >= 0 ? extIndex : null);
  const center = centerIndex !== null ? segments[centerIndex] : null;

  const setHover = (index: number, e: React.MouseEvent) => {
    setTip({ index, x: e.clientX, y: e.clientY });
    onHoverKey?.(segments[index].key);
  };
  const moveHover = (e: React.MouseEvent) =>
    setTip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t));
  const clear = () => {
    setTip(null);
    onHoverKey?.(null);
  };

  const anyActive = ownHover !== null || extIndex >= 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-[clamp(16px,4vw,40px)]">
      <div
        className="relative aspect-square w-[clamp(240px,32vw,320px)] flex-none"
        ref={donutRef}
        onMouseLeave={clear}
      >
        {/* Scroll reveal: the whole ring rotates ~one revolution into place
            with spring easing while the circumference draws itself. */}
        <motion.div
          className="h-full w-full origin-center"
          initial={{ rotate: reduceMotion ? 0 : -300 }}
          animate={inView ? { rotate: 0 } : {}}
          transition={{ type: 'spring', stiffness: 42, damping: 15, mass: 1.1 }}
        >
          <motion.div
            className="h-full w-full origin-center"
            animate={reduceMotion ? undefined : { scale: [1, 1.012, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="h-full w-full overflow-visible" viewBox="0 0 240 240" role="img" aria-label={ariaLabel}>
              <defs>
              {/* userSpaceOnUse → every slice is lit along one shared axis
                  (top-left light, bottom-right shade) so the ring reads as a
                  single object under one light source. */}
              {segments.map((s) => (
                <linearGradient
                  key={s.index}
                  id={`slice-${s.index}`}
                  gradientUnits="userSpaceOnUse"
                  x1="52"
                  y1="8"
                  x2="188"
                  y2="232"
                >
                  <stop offset="0%" stopColor={s.from} />
                  <stop offset="100%" stopColor={s.to} />
                </linearGradient>
              ))}
              <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="45%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.42)" />
              </linearGradient>
              <filter id="slice-shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.35" />
              </filter>
              {/* Circumference reveal: a thick stroked circle whose length
                  animates 0→1, uncovering the ring as if it were being drawn. */}
              <mask id="reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240">
                <motion.circle
                  cx="120"
                  cy="120"
                  r="82"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="72"
                  initial={{ pathLength: reduceMotion ? 1 : 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.15, ease: EASE_OUT }}
                  onAnimationComplete={() => setBuilt(true)}
                />
              </mask>
            </defs>

            <g mask={built ? undefined : 'url(#reveal)'}>
            <g filter="url(#slice-shadow)">
              {segments.map((s) => {
                const isOwn = ownHover === s.index;
                const isExt = extIndex === s.index;
                const highlight = isOwn || isExt;
                const isDim = anyActive && !highlight;
                const off = isOwn ? 10 : isExt ? 5 : 0;
                const dx = Math.cos(s.mid) * off;
                const dy = Math.sin(s.mid) * off;
                return (
                  <motion.path
                    key={s.index}
                    className="cursor-pointer transition-[filter] duration-400"
                    d={s.path}
                    fill={`url(#slice-${s.index})`}
                    /* Stroke matches the fill so touching edges seam invisibly
                       into one ring; only a lifted slice reveals a gap. */
                    stroke={`url(#slice-${s.index})`}
                    strokeWidth={1}
                    strokeLinejoin="round"
                    style={{
                      filter: highlight ? `drop-shadow(0 0 14px ${s.glow})` : 'none',
                      transformOrigin: '120px 120px',
                    }}
                    initial={false}
                    animate={{
                      opacity: isDim ? 0.5 : 1,
                      scale: isOwn ? 1.06 : isExt ? 1.03 : 1,
                      x: dx,
                      y: dy,
                    }}
                    transition={{ scale: SPRING, x: SPRING, y: SPRING, opacity: { duration: 0.35 } }}
                    onMouseEnter={(e) => setHover(s.index, e)}
                    onMouseMove={moveHover}
                  />
                );
              })}
              </g>

              {/* Continuous lighting overlays spanning the whole ring, not
                  per-slice: a specular highlight up top, soft shade at the base. */}
              <path
                d={segmentPath(Math.PI * 0.06, Math.PI * 0.94, R_OUT - 1, R_IN + 1)}
                fill="url(#shade)"
                opacity={0.9}
                style={{ pointerEvents: 'none' }}
              />
              <path
                d={segmentPath(-Math.PI * 0.92, -Math.PI * 0.08, R_OUT - 1, R_IN + 1)}
                fill="url(#gloss)"
                opacity={0.5}
                style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}
              />
              </g>
            </svg>
          </motion.div>
        </motion.div>

        {/* Morphing center panel — fades in after the ring is built */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[18%] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: built ? 1 : 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}>
          <AnimatePresence mode="wait">
            {center ? (
              <motion.div
                key={center.key}
                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.94 }}
                transition={SPRING}
              >
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-text-2">
                  {center.fullLabel}
                </div>
                <div className="mt-1.5 mb-0.5 font-display text-[clamp(30px,5vw,40px)] leading-none font-bold tracking-[-0.03em] text-text-0">
                  {valuePrefix}
                  {center.value}
                  {unit}
                </div>
                <div className="font-display text-sm font-semibold" style={{ color: center.glow }}>
                  {center.pct.toFixed(1)}% {shareUnitLabel}
                </div>
                <div className="mt-2 max-w-37.5 text-[11.5px] leading-[1.4] text-text-2">
                  {center.description}
                </div>
                {showTrend && (
                  <span className={`${DC_TREND} ${trendColor(center.trend)}`}>
                    {center.trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {center.trend >= 0 ? '+' : ''}
                    {center.trend.toFixed(1)}%
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={SPRING}
              >
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-text-2">
                  {totalLabel}
                </div>
                <div className="mt-1.5 mb-0.5 font-display text-[clamp(30px,5vw,40px)] leading-none font-bold tracking-[-0.03em] text-text-0">
                  {valuePrefix}
                  <AnimatedNumber value={total} />
                  {unit}
                </div>
                <div className="mt-2 max-w-37.5 text-[11.5px] leading-[1.4] text-text-2">{idleHint}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Legend doubles as an interaction surface — fades in after the ring */}
      <motion.div
        className="flex min-w-47.5 flex-col gap-1"
        initial={{ opacity: 0, y: 10 }}
        animate={built ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        {segments.map((s) => {
          const highlight = ownHover === s.index || extIndex === s.index;
          const dim = anyActive && !highlight;
          return (
            <div
              key={s.index}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition-[background-color,border-color,opacity] duration-350 ${
                highlight ? 'border-border bg-[#0b0b0b0c]' : 'border-transparent hover:border-border hover:bg-[#0b0b0b0c]'
              } ${dim ? 'opacity-40' : ''}`}
              onMouseEnter={(e) => setHover(s.index, e)}
              onMouseMove={moveHover}
              onMouseLeave={clear}
            >
              <span
                className="h-3 w-3 flex-none rounded"
                style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})`, boxShadow: `0 0 10px 0 ${s.glow}` }}
              />
              <span className="flex-1 text-[13.5px] font-medium text-text-1">{s.fullLabel}</span>
              <span className="font-display text-[13.5px] font-semibold text-text-0 [font-variant-numeric:tabular-nums]">
                {s.pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </motion.div>

      <FloatingTooltip open={tip !== null && ownHover !== null} cursor={tip ? { x: tip.x, y: tip.y } : undefined}>
        {ownHover !== null && (
          <>
            <div className={TT_HEAD}>
              <span className={TT_DOT} style={{ color: segments[ownHover].glow }} />
              {segments[ownHover].fullLabel}
            </div>
            <div className={TT_VALUE}>
              {valuePrefix}
              {segments[ownHover].value}
              {unit}
            </div>
            <div className={TT_ROW}>
              <span>{shareLabel}</span>
              <span className="text-text-1">{segments[ownHover].pct.toFixed(1)}%</span>
            </div>
            {showTrend && (
              <div className={TT_ROW}>
                <span>{trendLabel}</span>
                <span className={`${TT_TREND} ${trendColor(segments[ownHover].trend)}`}>
                  {segments[ownHover].trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {segments[ownHover].trend >= 0 ? '+' : ''}
                  {segments[ownHover].trend.toFixed(1)}%
                </span>
              </div>
            )}
          </>
        )}
      </FloatingTooltip>
    </div>
  );
}
