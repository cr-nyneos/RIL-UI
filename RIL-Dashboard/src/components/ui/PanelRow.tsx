import type { ReactNode } from 'react';
import { toneToken } from '../../lib/tone';
import type { Tone } from '../../lib/types/ui';

interface PanelRowProps {
  primary: string;
  secondary: string;
  trailing?: ReactNode;
  tone?: Tone;
}

/** One line inside a sticky context panel — identity, context, and a figure. */
export default function PanelRow({ primary, secondary, trailing, tone }: PanelRowProps) {
  return (
    <div className="flex items-start gap-3 border-b border-[var(--color-glass-hairline)] px-4 py-3 last:border-b-0">
      {tone && (
        <span
          aria-hidden
          className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full"
          style={{ background: toneToken(tone).fill }}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] leading-5 font-semibold text-ink-900 tabular-nums">{primary}</div>
        <div className="text-meta truncate">{secondary}</div>
      </div>
      {trailing && <div className="text-meta flex-none pt-0.5 tabular-nums">{trailing}</div>}
    </div>
  );
}

export function PanelEmpty({ label }: { label: string }) {
  return <div className="text-meta px-4 py-3">{label}</div>;
}
