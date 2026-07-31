import { ArrowRight, ChevronDown } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import Button from './Button';
import JourneyRail from './JourneyRail';
import StatusBadge from './StatusBadge';
import { toneToken } from '../../lib/tone';
import type { JourneyStage } from '../../lib/types/siteOps';
import type { Tone } from '../../lib/types/ui';

export interface JourneyFact {
  label: string;
  value: ReactNode;
}

interface JourneyCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  reference?: { label: string; to?: string };
  stages: JourneyStage[];
  status: string;
  facts: JourneyFact[];
  /** A single calm line, never a warning panel. */
  note?: { tone: Tone; text: string };
  expanded: boolean;
  onToggle: () => void;
  onOpen?: () => void;
  openLabel?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * The signature Site Operations surface. One card is one journey through the
 * plant — identity, the rail, and only the facts an operator acts on. Detail
 * lives behind an inline expansion so the feed stays scannable.
 */
export default function JourneyCard({
  icon,
  title,
  subtitle,
  reference,
  stages,
  status,
  facts,
  note,
  expanded,
  onToggle,
  onOpen,
  openLabel = 'Open',
  children,
  className = '',
  style,
}: JourneyCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle();
        }
      }}
      className={`focus-bloom group cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--color-surface-section)] outline-none transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_16px_32px_-24px_rgba(23,37,84,0.55)] ${
        expanded ? 'border-[var(--color-border-strong)]' : 'border-[var(--color-border)]'
      } ${className}`}
      style={style}
    >
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-start gap-3.5">
            {icon && (
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-ink-600">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-[15px] leading-5 font-bold tracking-[-0.01em] text-ink-900 tabular-nums">
                {title}
              </h3>
              <p className="text-meta mt-1 truncate">
                {subtitle}
                {subtitle && reference && ' · '}
                {reference &&
                  (reference.to ? (
                    <Link
                      to={reference.to}
                      onClick={(event) => event.stopPropagation()}
                      className="font-semibold text-brand-700 hover:underline hover:underline-offset-[3px]"
                    >
                      {reference.label}
                    </Link>
                  ) : (
                    reference.label
                  ))}
              </p>
            </div>
          </div>

          <div className="flex flex-none items-center gap-2.5">
            <StatusBadge status={status} size="sm" />
            <ChevronDown
              size={16}
              strokeWidth={2.4}
              aria-hidden
              className={`accordion-chevron text-ink-400 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        <JourneyRail stages={stages} />

        {note && (
          <p className="flex items-start gap-2 text-[13px] leading-5 font-medium" style={{ color: toneToken(note.tone).text }}>
            <span
              aria-hidden
              className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full"
              style={{ background: toneToken(note.tone).fill }}
            />
            {note.text}
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-t border-[var(--color-glass-hairline)] pt-4">
          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0">
                <dt className="text-table-head">{fact.label}</dt>
                <dd className="mt-1 truncate text-[13px] leading-5 font-semibold text-ink-800 tabular-nums">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          {onOpen && (
            <Button
              variant="link"
              icon={<ArrowRight size={15} strokeWidth={2.4} />}
              iconPosition="right"
              onClick={(event) => {
                event.stopPropagation();
                onOpen();
              }}
              className="flex-none cursor-pointer"
            >
              {openLabel}
            </Button>
          )}
        </div>
      </div>

      {children && (
        <div className={`accordion-grid grid ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div
              className="border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-5"
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
