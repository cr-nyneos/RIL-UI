import type { ReactNode } from 'react';
import { Check, CircleAlert, Lock, X } from 'lucide-react';
import type { Tone } from '../../lib/types/ui';
import { toneToken } from '../../lib/tone';

export type TimelineState = 'complete' | 'current' | 'locked' | 'blocked';

export interface TimelineDependency {
  label: string;
  met: boolean;
  reason?: string;
}

export interface TimelineNodeData {
  key: string;
  label: string;
  state: TimelineState;
  owner?: { name: string; role: string };
  timestamp?: string;
  dependencies?: TimelineDependency[];
  detail?: string;
}

interface TimelineProps {
  nodes: TimelineNodeData[];
  renderAction?: (node: TimelineNodeData) => ReactNode;
  className?: string;
}

const STATE_TONE: Record<TimelineState, Tone> = {
  complete: 'success',
  current: 'brand',
  locked: 'neutral',
  blocked: 'danger',
};

const STATE_LABEL: Record<TimelineState, string> = {
  complete: 'Complete',
  current: 'In progress',
  locked: 'Locked',
  blocked: 'Blocked',
};

/** The rail segment above a node carries that node's tone — progress reads at a glance. */
function railColor(state: TimelineState): string {
  if (state === 'complete') return toneToken('success').fill;
  if (state === 'current') return toneToken('brand').fill;
  return 'var(--color-border-strong)';
}

function Marker({ state }: { state: TimelineState }) {
  const tokens = toneToken(STATE_TONE[state]);

  if (state === 'locked') {
    return (
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full border"
        style={{ background: 'var(--color-surface-subtle)', borderColor: 'var(--color-border-strong)' }}
      >
        <Lock size={13} strokeWidth={2.4} style={{ color: 'var(--color-ink-500)' }} />
      </span>
    );
  }

  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full border"
      style={{ background: tokens.fill, borderColor: tokens.fill }}
    >
      {state === 'complete' && <Check size={14} strokeWidth={3} className="text-white" />}
      {state === 'blocked' && <CircleAlert size={14} strokeWidth={2.6} className="text-white" />}
      {state === 'current' && <span className="h-2 w-2 rounded-full bg-white" />}
    </span>
  );
}

function DependencyPanel({ dependencies }: { dependencies: TimelineDependency[] }) {
  return (
    <div className="glass-inset mt-3 overflow-hidden">
      {dependencies.map((dependency, index) => (
        <div
          key={dependency.label}
          className={`flex items-start gap-2.5 px-3.5 py-2.5 ${
            index > 0 ? 'border-t border-[var(--color-border)]' : ''
          }`}
        >
          <span className="mt-0.5 flex-none">
            {dependency.met ? (
              <Check size={14} strokeWidth={2.8} style={{ color: toneToken('success').text }} />
            ) : (
              <X size={14} strokeWidth={2.8} style={{ color: toneToken('danger').text }} />
            )}
          </span>
          <div className="min-w-0">
            <div className="text-body-strong">{dependency.label}</div>
            {!dependency.met && dependency.reason && (
              <p className="text-meta mt-0.5">{dependency.reason}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Timeline({ nodes, renderAction, className = '' }: TimelineProps) {
  return (
    <ol className={className}>
      {nodes.map((node, index) => {
        const tokens = toneToken(STATE_TONE[node.state]);
        const next = nodes[index + 1];
        const gated = node.state === 'locked' || node.state === 'blocked';

        return (
          <li
            key={node.key}
            className={`relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 pb-5 ${
              index > 0 ? 'border-t border-[var(--color-border)] pt-5' : ''
            }`}
          >
            {/* Rail — the segment above this node takes this node's tone. */}
            {index > 0 && (
              <span
                aria-hidden
                className="absolute left-[13px] top-0 w-0.5"
                style={{ height: '20px', background: railColor(node.state) }}
              />
            )}
            {next && (
              <span
                aria-hidden
                className="absolute left-[13px] w-0.5"
                style={{
                  top: index > 0 ? '48px' : '28px',
                  bottom: 0,
                  background: railColor(next.state),
                }}
              />
            )}

            <div className="relative z-1">
              <Marker state={node.state} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <h3 className="text-section-title truncate">{node.label}</h3>
                  <span
                    className="text-badge inline-flex flex-none items-center rounded-[var(--radius-sm)] border px-1.5 py-0.5"
                    style={{ color: tokens.text, background: tokens.soft, borderColor: tokens.border }}
                  >
                    {STATE_LABEL[node.state]}
                  </span>
                </div>
                {renderAction && <div className="flex-none">{renderAction(node)}</div>}
              </div>

              {(node.owner || node.timestamp) && (
                <p className="text-meta mt-1 tabular-nums">
                  {node.owner && (
                    <>
                      <span className="font-semibold text-ink-600">{node.owner.name}</span>
                      {` · ${node.owner.role}`}
                    </>
                  )}
                  {node.owner && node.timestamp && ' · '}
                  {node.timestamp}
                </p>
              )}

              {node.detail && <p className="text-body mt-2">{node.detail}</p>}

              {gated && node.dependencies && node.dependencies.length > 0 && (
                <DependencyPanel dependencies={node.dependencies} />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
