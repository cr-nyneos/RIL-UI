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

export default function KeyValue({ items, columns = 4, className = '' }: KeyValueProps) {
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-4 ${COLUMNS[columns]} ${className}`}>
      {items.map((item) => (
        <div key={item.label} className={`min-w-0 ${item.span === 2 ? 'sm:col-span-2' : ''}`}>
          <dt className="text-meta">{item.label}</dt>
          <dd className="text-body-strong mt-0.5 tabular-nums break-words">
            {isEmpty(item.value) ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
