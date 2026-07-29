import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icon && <div className="text-ink-faint">{icon}</div>}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="text-xs text-ink-faint">{description}</p>}
    </div>
  );
}
