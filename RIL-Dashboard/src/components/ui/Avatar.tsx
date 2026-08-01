import type { Size } from '../../lib/types/ui';

interface AvatarProps {
  /** Full name; the monogram is derived from it when no `src` is given. */
  name: string;
  src?: string;
  size?: Extract<Size, 'sm' | 'md' | 'lg'>;
  className?: string;
}

const SIZE: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-[12px]',
  lg: 'h-11 w-11 text-[14px]',
};

function monogram(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const classes = `flex flex-none items-center justify-center overflow-hidden rounded-[var(--radius-md)] font-bold ${SIZE[size]} ${className}`;

  if (src) {
    return <img src={src} alt="" aria-hidden className={`${classes} object-contain`} />;
  }

  return (
    <span
      aria-hidden
      title={name}
      className={classes}
      style={{
        background: 'var(--color-brand-soft2)',
        color: 'var(--color-brand-700)',
        border: '1px solid var(--color-border)',
      }}
    >
      {monogram(name)}
    </span>
  );
}
