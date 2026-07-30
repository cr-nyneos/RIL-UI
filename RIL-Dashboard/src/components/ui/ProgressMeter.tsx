import { useEffect, useState } from 'react';

export type ProgressTone = 'neutral' | 'danger';

interface ProgressMeterProps {
  value: number;
  tone?: ProgressTone;
  showLabel?: boolean;
  delay?: number;
  className?: string;
}

const FILL: Record<ProgressTone, string> = {
  neutral: 'linear-gradient(90deg, #4F46E5, #8B5CF6)',
  danger: 'linear-gradient(90deg, #F43F5E, #BE123C)',
};

const GLOW: Record<ProgressTone, string> = {
  neutral: 'rgba(79,70,229,0.45)',
  danger: 'rgba(244,63,94,0.45)',
};

export default function ProgressMeter({
  value,
  tone = 'neutral',
  showLabel = false,
  delay = 0,
  className = '',
}: ProgressMeterProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(value), delay + 20);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-1 text-right text-[13px] font-bold tabular-nums text-ink-800">{value}%</div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: 'rgba(15,23,42,0.07)' }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-fill relative h-full rounded-full"
          style={{
            width: `${width}%`,
            background: FILL[tone],
            boxShadow: `0 0 8px -1px ${GLOW[tone]}`,
            transition: 'width 800ms cubic-bezier(.16,1,.3,1)',
          }}
        >
          {/* specular highlight along the top edge of the liquid */}
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full"
            style={{ background: 'rgba(255,255,255,0.45)' }}
          />
        </div>
      </div>
    </div>
  );
}
