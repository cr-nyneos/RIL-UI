export type SparklineTone = 'info' | 'success' | 'warning' | 'danger';

interface SparklineProps {
  data: number[];
  tone?: SparklineTone;
  className?: string;
}

const TONE_COLOR: Record<SparklineTone, string> = {
  info: '#4F46E5',
  success: '#059669',
  warning: '#D97706',
  danger: '#E11D48',
};

const W = 160;
const H = 44;

export default function Sparkline({ data, tone = 'info', className = '' }: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = W / (data.length - 1);
  const points = data.map((v, i) => ({ x: i * step, y: H - ((v - min) / span) * (H - 6) - 3 }));
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const color = TONE_COLOR[tone];
  const gid = `spark-${tone}`;

  return (
    <svg
      className={`block w-full ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}
