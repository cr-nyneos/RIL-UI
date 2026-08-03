import { useState } from 'react';
import { CircleSlash, Clock, Lock, PackageOpen, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ExceptionType = 'delayed' | 'partial' | 'damaged' | 'missing' | 'blocked';

export interface ExceptionFlagItem {
  type: ExceptionType;
  detail?: string;
}

interface ExceptionFlagsProps {
  flags: ExceptionFlagItem[];
}

const ICON: Record<ExceptionType, LucideIcon> = {
  delayed: Clock,
  partial: PackageOpen,
  damaged: ShieldAlert,
  missing: CircleSlash,
  blocked: Lock,
};

const LABEL: Record<ExceptionType, string> = {
  delayed: 'Delayed',
  partial: 'Partial delivery',
  damaged: 'Damaged items',
  missing: 'Missing items',
  blocked: 'Blocked',
};

const DANGER = { color: '#EA3449', background: 'rgba(244,63,94,0.09)' };
const WARNING = { color: '#B45309', background: 'rgba(234,166,64,0.10)' };

const TONE: Record<ExceptionType, { color: string; background: string }> = {
  delayed: DANGER,
  blocked: DANGER,
  damaged: DANGER,
  partial: WARNING,
  missing: WARNING,
};

export default function ExceptionFlags({ flags }: ExceptionFlagsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (flags.length === 0) return null;

  const overflow = flags.length > 3;
  const visible = overflow ? flags.slice(0, 2) : flags;

  return (
    <div className="flex shrink-0 items-center gap-1">
      {visible.map((flag, index) => {
        const Icon = ICON[flag.type];
        const tone = TONE[flag.type];
        return (
          <div key={`${flag.type}-${index}`} className="relative">
            <div
              className="glass-inset flex h-[22px] w-[22px] items-center justify-center rounded-lg"
              style={{ background: tone.background }}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              aria-label={LABEL[flag.type]}
            >
              <Icon size={13} strokeWidth={2.3} style={{ color: tone.color }} />
            </div>
            {hovered === index && (
              <div className="glass-tooltip pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-[220px] -translate-x-1/2 px-2.5 py-1.5">
                <div className="text-[12px] font-semibold text-ink-800">{LABEL[flag.type]}</div>
                {flag.detail && (
                  <div className="text-[11px] leading-4 font-semibold text-ink-700">{flag.detail}</div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {overflow && (
        <div
          className="glass-inset flex h-[22px] items-center justify-center rounded-lg px-1.5 text-[11px] font-semibold text-ink-500"
          title={`${flags.length - 2} more exceptions`}
        >
          +{flags.length - 2}
        </div>
      )}
    </div>
  );
}
