import type { ReactNode } from 'react';

export type BloomTone = 'info' | 'success' | 'warning' | 'danger' | 'none';

interface GlassCardProps {
  bloom?: BloomTone;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

const BLOOM_COLOR: Record<Exclude<BloomTone, 'none'>, string> = {
  info: 'rgba(79, 70, 229, 0.16)',
  success: 'rgba(5, 150, 105, 0.16)',
  warning: 'rgba(217, 119, 6, 0.16)',
  danger: 'rgba(225, 29, 72, 0.16)',
};

export default function GlassCard({ bloom = 'none', interactive = false, className = '', children }: GlassCardProps) {
  return (
    <div className={`glass-raised ${interactive ? 'glass-interactive' : ''} relative overflow-hidden ${className}`}>
      {bloom !== 'none' && (
        <span
          className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-2xl"
          style={{ background: `radial-gradient(closest-side, ${BLOOM_COLOR[bloom]}, transparent 72%)` }}
        />
      )}
      {children}
    </div>
  );
}
