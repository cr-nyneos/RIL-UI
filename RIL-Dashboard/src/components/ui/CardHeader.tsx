import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface CardHeaderProps {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  pill?: ReactNode;
}

export default function CardHeader({ eyebrow, icon: Icon, title, subtitle, pill }: CardHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
          <Icon size={12} strokeWidth={2.4} />
          {eyebrow}
        </div>
        <h3 className="mt-1.5 truncate font-display text-lg font-semibold tracking-[-0.01em] text-ink-900">{title}</h3>
        {subtitle && <p className="mt-1 text-[13px] text-ink-500">{subtitle}</p>}
      </div>
      {pill && (
        <span className="glass-inset flex-none whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink-700">
          {pill}
        </span>
      )}
    </div>
  );
}
