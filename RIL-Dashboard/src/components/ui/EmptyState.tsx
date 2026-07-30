import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && (
        <div className="glass-inset flex h-11 w-11 items-center justify-center text-ink-500">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-[15px] leading-6 font-bold text-ink-800">{title}</p>
        {description && <p className="text-meta">{description}</p>}
      </div>
      {action}
    </div>
  );
}
