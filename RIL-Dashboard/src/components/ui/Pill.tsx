import type { ReactNode } from 'react';

export default function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`glass-inset inline-flex flex-none items-center whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink-700 ${className}`}
    >
      {children}
    </span>
  );
}
