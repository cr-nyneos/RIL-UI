import type { CSSProperties, MouseEvent, ReactNode } from 'react';

export type BloomTone = 'info' | 'success' | 'warning' | 'danger' | 'cyan' | 'violet' | 'neutral' | 'none';

interface GlassCardProps {
  bloom?: BloomTone;
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onMouseMove?: (e: MouseEvent<HTMLDivElement>) => void;
}

const BLOOM_VAR: Record<Exclude<BloomTone, 'none'>, string> = {
  info: 'var(--bloom-brand)',
  success: 'var(--bloom-success)',
  warning: 'var(--bloom-warning)',
  danger: 'var(--bloom-danger)',
  cyan: 'var(--bloom-cyan)',
  violet: 'var(--bloom-violet)',
  neutral: 'var(--bloom-neutral)',
};

export default function GlassCard({
  bloom = 'none',
  interactive = false,
  className = '',
  style,
  children,
  onMouseMove,
}: GlassCardProps) {
  const cardStyle =
    bloom !== 'none'
      ? ({ ...style, '--bloom': BLOOM_VAR[bloom] } as CSSProperties)
      : style;

  return (
    <div
      className={`glass-raised ${interactive ? 'glass-interactive' : ''} ${className}`}
      style={cardStyle}
      onMouseMove={onMouseMove}
    >
      {children}
    </div>
  );
}
