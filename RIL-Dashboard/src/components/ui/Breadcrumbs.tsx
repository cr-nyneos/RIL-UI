import { Link } from 'react-router-dom';

export interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {items.map((item, index) => {
        const last = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {item.to && !last ? (
              <Link
                to={item.to}
                className="text-[14px] leading-5 font-semibold text-brand-700 transition-colors duration-150 hover:underline hover:underline-offset-[3px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={last ? 'page' : undefined}
                className={`text-[14px] leading-5 ${last ? 'font-semibold text-ink-900' : 'font-semibold text-ink-600'}`}
              >
                {item.label}
              </span>
            )}
            {!last && <span className="text-[14px] leading-5 text-ink-400">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
