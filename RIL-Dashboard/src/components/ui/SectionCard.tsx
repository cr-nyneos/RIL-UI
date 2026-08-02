import { useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface SectionCardProps {
  title: string;
  /** Rendered on the right of the header strip; its clicks never toggle the card. */
  actions?: ReactNode;
  /** Small count/label chip shown next to the title. */
  meta?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  padded?: boolean;
  /** `subtle` tints the body so white cards nested inside stay legible. */
  bodyTone?: 'section' | 'subtle';
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  style?: CSSProperties;
}

export default function SectionCard({
  title,
  actions,
  meta,
  children,
  collapsible = false,
  defaultOpen = true,
  padded = true,
  bodyTone = 'section',
  className = '',
  titleClassName = 'text-brand-700',
  bodyClassName = '',
  style,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const showBody = !collapsible || open;

  const heading = (
    <>
      <span className="flex min-w-0 items-center gap-2.5">
        <span className={`truncate text-[20px] leading-7 font-semibold ${titleClassName}`}>{title}</span>
        {meta}
      </span>
      {collapsible && (
        <ChevronDown
          size={20}
          strokeWidth={2.2}
          className={`accordion-chevron ml-2 flex-none text-brand-700 ${open ? '' : '-rotate-90'}`}
        />
      )}
    </>
  );

  return (
    <section className={className} style={style}>
      <div
        className={`flex items-center justify-between gap-3 border border-[var(--color-border-strong)] bg-[var(--color-brand-soft2)] px-4 py-3.5 ${
          showBody ? 'rounded-t-[var(--radius-md)]' : 'rounded-[var(--radius-md)]'
        }`}
      >
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 text-left"
          >
            {heading}
          </button>
        ) : (
          <span className="flex min-w-0 flex-1 items-center justify-between gap-3">{heading}</span>
        )}

        {actions && <div className="flex flex-none flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {showBody && (
        <div
          className={`rounded-b-[var(--radius-md)] border border-t-0 border-[var(--color-border-strong)] ${
            bodyTone === 'subtle' ? 'bg-[var(--color-surface-subtle)]' : 'bg-[var(--color-surface-section)]'
          } ${padded ? 'p-4' : ''} ${bodyClassName}`}
        >
          {children}
        </div>
      )}
    </section>
  );
}
