import type { CSSProperties, ReactNode } from 'react';

interface SectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  padded?: boolean;
  className?: string;
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
  className = '',
  bodyClassName = '',
  style,
}: SectionProps) {
  return (
    <section className={`surface-section overflow-hidden ${className}`} style={style}>
      {title && (
        <header className="surface-section-head flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="text-section-title truncate">{title}</h2>
            {description && <p className="text-meta mt-0.5 truncate">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}

      {toolbar && (
        <div className="surface-toolbar flex flex-wrap items-center gap-2.5 px-5 py-3">{toolbar}</div>
      )}

      <div className={`${padded ? 'p-5' : ''} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
