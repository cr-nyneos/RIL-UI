import type { CSSProperties, MouseEvent, ReactNode } from 'react';

/** Retained for call-site compatibility. Decorative blooms were removed from the
 *  design system — hierarchy now comes from containers, borders and spacing. */
export type BloomTone = 'info' | 'success' | 'warning' | 'danger' | 'cyan' | 'violet' | 'neutral' | 'none';

interface GlassCardProps {
  bloom?: BloomTone;
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onMouseMove?: (e: MouseEvent<HTMLDivElement>) => void;
}

export default function GlassCard({
  interactive = false,
  className = '',
  style,
  children,
  onMouseMove,
}: GlassCardProps) {
  return (
    <div
      className={`glass-raised ${interactive ? 'glass-interactive' : ''} ${className}`}
      style={style}
      onMouseMove={onMouseMove}
    >
      {children}
    </div>
  );
}
