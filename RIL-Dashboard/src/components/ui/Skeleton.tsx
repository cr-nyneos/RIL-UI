interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  lines?: number;
  width?: string;
  height?: string;
  className?: string;
}

const VARIANT: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'h-3 rounded-[var(--radius-sm)]',
  rect: 'rounded-[var(--radius-md)]',
  circle: 'rounded-full',
};

export default function Skeleton({ variant = 'text', lines = 1, width, height, className = '' }: SkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`grid gap-2 ${className}`} aria-hidden>
        {Array.from({ length: lines }).map((_, index) => (
          <span
            key={index}
            className={`skeleton block ${VARIANT.text}`}
            style={{ width: index === lines - 1 ? '62%' : width ?? '100%' }}
          />
        ))}
      </div>
    );
  }

  return <span className={`skeleton block ${VARIANT[variant]} ${className}`} style={{ width, height }} aria-hidden />;
}
