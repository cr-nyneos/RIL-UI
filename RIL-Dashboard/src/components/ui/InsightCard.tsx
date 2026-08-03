import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { ReactNode, TransitionEvent } from 'react';

import Button from './Button';

interface InsightCardProps {
  title: string;
  body: ReactNode;
  confidence?: number;
  icon?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export default function InsightCard({
  title,
  body,
  confidence,
  onDismiss,
  className = '',
}: InsightCardProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (!open && event.propertyName === 'grid-template-rows') onDismiss?.();
  };

  return (
    <div
      className={`grid transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${open ? 'grid-rows-[1fr] translate-y-0 opacity-100' : 'grid-rows-[0fr] -translate-y-1 opacity-0'} ${className}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="overflow-hidden">
        <div
          className="flex items-start gap-2.5 border px-3.5 py-2.5"
          style={{
            background: 'var(--color-info-soft)',
            borderColor: 'rgba(79,70,229,0.20)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {/* <span className="mt-[2px] flex-none" style={{ color: 'var(--color-info)' }}>
            {icon ?? <Sparkles size={15} strokeWidth={2.2} />}
          </span> */}
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold" style={{ color: 'var(--color-info)' }}>
              {title}
            </div>
            <div className="mt-1 text-[12.5px] font-semibold leading-[1.5] text-[var(--color-ink-700)]">{body}</div>
          </div>
          {typeof confidence === 'number' && (
            <span
              className="mt-[1px] flex-none rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-semibold tabular-nums"
              style={{ background: 'rgba(79,70,229,0.10)', color: 'var(--color-info)' }}
            >
              {confidence}% Confidence
            </span>
          )}
          <Button
            variant="icon"
            size="sm"
            aria-label="Dismiss insight"
            className="cursor-pointer mt-[-1px] h-6 w-6 flex-none"
            onClick={() => setOpen(false)}
          >
            <X size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
