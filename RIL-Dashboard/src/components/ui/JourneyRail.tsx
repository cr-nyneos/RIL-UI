import { Check } from 'lucide-react';
import { formatTime } from '../../lib/format';
import type { JourneyStage, JourneyStageState } from '../../lib/types/siteOps';

interface JourneyRailProps {
  stages: JourneyStage[];
  size?: 'sm' | 'md';
  /** Times are useful on a feed card, noise inside a dense summary list. */
  showTimes?: boolean;
  className?: string;
}

const NODE: Record<'sm' | 'md', { box: string; center: number; dot: string; icon: number }> = {
  sm: { box: 'h-5 w-5', center: 10, dot: 'h-1.5 w-1.5', icon: 11 },
  md: { box: 'h-7 w-7', center: 14, dot: 'h-2 w-2', icon: 13 },
};

const ACCENT: Record<JourneyStageState, string> = {
  complete: 'var(--color-brand-600)',
  current: 'var(--color-brand-600)',
  upcoming: 'var(--color-border-strong)',
  blocked: 'var(--color-danger)',
  delayed: 'var(--color-warning)',
};

const LABEL: Record<JourneyStageState, string> = {
  complete: 'font-semibold text-ink-500',
  current: 'font-bold text-ink-900',
  upcoming: 'font-semibold text-ink-400',
  blocked: 'font-bold text-danger',
  delayed: 'font-bold text-warning',
};

/** The connector into a node is drawn from the state of the node behind it. */
function connector(previous: JourneyStage | undefined): { color: string; dashed: boolean } {
  if (!previous) return { color: 'var(--color-border)', dashed: false };
  if (previous.state === 'blocked') return { color: 'var(--color-danger)', dashed: true };
  if (previous.state === 'delayed') return { color: 'var(--color-warning)', dashed: true };
  if (previous.state === 'complete') return { color: 'var(--color-brand-500)', dashed: false };
  return { color: 'var(--color-border)', dashed: false };
}

/**
 * The signature Site Operations visual: one horizontal journey through the
 * plant. Completed nodes are filled, the live node is held open and pulsing,
 * future nodes stay outlined, and a halted journey dashes its next connector.
 */
export default function JourneyRail({ stages, size = 'md', showTimes = true, className = '' }: JourneyRailProps) {
  const metrics = NODE[size];

  return (
    <ol
      className={`grid ${className}`}
      style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
    >
      {stages.map((stage, index) => {
        const accent = ACCENT[stage.state];
        const filled = stage.state === 'complete';
        const live = stage.state === 'current' || stage.state === 'blocked' || stage.state === 'delayed';
        const before = connector(stages[index - 1]);
        const after = connector(stage);

        return (
          <li key={stage.key} className="relative flex min-w-0 flex-col items-center">
            {index > 0 && (
              <span
                aria-hidden
                className="absolute right-1/2 left-0"
                style={{
                  top: metrics.center,
                  borderTopWidth: before.dashed ? 1.5 : 2,
                  borderTopStyle: before.dashed ? 'dashed' : 'solid',
                  borderTopColor: before.color,
                }}
              />
            )}
            {index < stages.length - 1 && (
              <span
                aria-hidden
                className="absolute right-0 left-1/2"
                style={{
                  top: metrics.center,
                  borderTopWidth: after.dashed ? 1.5 : 2,
                  borderTopStyle: after.dashed ? 'dashed' : 'solid',
                  borderTopColor: after.color,
                }}
              />
            )}

            <span
              className={`relative z-1 flex ${metrics.box} flex-none items-center justify-center rounded-full border-2 ${
                live && stage.state !== 'delayed' ? (stage.state === 'blocked' ? 'gate-pulse-danger' : 'gate-pulse') : ''
              }`}
              style={{
                borderColor: accent,
                background: filled ? accent : 'var(--color-surface-section)',
              }}
            >
              {filled ? (
                <Check size={metrics.icon} strokeWidth={3} className="text-white" />
              ) : live ? (
                <span className={`${metrics.dot} rounded-full`} style={{ background: accent }} />
              ) : null}

              {stage.state === 'delayed' && (
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-[var(--color-surface-section)]"
                  style={{ background: 'var(--color-warning)' }}
                />
              )}
            </span>

            <span className={`mt-2 max-w-full truncate text-center text-[11px] leading-4 ${LABEL[stage.state]}`}>
              {stage.label}
            </span>

            {showTimes && (
              <span className="text-[10px] leading-4 text-ink-400 tabular-nums">
                {stage.at ? formatTime(stage.at) : ' '}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
