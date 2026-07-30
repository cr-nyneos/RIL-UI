import { useState } from 'react';

export type GateState = 'done' | 'current' | 'locked';

export interface GateSegment {
  key: string;
  label: string;
  state: GateState;
}

interface GateRailProps {
  gates: GateSegment[];
  compact?: boolean;
  blocked?: boolean;
}

const STATE_LABEL: Record<GateState, string> = {
  done: 'Cleared',
  current: 'In progress',
  locked: 'Locked',
};

const DONE_FILL = 'var(--color-brand-600)';
const CURRENT_FILL = 'var(--color-brand-500)';
const BLOCKED_FILL = 'var(--color-danger)';
const LOCKED_FILL = 'var(--color-ink-300)';

export default function GateRail({ gates, compact = true, blocked = false }: GateRailProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const current = gates.find((gate) => gate.state === 'current');
  const size = compact ? 'h-1.5 w-5' : 'h-2 w-8';

  return (
    <div className="min-w-0">
      <div className="flex gap-1">
        {gates.map((gate) => {
          const isCurrent = gate.state === 'current';
          const background =
            gate.state === 'done'
              ? DONE_FILL
              : isCurrent
                ? blocked
                  ? BLOCKED_FILL
                  : CURRENT_FILL
                : LOCKED_FILL;

          return (
            <div key={gate.key} className="relative">
              <div
                className={`${size} rounded-[var(--radius-sm)] ${
                  isCurrent ? (blocked ? 'gate-pulse-danger' : 'gate-pulse') : ''
                }`}
                style={{ background }}
                onMouseEnter={() => setHovered(gate.key)}
                onMouseLeave={() => setHovered(null)}
              />
              {hovered === gate.key && (
                <div className="glass-tooltip pointer-events-none absolute bottom-full left-1/2 z-[60] mb-2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1.5">
                  <div className="text-[12px] font-bold text-white">{gate.label}</div>
                  <div className="text-[11px] font-medium text-ink-300">
                    {blocked && isCurrent ? 'Blocked' : STATE_LABEL[gate.state]}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 truncate text-[12px] font-semibold text-ink-700" title={current?.label}>
        {current ? current.label : 'All gates cleared'}
      </div>
    </div>
  );
}
