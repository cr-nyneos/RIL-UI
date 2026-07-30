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
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-3.5">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-eyebrow uppercase">
          <Icon size={12} strokeWidth={2.4} />
          {eyebrow}
        </div>
        <h3 className="mt-1 truncate font-display text-card-title">{title}</h3>
        {subtitle && <p className="mt-0.5 text-subtitle">{subtitle}</p>}
      </div>
      {pill && (
        <span className="glass-inset flex-none whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1 text-pill">
          {pill}
        </span>
      )}
    </div>
  );
}
