import type { CSSProperties, ReactNode } from 'react';
import type { Tone } from '../../lib/types/ui';
import { toneToken } from '../../lib/tone';

interface BadgeProps {
  tone?: Tone;
  shape?: 'pill' | 'square';
  size?: 'xs' | 'sm' | 'md';
  variant?: 'soft' | 'glass' | 'outline';
  icon?: ReactNode;
  pulse?: boolean;
  wrap?: boolean;
  children: ReactNode;
  className?: string;
}

const SIZE: Record<NonNullable<BadgeProps['size']>, string> = {
  xs: 'px-2 py-0.5 text-[11px] leading-[14px]',
  sm: 'px-2.5 py-0.5 text-[12px] leading-4',
  md: 'px-3 py-1 text-[13px] leading-[18px]',
};

export default function Badge({
  tone = 'neutral',
  shape = 'pill',
  size = 'sm',
  variant = 'soft',
  icon,
  pulse = false,
  wrap = false,
  children,
  className = '',
}: BadgeProps) {
  const tokens = toneToken(tone);
  const style = {
    color: tokens.text,
    background: variant === 'outline' ? 'transparent' : variant === 'glass' ? 'var(--color-glass-fill-deep)' : tokens.soft,
    borderColor: variant === 'glass' ? 'var(--color-glass-edge)' : tokens.border,
  } as CSSProperties;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-bold tabular-nums ${
        shape === 'pill' ? 'rounded-full' : 'rounded-[var(--radius-sm)]'
      } ${wrap ? 'whitespace-normal text-center' : 'whitespace-nowrap'} ${SIZE[size]} ${className}`}
      style={style}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="status-dot-pulse absolute inline-flex h-full w-full rounded-full" style={{ background: tokens.text }} />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: tokens.text }} />
        </span>
      )}
      {icon && <span className="flex-none">{icon}</span>}
      {children}
    </span>
  );
}
