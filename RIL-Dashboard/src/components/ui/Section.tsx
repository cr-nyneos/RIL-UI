import type { CSSProperties, ReactNode } from 'react';

interface SectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  padded?: boolean;
  /**
   * `flush` drops the card border, radius and shadow so a section can stack
   * inside a container that already is one — no boxes inside boxes.
   */
  variant?: 'card' | 'flush';
  className?: string;
  headClassName?: string;
  bodyClassName?: string;
  style?: CSSProperties;
}

export default function Section({
  title,
  description,
  actions,
  toolbar,
  children,
  padded = true,
  variant = 'card',
  className = '',
  headClassName = '',
  bodyClassName = '',
  style,
}: SectionProps) {
  return (
    <section
      className={`overflow-hidden ${
        variant === 'card' ? 'surface-section' : 'border-t border-[var(--color-border)] first:border-t-0'
      } ${className}`}
      style={style}
    >
      {(title || toolbar) && (
        <header className={`surface-section-head ${headClassName}`}>
          {title && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-3.5 pb-3">
              <div className="min-w-0">
                <h2 className="text-section-title truncate">{title}</h2>
                {description && <p className="text-meta mt-0.5 truncate">{description}</p>}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}

          {toolbar && (
            <div className={`flex flex-wrap items-center gap-2.5 px-5 pb-3 ${title ? '' : 'pt-3'}`}>
              {toolbar}
            </div>
          )}
        </header>
      )}

      <div className={`${padded ? 'p-5' : ''} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
