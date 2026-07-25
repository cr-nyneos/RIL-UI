import { useMemo, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { SEGMENTS, SEGMENT_TOTAL, type Segment } from '../data/segments';
import { SPRING } from '../lib/motion';
import './PieChart.css';

const CX = 120;
const CY = 120;
const R_OUT = 100;
const R_IN = 64;
const GAP = 0; // slices touch: the ring reads as one continuous object

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
}

export default function PieChart({ externalActiveKey = null, onHoverKey, unit = 'B' }: PieChartProps) {
  const [tip, setTip] = useState<TooltipState | null>(null);
  const ownHover = tip?.index ?? null;

  const segments = useMemo<SliceGeom[]>(() => {
    const steps = SEGMENTS.map((d) => (d.value / SEGMENT_TOTAL) * Math.PI * 2);
    // Cumulative start angle for each slice, beginning at 12 o'clock.
    const starts = steps.reduce<number[]>((arr, _, i) => {
      arr.push(i === 0 ? -Math.PI / 2 : arr[i - 1] + steps[i - 1]);
      return arr;
    }, []);
    return SEGMENTS.map((d, index) => {
      const start = starts[index] + GAP / 2;
      const end = starts[index] + steps[index] - GAP / 2;
      const mid = (start + end) / 2;
      return {
        ...d,
        index,
        pct: (d.value / SEGMENT_TOTAL) * 100,
        mid,
        path: segmentPath(start, end, R_OUT, R_IN),
      };
    });
  }, []);

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
    <div className="donut-layout">
      <div className="donut" onMouseLeave={clear}>
        <div className="donut-breathe">
          <svg viewBox="0 0 240 240" role="img" aria-label="Revenue by segment">
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
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.55" />
              </filter>
            </defs>

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
                    className="donut-slice"
                    d={s.path}
                    fill={`url(#slice-${s.index})`}
                    /* Stroke matches the fill so touching edges seam invisibly
                       into one ring; only a lifted slice reveals a gap. */
                    stroke={`url(#slice-${s.index})`}
                    strokeWidth={1}
                    strokeLinejoin="round"
                    style={{ filter: highlight ? `drop-shadow(0 0 14px ${s.glow})` : 'none' }}
                    initial={{ opacity: 0, scale: 0.55 }}
                    animate={{
                      opacity: isDim ? 0.5 : 1,
                      scale: isOwn ? 1.06 : isExt ? 1.03 : 1,
                      x: dx,
                      y: dy,
                    }}
                    transition={{
                      opacity: { duration: 0.5, delay: 0.15 + s.index * 0.09 },
                      scale: SPRING,
                      x: SPRING,
                      y: SPRING,
                    }}
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
          </svg>
        </div>

        {/* Morphing center panel */}
        <div className="donut-center">
          <AnimatePresence mode="wait">
            {center ? (
              <motion.div
                key={center.key}
                initial={{ opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.94 }}
                transition={SPRING}
              >
                <div className="dc-eyebrow">{center.fullLabel}</div>
                <div className="dc-value">
                  ${center.value}
                  {unit}
                </div>
                <div className="dc-pct" style={{ color: center.glow }}>
                  {center.pct.toFixed(1)}% of revenue
                </div>
                <div className="dc-desc">{center.description}</div>
                <span className={`dc-trend ${center.trend >= 0 ? 'up' : 'down'}`}>
                  {center.trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {center.trend >= 0 ? '+' : ''}
                  {center.trend.toFixed(1)}%
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={SPRING}
              >
                <div className="dc-eyebrow">Total Revenue</div>
                <div className="dc-value">
                  $<AnimatedNumber value={SEGMENT_TOTAL} />
                  {unit}
                </div>
                <div className="dc-desc">Hover a segment for the breakdown</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legend doubles as an interaction surface */}
      <div className="donut-legend">
        {segments.map((s) => {
          const highlight = ownHover === s.index || extIndex === s.index;
          return (
            <div
              key={s.index}
              className={`leg-item${highlight ? ' is-active' : ''}${
                anyActive && !highlight ? ' is-dim' : ''
              }`}
              style={{ '--sw-glow': s.glow } as CSSProperties}
              onMouseEnter={(e) => setHover(s.index, e)}
              onMouseMove={moveHover}
              onMouseLeave={clear}
            >
              <span
                className="leg-swatch"
                style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
              />
              <span className="leg-name">{s.fullLabel}</span>
              <span className="leg-val">{s.pct.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {tip && ownHover !== null && (
          <motion.div
            className="chart-tooltip"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, x: tip.x + 18, y: tip.y - 24 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
          >
            <div className="tt-head">
              <span className="tt-dot" style={{ color: segments[ownHover].glow }} />
              {segments[ownHover].fullLabel}
            </div>
            <div className="tt-value">
              ${segments[ownHover].value}
              {unit}
            </div>
            <div className="tt-row">
              <span>Share</span>
              <span style={{ color: 'var(--text-1)' }}>{segments[ownHover].pct.toFixed(1)}%</span>
            </div>
            <div className="tt-row">
              <span>YoY trend</span>
              <span className={`tt-trend ${segments[ownHover].trend >= 0 ? 'up' : 'down'}`}>
                {segments[ownHover].trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {segments[ownHover].trend >= 0 ? '+' : ''}
                {segments[ownHover].trend.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
