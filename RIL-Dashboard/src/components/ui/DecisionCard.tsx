import { ChevronDown } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import Badge from './Badge';
import JourneyRail from './JourneyRail';
import { toneToken } from '../../lib/tone';
import type { JourneyStage } from '../../lib/types/siteOps';
import type { Tone } from '../../lib/types/ui';

export interface DecisionFact {
  label: string;
  value: ReactNode;
  tone?: Tone;
}

interface DecisionCardProps {
  icon?: ReactNode;
  /** The decision itself — the gate awaiting a call. */
  gate: string;
  orderId: string;
  orderTo?: string;
  subtitle: string;
  /** The one sentence the reviewer is answering. */
  question: string;
  stages: JourneyStage[];
  facts: DecisionFact[];
  /** Drives the left rule and the due line — urgency, never decoration. */
  accent?: Tone;
  due: string;
  status?: { label: string; tone: Tone };
  actions?: ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Approvals hero surface. One card is one decision: who is asking, what is
 * being asked, where the order sits in the execution chain, and the controls to
 * answer it. Supporting evidence stays inline behind the expansion so the feed
 * never stops being scannable.
 */
export default function DecisionCard({
  icon,
  gate,
  orderId,
  orderTo,
  subtitle,
  question,
  stages,
  facts,
  accent = 'brand',
  due,
  status,
  actions,
  expanded,
  onToggle,
  children,
  className = '',
  style,
}: DecisionCardProps) {
  const tokens = toneToken(accent);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`${gate} decision for ${orderId}`}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      }}
      className={`focus-bloom group relative cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--color-surface-section)] outline-none transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_16px_32px_-24px_rgba(23,37,84,0.55)] ${
        expanded ? 'border-[var(--color-border-strong)]' : 'border-[var(--color-border)]'
      } ${className}`}
      style={style}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: tokens.fill }} />

      <div className="flex flex-col gap-5 p-5 pl-6">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-start gap-3.5">
            {icon && (
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-ink-600">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-[17px] leading-6 font-bold tracking-[-0.01em] text-ink-900">
                {gate}
              </h3>
              <p className="text-meta mt-1 truncate tabular-nums">
                {orderTo ? (
                  <Link
                    to={orderTo}
                    onClick={(event) => event.stopPropagation()}
                    className="font-semibold text-brand-700 hover:underline hover:underline-offset-[3px]"
                  >
                    {orderId}
                  </Link>
                ) : (
                  orderId
                )}
                {` · ${subtitle}`}
              </p>
            </div>
          </div>

          <div className="flex flex-none items-center gap-2.5">
            {status ? (
              <Badge tone={status.tone} size="md" shape="square">
                {status.label}
              </Badge>
            ) : (
              <span className="text-[12px] leading-5 font-semibold tabular-nums" style={{ color: tokens.text }}>
                {due}
              </span>
            )}
            <span
              aria-hidden
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] text-brand-700"
            >
              <ChevronDown
                size={20}
                strokeWidth={2.6}
                className={`accordion-chevron ${expanded ? 'rotate-180' : ''}`}
              />
            </span>
          </div>
        </div>

        <p className="min-w-0 text-[14px] leading-6 font-semibold text-ink-900">{question}</p>

        <JourneyRail stages={stages} size="sm" showTimes={false} />
      </div>

      {/* Decision panel — the facts the call rests on, then the controls that
          answer it, on their own blue surface. */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-header)] px-5 py-4 pl-6">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-table-head">{fact.label}</dt>
              <dd
                className="mt-1 text-[13px] leading-5 font-semibold tabular-nums"
                style={{ color: fact.tone ? toneToken(fact.tone).text : 'var(--color-ink-900)' }}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        {actions && (
          <div
            className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-3.5"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div className={`accordion-grid grid ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div
              className="border-t border-[var(--color-border)] bg-[var(--color-brand-soft2)] p-5 pl-6"
              onClick={(event) => event.stopPropagation()}
              role="presentation"
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
