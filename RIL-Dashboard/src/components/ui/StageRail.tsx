import { useState } from 'react';
import FloatingTooltip from '../FloatingTooltip';
import type { GateState } from '../../lib/types/order';

/** Register gates use `done`; the detail chain adds `blocked`. One component reads both. */
export type StageState = GateState | 'complete' | 'blocked';

export interface StageSegment {
  key: string;
  label: string;
  state: StageState;
}

interface StageRailProps {
  stages: StageSegment[];
  compact?: boolean;
  /** Promotes the current segment to the blocked tone (register call sites). */
  blocked?: boolean;
}

const STATE_LABEL: Record<'done' | 'current' | 'locked' | 'blocked', string> = {
  done: 'Cleared',
  current: 'In progress',
  locked: 'Locked',
  blocked: 'Blocked',
};

const DONE_FILL = 'var(--color-brand-600)';
const CURRENT_FILL = 'var(--color-brand-500)';
const BLOCKED_FILL = 'var(--color-danger)';
const LOCKED_FILL = 'var(--color-ink-300)';

type Resolved = 'done' | 'current' | 'locked' | 'blocked';

function resolve(state: StageState, blocked: boolean): Resolved {
  if (state === 'complete' || state === 'done') return 'done';
  if (state === 'blocked') return 'blocked';
  if (state === 'current') return blocked ? 'blocked' : 'current';
  return 'locked';
}

const FILL: Record<Resolved, string> = {
  done: DONE_FILL,
  current: CURRENT_FILL,
  locked: LOCKED_FILL,
  blocked: BLOCKED_FILL,
};

export default function StageRail({ stages, compact = true, blocked = false }: StageRailProps) {
  const [hovered, setHovered] = useState<{
    key: string;
    label: string;
    state: Resolved;
    rect: { left: number; bottom: number; width: number };
  } | null>(null);

  const active = stages.find((stage) => {
    const state = resolve(stage.state, blocked);
    return state === 'current' || state === 'blocked';
  });
  const size = compact ? 'h-1.5 w-5' : 'h-2 w-8';

  return (
    <div className="min-w-0">
      <div className="flex gap-1">
        {stages.map((stage) => {
          const state = resolve(stage.state, blocked);
          const live = state === 'current' || state === 'blocked';

          return (
            <div
              key={stage.key}
              className={`${size} rounded-[var(--radius-sm)] ${
                live ? (state === 'blocked' ? 'gate-pulse-danger' : 'gate-pulse') : ''
              }`}
              style={{ background: FILL[state] }}
              onMouseEnter={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setHovered({
                  key: stage.key,
                  label: stage.label,
                  state,
                  rect: { left: rect.left, bottom: rect.bottom, width: rect.width },
                });
              }}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </div>
      <div className="mt-1.5 truncate text-[12px] font-semibold text-ink-700" title={active?.label}>
        {active ? active.label : 'All gates cleared'}
      </div>

      <FloatingTooltip open={hovered !== null} below={hovered?.rect} gap={8}>
        <div className="text-[13px] font-semibold text-ink-900">{hovered?.label}</div>
        <div className="text-meta mt-0.5">{hovered ? STATE_LABEL[hovered.state] : ''}</div>
      </FloatingTooltip>
    </div>
  );
}
