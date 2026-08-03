import { useEffect, useState } from 'react';

export type ProgressTone = 'neutral' | 'danger' | 'warning' | 'success';

interface ProgressMeterProps {
  value: number;
  tone?: ProgressTone;
  showLabel?: boolean;
  delay?: number;
  className?: string;
}

const FILL: Record<ProgressTone, string> = {
  neutral: 'var(--color-brand-600)',
  danger: 'var(--color-danger)',
  warning: 'var(--color-warning-bright)',
  success: 'var(--color-success)',
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
        <div className="mb-1 text-right text-[12px] font-semibold tabular-nums text-ink-800">{value}%</div>
      )}
      <div
        className="h-1.5 w-full overflow-hidden rounded-[var(--radius-sm)]"
        style={{ background: 'var(--color-chip-neutral)' }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-fill h-full rounded-[var(--radius-sm)]"
          style={{
            width: `${width}%`,
            background: FILL[tone],
            transition: 'width 500ms cubic-bezier(.16,1,.3,1)',
          }}
        />
      </div>
    </div>
  );
}
