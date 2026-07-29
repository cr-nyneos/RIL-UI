import type { ReactNode } from 'react';

export default function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`glass-inset inline-flex flex-none items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink-700 ${className}`}
    >
      {children}
    </span>
  );
}
