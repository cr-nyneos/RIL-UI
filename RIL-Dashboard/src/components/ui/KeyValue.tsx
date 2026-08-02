import type { ReactNode } from 'react';

export interface KeyValueItem {
  label: string;
  value: ReactNode;
  span?: 1 | 2;
}

interface KeyValueProps {
  items: KeyValueItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  size?: 'md' | 'lg';
}

const COLUMNS: Record<1 | 2 | 3 | 4, string> = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

function isEmpty(value: ReactNode): boolean {
  return value === null || value === undefined || value === '';
}

export default function KeyValue({ items, columns = 4, className = '', size = 'md' }: KeyValueProps) {
  const large = size === 'lg';
  const labelClass = large
    ? 'text-[14px] leading-5 font-semibold text-[var(--color-ink-600)]'
    : 'text-meta';
  const valueClass = large
    ? 'text-[18px] leading-7 font-bold text-[var(--color-ink-900)] mt-1 tabular-nums break-words'
    : 'text-body-strong mt-0.5 tabular-nums break-words';

  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-4 ${COLUMNS[columns]} ${className}`}>
      {items.map((item) => (
        <div key={item.label} className={`min-w-0 ${item.span === 2 ? 'sm:col-span-2' : ''}`}>
          <dt className={labelClass}>{item.label}</dt>
          <dd className={valueClass}>
            {isEmpty(item.value) ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
