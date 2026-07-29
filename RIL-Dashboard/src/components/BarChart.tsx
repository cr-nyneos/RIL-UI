import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import FloatingTooltip, { TT_HEAD, TT_DOT, TT_VALUE, TT_ROW, TT_TREND, trendColor } from './FloatingTooltip';
import LiquidSurface, { type LiquidHandle } from './LiquidSurface';
import { SEGMENTS, SEGMENT_MAX, SEGMENT_TOTAL, type Segment } from '../data/segments';
import { SPRING } from '../lib/motion';

interface BarChartProps {
  /** Key of a segment hovered elsewhere (e.g. the pie) to soft-highlight. */
  externalActiveKey?: string | null;
  /** Reports the key the user is hovering here, for cross-chart linking. */
  onHoverKey?: (key: string | null) => void;
  unit?: string;
}

interface TooltipState {
  index: number;
  /** Hovered bar's rect, so the tooltip can sit safely below it. */
  rect: { left: number; bottom: number; width: number };
}

const FILL_PCT = 86; // liquid level within each glass (%)

/** Tiny deterministic PRNG so per-bar randomness is stable across renders. */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Ripple {
  id: number;
  x: number; // % across the liquid
  y: number; // % down the liquid
  scale: number; // organic max expansion
  dur: number; // organic lifetime (s)
}

interface BubbleSpec {
  left: number;
  size: number;
  dur: number;
  durHot: number;
  delay: number;
}

function Bar({
  datum,
  index,
  external,
  filled,
  onEnter,
  onLeave,
}: {
  datum: Segment;
  index: number;
  external: boolean;
  filled: boolean;
  onEnter: (i: number, e: React.MouseEvent) => void;
  onLeave: () => void;
}) {
  const [ownHover, setOwnHover] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [splashKey, setSplashKey] = useState(0);
  const rid = useRef(0);
  const lastMove = useRef({ x: 0, t: 0 });
  const liquid = useRef<LiquidHandle>(null);

  const hot = ownHover || external;

  const ratio = datum.value / SEGMENT_MAX;
  const glassPct = 34 + ratio * 66; // bar height encodes value → reads as a bar chart
  const intensity = 0.26 + ratio * 0.5;

  // Keep the ripple list bounded so overlapping ripples stay cheap.
  const spawnRipple = (x = 50, y = 18, scale = 8, dur = 1.1) => {
    const id = rid.current++;
    setRipples((r) => [...r.slice(-9), { id, x, y, scale, dur }]);
  };

  const fracX = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return (e.clientX - rect.left) / rect.width;
  };

  const handleEnter = (e: React.MouseEvent) => {
    setOwnHover(true);
    setSplashKey((k) => k + 1);
    lastMove.current = { x: e.clientX, t: performance.now() };
    liquid.current?.impulse(0, 0.5, fracX(e)); // gentle "pick up the glass" settle
    onEnter(index, e);
  };
  const handleLeave = () => {
    setOwnHover(false);
    onLeave();
  };
  const handleMove = (e: React.MouseEvent) => {
    const now = performance.now();
    const dt = now - lastMove.current.t || 16;
    const vx = (e.clientX - lastMove.current.x) / dt; // signed px/ms
    lastMove.current = { x: e.clientX, t: now };
    // Every movement applies a force to the fluid: direction from vx sign,
    // strength from speed, swell biased to the cursor position. The surface
    // handles momentum, overshoot and decay.
    liquid.current?.impulse(vx, Math.abs(vx), fracX(e));
  };
  const handleClick = (e: React.MouseEvent) => {
    const px = fracX(e);
    // A click is a vertical "drop": symmetric energy + a single impact ring.
    liquid.current?.impulse(0, 1, px);
    spawnRipple(px * 100, 30, 6, 1.2);
  };

  const bubbles = useMemo<BubbleSpec[]>(() => {
    const r = seeded(index * 97 + 13);
    return Array.from({ length: 5 }, () => ({
      left: 12 + r() * 70,
      size: 3 + r() * 5,
      dur: 3.4 + r() * 2.8,
      durHot: 1.6 + r() * 1.2,
      delay: r() * 4,
    }));
  }, [index]);

  // Deterministic droplet spread; re-mounts (via splashKey) replay the arc.
  const droplets = useMemo(() => {
    const r = seeded(index * 31 + 7);
    return Array.from({ length: 5 }, (_, i) => ({
      dx: (i - 2) * 9 + (r() * 6 - 3),
      dy: -18 - r() * 16,
    }));
  }, [index]);

  const glassShadow = hot
    ? `0 1px 0 #ffffffe6 inset, 0 0 0 1px #ffffff0a inset, 0 26px 46px -22px #0b0b0b59, 0 0 34px -6px ${datum.glow}`
    : '0 1px 0 #ffffffcc inset, 0 0 0 1px #ffffff05 inset, 0 22px 38px -26px #0b0b0b40';

  return (
    <motion.div
      className="relative flex h-full flex-1 origin-bottom cursor-pointer flex-col items-center justify-end will-change-transform"
      animate={{ scale: ownHover ? 1.05 : external ? 1.02 : 1, y: hot ? -6 : 0 }}
      transition={SPRING}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMove}
      onClick={handleClick}
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
        <AnimatedNumber value={datum.value} prefix="$" suffix="B" delay={0.3 + index * 0.08} />
      </motion.div>

      <div
        className="relative mx-auto w-full max-w-[92px] overflow-hidden rounded-t-[10px] rounded-b-[8px] border bg-[linear-gradient(100deg,#ffffffb3,#ffffff0d_40%,#ffffff80)] backdrop-blur-[2px] transition-[border-color,box-shadow] duration-450 max-[560px]:max-w-[60px]"
        style={{ height: `${glassPct}%`, borderColor: hot ? '#0b0b0b33' : '#0b0b0b1f', boxShadow: glassShadow }}
      >
        <motion.span
          className="pointer-events-none absolute -bottom-[6%] left-1/2 h-[62%] w-[150%] -translate-x-1/2 rounded-full blur-[18px]"
          style={{ background: `radial-gradient(closest-side, ${datum.glow}, transparent 72%)` }}
          animate={{ opacity: hot ? 1 : intensity, height: hot ? '92%' : '62%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        <div className="absolute inset-0 overflow-hidden rounded-t-[9px] rounded-b-[7px]">
          <LiquidSurface
            ref={liquid}
            from={datum.from}
            to={datum.to}
            fill={filled ? FILL_PCT / 100 : 0}
            fillDelay={160 + index * 130}
          />

          {bubbles.map((b, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute bottom-1 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffffe6,#ffffff1f)] shadow-[0_0_6px_#ffffff66]"
              style={{ left: `${b.left}%`, width: b.size, height: b.size }}
              animate={{ y: [0, -160], opacity: [0, 0.9, 0.9, 0] }}
              transition={{
                duration: hot ? b.durHot : b.dur,
                repeat: Infinity,
                ease: 'linear',
                delay: b.delay,
                times: [0, 0.15, 0.85, 1],
              }}
            />
          ))}

          <AnimatePresence>
            {ripples.map((r) => (
              <motion.span
                key={r.id}
                className="pointer-events-none absolute h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white/60 [mix-blend-mode:screen]"
                style={{ left: `${r.x}%`, top: `${r.y}%` }}
                initial={{ scale: 0, opacity: 0.55 }}
                animate={{ scale: r.scale, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: r.dur, ease: 'easeOut' }}
                onAnimationComplete={() => setRipples((list) => list.filter((x) => x.id !== r.id))}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Splash crown at the waterline, retriggered on each cursor entry */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[86%] h-0">
          <AnimatePresence>
            {ownHover && (
              <motion.div key={splashKey} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                <motion.span
                  className="absolute bottom-0 left-1/2 h-2 w-[26px] -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white/85"
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
                {droplets.map((d, i) => (
                  <motion.span
                    key={i}
                    className="absolute bottom-0 h-[5px] w-[5px] rounded-full"
                    style={{
                      left: '50%',
                      background: `radial-gradient(circle at 35% 30%, #fff, ${datum.from})`,
                      boxShadow: `0 0 8px ${datum.from}`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 0.95, scale: 1 }}
                    animate={{ x: d.dx, y: [0, d.dy, 4], opacity: [0.95, 1, 0], scale: [1, 0.9, 0.5] }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="pointer-events-none absolute top-[5%] left-[11%] h-[84%] w-1/5 rounded-[30px] bg-[linear-gradient(180deg,#ffffff80,transparent)] opacity-45 blur-[1.5px]" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          {hot && (
            <>
              <motion.span
                className="absolute -top-[30%] left-0 h-[160%] w-[42%] rotate-[8deg] bg-[linear-gradient(105deg,transparent,#ffffff29,transparent)]"
                initial={{ x: '-180%' }}
                animate={{ x: ['-180%', '320%', '320%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.6, 1] }}
              />
              <motion.span
                className="absolute -top-[30%] left-0 h-[160%] w-[42%] rotate-[8deg] bg-[linear-gradient(105deg,transparent,#ffffff29,transparent)]"
                initial={{ x: '-180%' }}
                animate={{ x: ['-180%', '320%', '320%'] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.6, 1], delay: 1.2 }}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function BarChart({ externalActiveKey = null, onHoverKey, unit = 'B' }: BarChartProps) {
  const [tip, setTip] = useState<TooltipState | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Bars fill only once the section scrolls into view.
  const filled = useInView(wrapRef, { once: true, amount: 0.4 });

  const handleEnter = (index: number, e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTip({ index, rect: { left: r.left, bottom: r.bottom, width: r.width } });
    onHoverKey?.(SEGMENTS[index].key);
  };
  const clear = () => {
    setTip(null);
    onHoverKey?.(null);
  };

  const active = tip ? SEGMENTS[tip.index] : null;

  return (
    <>
      <div
        className="relative flex h-85 items-end justify-between gap-[clamp(12px,2.6vw,28px)] px-1 pt-2 max-[560px]:h-65"
        ref={wrapRef}
        onMouseLeave={clear}
      >
        {SEGMENTS.map((d, i) => (
          <Bar
            key={d.key}
            datum={d}
            index={i}
            external={externalActiveKey === d.key}
            filled={filled}
            onEnter={handleEnter}
            onLeave={clear}
          />
        ))}
      </div>

      <div className="mx-1 mt-3.5 h-px bg-[linear-gradient(90deg,transparent,var(--color-border-hi),transparent)]" />
      <div className="flex justify-between gap-[clamp(12px,2.6vw,28px)] px-1 pt-3">
        {SEGMENTS.map((d, i) => {
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
              ${active.value}
              {unit}
            </div>
            <div className={TT_ROW}>
              <span>Share of revenue</span>
              <span className="text-text-1">{((active.value / SEGMENT_TOTAL) * 100).toFixed(1)}%</span>
            </div>
            <div className={TT_ROW}>
              <span>YoY trend</span>
              <span className={`${TT_TREND} ${trendColor(active.trend)}`}>
                {active.trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {active.trend >= 0 ? '+' : ''}
                {active.trend.toFixed(1)}%
              </span>
            </div>
          </>
        )}
      </FloatingTooltip>
    </>
  );
}
