import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Tone } from '../../lib/types/ui';
import { toneToken } from '../../lib/tone';
import Button from './Button';

interface AlertProps {
  tone?: Extract<Tone, 'info' | 'success' | 'warning' | 'danger' | 'neutral'>;
  icon?: ReactNode;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export default function Alert({ tone = 'info', icon, children, dismissible = false, onDismiss, className = '' }: AlertProps) {
  const tokens = toneToken(tone);
  return (
    <div
      className={`glass-inset flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-semibold ${className}`}
      style={{ color: tokens.text, background: tokens.soft, borderColor: tokens.border, borderRadius: 'var(--radius-sm)' }}
    >
      {icon && <span className="flex-none">{icon}</span>}
      <span className="min-w-0 flex-1">{children}</span>
      {dismissible && (
        <Button variant="icon" size="sm" aria-label="Dismiss alert" onClick={onDismiss} className="h-6 w-6">
          <X size={13} />
        </Button>
      )}
    </div>
  );
}
