import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import FloatingTooltip, { TT_HEAD, TT_DOT, TT_VALUE, TT_ROW, TT_TREND, trendColor } from './FloatingTooltip';
import { EASE_OUT } from '../lib/motion';

export interface LinePoint {
  month: string;
  value: number;
}

interface LineChartProps {
  data?: LinePoint[];
  unit?: string;
}

const DEFAULT_DATA: LinePoint[] = [
  { month: 'Jan', value: 28 },
  { month: 'Feb', value: 31 },
  { month: 'Mar', value: 30 },
  { month: 'Apr', value: 35 },
  { month: 'May', value: 38 },
  { month: 'Jun', value: 36 },
  { month: 'Jul', value: 42 },
  { month: 'Aug', value: 45 },
  { month: 'Sep', value: 43 },
  { month: 'Oct', value: 49 },
  { month: 'Nov', value: 53 },
  { month: 'Dec', value: 57 },
];

// viewBox geometry
const VBW = 860;
const VBH = 360;
const PAD = { l: 44, r: 24, t: 28, b: 40 };
const PLOT_W = VBW - PAD.l - PAD.r;
const PLOT_H = VBH - PAD.t - PAD.b;
const DRAW = 1.7; // line draw duration (s)

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Catmull-Rom → cubic Bézier for a smooth, jag-free curve. */
function smoothLine(pts: { x: number; y: number }[]) {
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x},${p2.y.toFixed(2)}`;
  }
  return d;
}

/** A wide, gently undulating band used as flowing liquid (tiles horizontally). */
function flowBand(baseY: number, amp: number, periods: number) {
  const width = VBW * 2; // 2× so a -50% translate loops seamlessly
  const steps = periods * 8;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = baseY + Math.sin((i / steps) * periods * Math.PI * 2) * amp;
    pts.push({ x, y });
  }
  return `${smoothLine(pts)} L${width},${VBH} L0,${VBH} Z`;
}

interface Ripple {
  id: number;
  cx: number;
  cy: number;
}
interface HoverState {
  index: number;
  onX: number; // point on the line under the cursor (svg coords)
  onY: number;
  cx: number; // client coords for the tooltip
  cy: number;
}

/** Perpetual flowing-band motion, replacing the old CSS flow-x keyframe. */
function flowAnimProps(reverse: boolean, duration: number) {
  if (reduceMotion) return {};
  return {
    animate: { x: reverse ? ['0%', '50%'] : ['0%', '-50%'] },
    transition: { duration, repeat: Infinity, ease: 'linear' as const },
  };
}

export default function LineChart({ data = DEFAULT_DATA, unit = 'B' }: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(reduceMotion);
  const [drawn, setDrawn] = useState(reduceMotion);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rid = useRef(0);
  const lastRip = useRef({ x: 0, y: 0, t: 0 });
  const sampleRef = useRef<{ x: number; y: number }[]>([]);

  const { min, max } = useMemo(() => {
    const vals = data.map((d) => d.value);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [data]);

  const points = useMemo(() => {
    const span = max - min || 1;
    // pad the value range so the line never touches the top/bottom edges
    const lo = min - span * 0.18;
    const hi = max + span * 0.18;
    return data.map((d, i) => {
      const x = PAD.l + (data.length === 1 ? 0.5 : i / (data.length - 1)) * PLOT_W;
      const y = PAD.t + (1 - (d.value - lo) / (hi - lo)) * PLOT_H;
      const prev = data[i - 1]?.value;
      const pct = prev ? ((d.value - prev) / prev) * 100 : 0;
      return { ...d, x, y, pct };
    });
  }, [data, min, max]);

  const linePath = useMemo(() => smoothLine(points), [points]);
  const areaPath = useMemo(
    () => `${linePath} L${points[points.length - 1].x},${PAD.t + PLOT_H} L${points[0].x},${PAD.t + PLOT_H} Z`,
    [linePath, points],
  );

  const yTicks = useMemo(() => {
    const span = max - min || 1;
    const lo = min - span * 0.18;
    const hi = max + span * 0.18;
    return [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      y: PAD.t + f * PLOT_H,
      value: Math.round(hi - f * (hi - lo)),
    }));
  }, [min, max]);

  // Reveal on scroll
  useEffect(() => {
    if (reduceMotion) return;
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Sample the drawn path once so cursor→line mapping sits exactly on the curve.
  useEffect(() => {
    const path = lineRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const N = 200;
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const p = path.getPointAtLength((i / N) * total);
      arr.push({ x: p.x, y: p.y });
    }
    sampleRef.current = arr;
  }, [linePath]);

  const toSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  };

  const handleMove = (e: React.MouseEvent) => {
    const p = toSvg(e.clientX, e.clientY);
    if (!p) return;

    // nearest data point by x
    let index = 0;
    let best = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - p.x);
      if (d < best) {
        best = d;
        index = i;
      }
    }

    // exact point on the curve under the cursor x (for the travelling glow)
    const samples = sampleRef.current;
    let on = { x: points[index].x, y: points[index].y };
    if (samples.length) {
      let sb = Infinity;
      for (const s of samples) {
        const d = Math.abs(s.x - p.x);
        if (d < sb) {
          sb = d;
          on = s;
        }
      }
    }

    setHover({ index, onX: on.x, onY: on.y, cx: e.clientX, cy: e.clientY });

    // Inject a ripple into the liquid beneath the cursor (throttled, damped).
    const now = performance.now();
    const moved = Math.hypot(e.clientX - lastRip.current.x, e.clientY - lastRip.current.y);
    if (moved > 10 && now - lastRip.current.t > 90 && p.y > PAD.t) {
      lastRip.current = { x: e.clientX, y: e.clientY, t: now };
      const id = rid.current++;
      setRipples((r) => [...r.slice(-7), { id, cx: p.x, cy: Math.max(p.y, points[index].y + 6) }]);
    }
  };

  const active = hover ? points[hover.index] : null;

  return (
    <div className="relative w-full" ref={wrapRef}>
      <svg
        ref={svgRef}
        className="block h-auto w-full cursor-crosshair overflow-visible"
        viewBox={`0 0 ${VBW} ${VBH}`}
        role="img"
        aria-label="Monthly revenue flow"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="line-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#2a78d6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
            <stop offset="55%" stopColor="rgba(42,120,214,0.16)" />
            <stop offset="100%" stopColor="rgba(42,120,214,0.02)" />
          </linearGradient>
          <linearGradient id="flow-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="100%" stopColor="rgba(42,120,214,0)" />
          </linearGradient>
          <radialGradient id="ripple-grad">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="70%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <clipPath id="area-clip">
            <path d={areaPath} />
          </clipPath>
          {/* left→right reveal for the liquid area, synced to the line draw */}
          <clipPath id="reveal-clip">
            <motion.rect
              x={0}
              y={0}
              height={VBH}
              initial={{ width: reduceMotion ? VBW : 0 }}
              animate={inView ? { width: VBW } : {}}
              transition={{ duration: DRAW, ease: EASE_OUT, delay: 0.2 }}
            />
          </clipPath>
          <filter id="line-blur" x="-20%" y="-40%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Grid + axes (fade in first) */}
        <motion.g
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          {yTicks.map((t, i) => (
            <line key={i} className="stroke-grid" strokeWidth={1} x1={PAD.l} y1={t.y} x2={VBW - PAD.r} y2={t.y} />
          ))}
          <line className="stroke-axis" strokeWidth={1} x1={PAD.l} y1={PAD.t + PLOT_H} x2={VBW - PAD.r} y2={PAD.t + PLOT_H} />
        </motion.g>

        {/* Liquid area: gradient + slow flowing bands, clipped to the shape and
            wiped in left→right. The top edge is the line, so data stays exact. */}
        <g clipPath="url(#reveal-clip)">
          <g clipPath="url(#area-clip)">
            <path d={areaPath} fill="url(#line-area)" />
            <motion.path
              className="opacity-[0.5]"
              style={{ transformBox: 'fill-box' }}
              d={flowBand(PAD.t + PLOT_H * 0.5, 12, 4)}
              fill="url(#flow-grad)"
              filter="url(#line-blur)"
              {...flowAnimProps(false, 28)}
            />
            <motion.path
              className="opacity-[0.34]"
              style={{ transformBox: 'fill-box' }}
              d={flowBand(PAD.t + PLOT_H * 0.62, 16, 2)}
              fill="url(#flow-grad)"
              filter="url(#line-blur)"
              {...flowAnimProps(true, 44)}
            />
            <motion.path
              className="opacity-[0.22]"
              style={{ transformBox: 'fill-box' }}
              d={flowBand(PAD.t + PLOT_H * 0.4, 9, 6)}
              fill="url(#flow-grad)"
              filter="url(#line-blur)"
              {...flowAnimProps(false, 60)}
            />

            {/* cursor ripples, clipped so they live inside the liquid only */}
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.circle
                  key={r.id}
                  cx={r.cx}
                  cy={r.cy}
                  r={9}
                  fill="url(#ripple-grad)"
                  initial={{ scale: 0.2, opacity: 0.8 }}
                  animate={{ scale: 6, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: 'easeOut' }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  onAnimationComplete={() =>
                    setRipples((list) => list.filter((x) => x.id !== r.id))
                  }
                />
              ))}
            </AnimatePresence>
          </g>
        </g>

        {/* Glow underlay + the line itself, drawn progressively */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#line-stroke)"
          strokeWidth={7}
          strokeLinecap="round"
          filter="url(#line-blur)"
          initial={{ pathLength: reduceMotion ? 1 : 0, opacity: 0.35 }}
          animate={
            reduceMotion
              ? { pathLength: 1 }
              : { pathLength: inView ? 1 : 0, opacity: [0.35, 0.6, 0.35] }
          }
          transition={{
            pathLength: { duration: DRAW, ease: EASE_OUT, delay: 0.2 },
            opacity: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        <motion.path
          ref={lineRef}
          d={linePath}
          fill="none"
          stroke="url(#line-stroke)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reduceMotion ? 1 : 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: DRAW, ease: EASE_OUT, delay: 0.2 }}
          onAnimationComplete={() => setDrawn(true)}
        />

        {/* Travelling highlight that rides the line toward the nearest point */}
        {hover && (
          <motion.circle
            r={5}
            fill="#2a78d6"
            animate={{ cx: hover.onX, cy: hover.onY }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(42,120,214,0.75))' }}
          />
        )}

        {/* Data points — appear as the line reaches them */}
        {points.map((p, i) => {
          const isActive = hover?.index === i;
          return (
            <motion.g
              key={p.month}
              initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                delay: 0.2 + (i / (points.length - 1)) * DRAW,
                type: 'spring',
                stiffness: 320,
                damping: 18,
              }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              {isActive && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={7}
                  fill="none"
                  stroke="rgba(42,120,214,0.5)"
                  strokeWidth={1.5}
                  initial={{ scale: 0.6, opacity: 0.8 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut', repeat: Infinity }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              )}
              <motion.circle
                cx={p.x}
                r={isActive ? 5.5 : 3.2}
                fill="#fcfcfb"
                stroke="url(#line-stroke)"
                strokeWidth={isActive ? 2.4 : 1.8}
                animate={{ cy: isActive ? p.y - 3 : p.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ filter: isActive ? 'drop-shadow(0 0 9px rgba(42,120,214,0.6))' : 'none' }}
              />
            </motion.g>
          );
        })}

        {/* Axis labels — revealed after the line finishes drawing */}
        <motion.g
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={drawn ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          {yTicks.map((t, i) => (
            <text key={i} className="fill-text-2 font-sans text-[11px] font-medium" x={PAD.l - 12} y={t.y + 4} textAnchor="end">
              {t.value}
            </text>
          ))}
          {points.map((p, i) => (
            <text
              key={p.month}
              className={`font-sans text-[11px] font-medium transition-[fill] duration-300 ${hover?.index === i ? 'fill-text-0' : 'fill-text-2'}`}
              x={p.x}
              y={PAD.t + PLOT_H + 22}
              textAnchor="middle"
            >
              {p.month}
            </text>
          ))}
        </motion.g>
      </svg>

      <FloatingTooltip open={!!(hover && active)} cursor={hover ? { x: hover.cx, y: hover.cy } : undefined}>
        {active && (
          <>
            <div className={TT_HEAD}>
              <span className={TT_DOT} style={{ color: '#2a78d6' }} />
              {active.month} · FY24
            </div>
            <div className={TT_VALUE}>
              ${active.value}
              {unit}
            </div>
            <div className={TT_ROW}>
              <span>MoM change</span>
              <span className={`${TT_TREND} ${trendColor(active.pct)}`}>
                {active.pct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {active.pct >= 0 ? '+' : ''}
                {active.pct.toFixed(1)}%
              </span>
            </div>
          </>
        )}
      </FloatingTooltip>
    </div>
  );
}
