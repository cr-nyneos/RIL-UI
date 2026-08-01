import type { ReactNode } from 'react';
import Breadcrumbs, { type Crumb } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  className?: string;
  /** `lg` is the listing-page scale: oversized title over a breadcrumb trail. */
  size?: 'md' | 'lg';
  breadcrumbs?: Crumb[];
  /** Draws the hairline that separates the header block from the page body. */
  rule?: boolean;
}

export default function PageHeader({
  title,
  actions,
  className = '',
  size = 'md',
  breadcrumbs,
  rule = false,
}: PageHeaderProps) {
  const large = size === 'lg';

  return (
    <div
      className={`${rule ? 'border-b border-[var(--color-border)] pb-4' : ''} ${className}`}
    >
      <div className={`flex flex-wrap justify-between gap-3 ${large ? 'items-end' : 'items-center'}`}>
        <div className="min-w-0">
          <h1 className={large ? 'text-page-title-lg' : 'text-page-title'}>{title}</h1>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} className={large ? 'mt-1.5' : 'mt-1'} />
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}
