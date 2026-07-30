import type { KeyboardEvent, ReactNode } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  emptyState?: ReactNode;
  stagger?: boolean;
  density?: 'default' | 'compact';
  footer?: ReactNode;
  bloom?: string;
  /** Change this to crossfade the body (filter / sort / page change) without replaying the page entrance. */
  bodyKey?: string;
  /** Must be at least the sum of the fixed column widths, or flexible columns collapse. */
  minWidth?: string;
}

const ALIGN: Record<'left' | 'center' | 'right', string> = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
};

const STAGGER_CAP = 10;

function cellPadding(index: number, count: number): string {
  if (index === 0) return 'pl-5 pr-3';
  if (index === count - 1) return 'pl-3 pr-5';
  return 'px-3';
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  onSortChange,
  emptyState,
  stagger = false,
  density = 'default',
  footer,
  bloom = 'rgba(99,102,241,0.06)',
  bodyKey,
  minWidth = '1320px',
}: DataTableProps<T>) {
  const template = columns.map((c) => c.width ?? 'minmax(0,1fr)').join(' ');
  const rowHeight = density === 'compact' ? 'h-12' : 'h-16';

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSortChange) return;
    const dir = sort?.key === column.key && sort.dir === 'asc' ? 'desc' : 'asc';
    onSortChange({ key: column.key, dir });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, row: T) => {
    if (!onRowClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className="glass-raised overflow-hidden" style={{ ['--bloom' as string]: bloom }}>
      <div className="overflow-x-auto overflow-y-visible">
        <div role="table" style={{ minWidth }}>
          <div
            role="row"
            className="dt-head grid items-center"
            style={{ gridTemplateColumns: template }}
          >
            {columns.map((column, index) => {
              const align = column.align ?? 'left';
              const active = sort?.key === column.key;
              const padding = cellPadding(index, columns.length);

              if (!column.sortable) {
                return (
                  <div
                    key={column.key}
                    role="columnheader"
                    className={`text-table-head flex h-12 items-center ${ALIGN[align]} ${padding}`}
                  >
                    {column.header}
                  </div>
                );
              }

              return (
                <div key={column.key} role="columnheader" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button
                    type="button"
                    onClick={() => handleSort(column)}
                    className={`text-table-head flex h-12 w-full items-center gap-1.5 transition-colors duration-200 hover:text-ink-700 ${ALIGN[align]} ${padding}`}
                  >
                    <span>{column.header}</span>
                    {!active && <ChevronsUpDown size={13} strokeWidth={2.4} className="text-ink-400" />}
                    {active && sort.dir === 'asc' && <ChevronUp size={13} strokeWidth={2.6} className="text-brand-700" />}
                    {active && sort.dir === 'desc' && <ChevronDown size={13} strokeWidth={2.6} className="text-brand-700" />}
                  </button>
                </div>
              );
            })}
          </div>

          <div key={bodyKey} className={bodyKey ? 'animate-fade-fast' : undefined}>
          {rows.length === 0
            ? emptyState
            : rows.map((row, rowIndex) => (
                <div
                  key={rowKey(row)}
                  role="row"
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={(event) => handleKeyDown(event, row)}
                  className={`dt-row grid items-center ${rowHeight} ${onRowClick ? 'dt-row-clickable' : ''} ${
                    stagger ? 'animate-rise' : ''
                  }`}
                  style={{
                    gridTemplateColumns: template,
                    ...(stagger
                      ? { animationDelay: `${300 + Math.min(rowIndex, STAGGER_CAP) * 28}ms` }
                      : {}),
                  }}
                >
                  {columns.map((column, index) => {
                    const align = column.align ?? 'left';
                    return (
                      <div
                        key={column.key}
                        role="cell"
                        className={`flex min-w-0 items-center ${ALIGN[align]} ${cellPadding(index, columns.length)}`}
                      >
                        <div className="min-w-0 max-w-full">
                          {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>
      {footer}
    </div>
  );
}
