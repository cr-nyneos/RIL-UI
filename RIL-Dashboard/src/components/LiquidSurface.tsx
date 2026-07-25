import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Procedural liquid surface — regenerated every animation frame from physics
 * state (never a looping keyframe). It is tuned to read as *heavy water in a
 * glass*, not a waveform:
 *
 *  • the dominant motion is a single, slow "slosh" spring — the whole body of
 *    water tilts, overshoots and settles like a gently moved glass;
 *  • only two long-wavelength modes add soft secondary swell, so the surface
 *    is always made of long gentle curves — no high-frequency zig-zag;
 *  • the crest is drawn as a Catmull-Rom spline → rounded crests & troughs;
 *  • the cursor applies a *force* (not an instant velocity), so the liquid
 *    accelerates, builds momentum, keeps moving after the cursor stops, then
 *    slowly calms to a faint ambient swell over ~1.5s.
 */
export interface LiquidHandle {
  /**
   * Inject energy. vx = signed horizontal cursor velocity (px/ms),
   * speed = |velocity|, px = cursor position across the bar (0..1).
   */
  impulse: (vx: number, speed: number, px?: number) => void;
}

interface LiquidSurfaceProps {
  from: string; // light top color
  to: string; // dark bottom color
  /** Target fill level as a fraction of the glass height (0..1). */
  fill: number;
  /** ms to wait before the liquid begins filling on mount. */
  fillDelay?: number;
}

interface Mode {
  k: number; // spatial frequency (cycles across the width) — kept low
  speed: number; // phase drift (rad/s) — slow
  ambient: number; // resting amplitude
  boost: number;
  amp: number;
  phase: number;
}

const W = 100;
const H = 100;
const POINTS = 9; // few sample points; the spline smooths between them
const TOP_LIMIT = 3; // crest may approach the rim but never crosses it

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Smooth closed liquid path through sample points via Catmull-Rom → Bézier. */
function buildPaths(pts: { x: number; y: number }[]) {
  const n = pts.length;
  let top = `M${pts[0].x},${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    top += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x},${p2.y.toFixed(2)}`;
  }
  return { crest: top, body: `${top} L${W},${H} L0,${H} Z` };
}

const LiquidSurface = forwardRef<LiquidHandle, LiquidSurfaceProps>(function LiquidSurface(
  { from, to, fill, fillDelay = 300 },
  ref,
) {
  const bodyRef = useRef<SVGPathElement>(null);
  const crestRef = useRef<SVGPathElement>(null);

  // --- physics state (refs; the loop mutates the DOM directly) ---
  const slosh = useRef({ v: 0, vel: 0 }); // whole-body tilt + its velocity
  const drive = useRef(0); // sustained cursor force, decays over time
  const travelDir = useRef(1);
  const fillCur = useRef(0);
  const modes = useRef<Mode[]>([
    { k: 0.6, speed: 0.5, ambient: 0.8, boost: 2.0, amp: 0.8, phase: 0.4 },
    { k: 1.15, speed: 0.72, ambient: 0.45, boost: 1.3, amp: 0.45, phase: 2.3 },
  ]);

  useImperativeHandle(
    ref,
    () => ({
      impulse(vx, speed, px) {
        if (prefersReduced) return;
        if (vx !== 0) travelDir.current = Math.sign(vx);
        // Cursor applies a force (blended), not an instant velocity → the
        // heavy liquid accelerates gradually and keeps its momentum.
        drive.current = Math.max(-2.6, Math.min(2.6, drive.current * 0.55 + vx));
        const e = Math.min(1, speed * 0.8);
        for (const m of modes.current) m.amp = Math.min(m.ambient + 3.4, m.amp + e * m.boost);
        // Position bias: steer the primary swell to rise near the cursor.
        if (px !== undefined) {
          const m = modes.current[0];
          const target = -Math.PI / 2 - m.k * 2 * Math.PI * px;
          m.phase += (target - m.phase) * 0.12;
        }
      },
    }),
    [],
  );

  useEffect(() => {
    const target = Math.max(0, Math.min(1, fill));

    if (prefersReduced) {
      fillCur.current = target;
      renderFrame();
      return;
    }

    let raf = 0;
    let last = performance.now();
    const startAt = last + fillDelay;

    function step(now: number) {
      const dt = Math.min(0.045, (now - last) / 1000);
      last = now;

      if (now >= startAt) fillCur.current += (target - fillCur.current) * Math.min(1, dt * 2.4);

      // Heavy, slow slosh spring driven by the sustained cursor force.
      const s = slosh.current;
      drive.current *= Math.exp(-dt / 0.16);
      const acc = -34 * s.v - 4.6 * s.vel + drive.current * 170;
      s.vel += acc * dt;
      s.v += s.vel * dt;
      s.v = Math.max(-12, Math.min(12, s.v));

      let extra = 0;
      for (const m of modes.current) extra += m.amp - m.ambient;
      const energy = Math.min(1, extra / 5);
      const relax = Math.exp(-dt / 0.7); // slow amplitude decay
      for (const m of modes.current) {
        m.amp = m.ambient + (m.amp - m.ambient) * relax;
        m.phase += m.speed * (0.4 + energy) * travelDir.current * dt;
      }

      renderFrame();
      raf = requestAnimationFrame(step);
    }

    function renderFrame() {
      const yBase = H - fillCur.current * H;
      const tilt = slosh.current.v;
      const ms = modes.current;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i <= POINTS; i++) {
        const x = (i / POINTS) * W;
        const norm = (x - W / 2) / (W / 2); // -1..1, smooth whole-body tilt
        let y = yBase + tilt * norm;
        for (const m of ms) y -= m.amp * Math.sin(m.k * 2 * Math.PI * (x / W) + m.phase);
        y = Math.max(TOP_LIMIT, Math.min(H, y));
        pts.push({ x, y });
      }
      const { crest, body } = buildPaths(pts);
      bodyRef.current?.setAttribute('d', body);
      crestRef.current?.setAttribute('d', crest);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [fill, fillDelay]);

  const gradId = `liq-${from.replace('#', '')}-${to.replace('#', '')}`;

  return (
    <svg className="liquid-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={H}>
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <path ref={bodyRef} d="" fill={`url(#${gradId})`} />
      <path ref={crestRef} d="" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={1} />
    </svg>
  );
});

export default LiquidSurface;
