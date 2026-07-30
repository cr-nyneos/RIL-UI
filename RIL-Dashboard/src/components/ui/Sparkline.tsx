import { smoothPath } from '../../lib/liquidPath';

interface SparklineProps {
  data: number[];
  uid: string;
  fill: string;
  text: string;
  className?: string;
}

const VBW = 300;
const VBH = 100;

function hashStagger(uid: string, index: number) {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  return ((h + index * 97) % 100) / 100;
}

export default function Sparkline({ data, uid, fill, text, className = '' }: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = VBW / (data.length - 1);

  const points: [number, number][] = data.map((v, i) => [
    i * step,
    VBH - ((v - min) / span) * (VBH - 10) - 5,
  ]);

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L${VBW},${VBH} L0,${VBH} Z`;
  const [lastX, lastY] = points[points.length - 1];

  const bubbles = [0.18, 0.4, 0.62, 0.84].map((fx, i) => {
    const idx = Math.min(data.length - 1, Math.round(fx * (data.length - 1)));
    const py = points[idx][1];
    const stagger = hashStagger(uid, i);
    return {
      x: fx * VBW,
      y: Math.min(VBH - 8, py + 10 + stagger * 14),
      r: 1.6 + stagger * 1.2,
      delay: -stagger * 3,
      dur: 2.6 + stagger * 1.8,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      preserveAspectRatio="none"
      className={`block w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-liquid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.26" />
          <stop offset="60%" stopColor={fill} stopOpacity="0.10" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={`${uid}-surface`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={fill} stopOpacity="0.55" />
          <stop offset="100%" stopColor={fill} stopOpacity="1" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-20%" y="-60%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="2.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 1. liquid body */}
      <path d={areaPath} fill={`url(#${uid}-liquid)`} />

      {/* 2. meniscus highlight — 1px white line just under the surface */}
      <path
        d={linePath}
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="1.25"
        transform="translate(0, 2.2)"
        strokeLinecap="round"
      />

      {/* 3. the surface itself — glowing gradient stroke */}
      <path
        d={linePath}
        fill="none"
        stroke={`url(#${uid}-surface)`}
        strokeWidth="2.6"
        strokeLinecap="round"
        filter={`url(#${uid}-glow)`}
        className="kpi-surface"
      />

      {/* 4. bubbles — staggered per card so they never sync */}
      {bubbles.map((b, i) => (
        <circle
          key={i}
          cx={b.x}
          cy={b.y}
          r={b.r}
          fill="rgba(255,255,255,0.55)"
          className="kpi-bubble"
          style={{ animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}
        />
      ))}

      {/* 5. end node — halo, dot, white ring */}
      <circle cx={lastX} cy={lastY} r="7" fill={fill} opacity="0.22" className="kpi-halo" />
      <circle cx={lastX} cy={lastY} r="3.4" fill={text} />
      <circle cx={lastX} cy={lastY} r="3.4" fill="none" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}
