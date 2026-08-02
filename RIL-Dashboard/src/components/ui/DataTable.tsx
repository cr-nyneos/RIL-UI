import { Fragment } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

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
  density?: 'default' | 'compact' | 'tight';
  footer?: ReactNode;
  surface?: boolean;

  bordered?: boolean;
  bodyKey?: string;
  minWidth?: string;
  expandedKey?: string | null;
  renderExpanded?: (row: T) => ReactNode;
}

const ALIGN: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const STAGGER_CAP = 10;

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
  surface = true,
  bordered = true,
  bodyKey,
  minWidth = '1320px',
  expandedKey,
  renderExpanded,
}: DataTableProps<T>) {
  const cellPadding =
    density === 'tight' ? 'px-3 py-2' : density === 'compact' ? 'px-6 py-2.5' : 'px-6 py-4';

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSortChange) return;
    const dir = sort?.key === column.key && sort.dir === 'asc' ? 'desc' : 'asc';
    onSortChange({ key: column.key, dir });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: T) => {
    if (!onRowClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className={surface ? 'glass-raised overflow-hidden' : 'overflow-hidden'}>
      <div
        className={`overflow-x-auto overflow-y-visible ${
          surface || !bordered ? '' : 'rounded-lg border border-(--color-border)'
        }`}
      >
        <table className="min-w-full table-auto border-collapse" style={{ minWidth, width: '100%' }}>
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={column.width ? { width: column.width } : undefined} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((column) => {
                const align = column.align ?? 'left';
                const active = sort?.key === column.key;

                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      column.sortable && active
                        ? sort.dir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={`dt-head ${cellPadding} ${ALIGN[align]} sticky top-0 z-10 select-none text-sm font-semibold tracking-wider text-ink-700 uppercase`}
                  >
                    <div
                      className={`flex items-center gap-1 ${
                        align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span
                        className={column.sortable ? 'cursor-pointer' : undefined}
                        onClick={column.sortable ? () => handleSort(column) : undefined}
                        onKeyDown={
                          column.sortable
                            ? (event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  handleSort(column);
                                }
                              }
                            : undefined
                        }
                        tabIndex={column.sortable ? 0 : undefined}
                        role={column.sortable ? 'button' : undefined}
                        aria-label={column.sortable ? 'Sort column' : undefined}
                      >
                        {column.header}
                      </span>
                      {column.sortable && (
                        <span className="ml-1 text-xs text-brand-700">
                          {active && sort.dir === 'asc' ? (
                            '▲'
                          ) : active && sort.dir === 'desc' ? (
                            '▼'
                          ) : (
                            <span className="opacity-30">▲▼</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody key={bodyKey} className={bodyKey ? 'animate-fade-fast' : undefined}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  {emptyState}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => {
                const key = rowKey(row);
                const expanded = renderExpanded && expandedKey === key;

                return (
                  <Fragment key={key}>
                      <tr
                        aria-expanded={renderExpanded ? Boolean(expanded) : undefined}
                        tabIndex={onRowClick ? 0 : undefined}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        onKeyDown={(event) => handleKeyDown(event, row)}
                        className={`transition-colors duration-150 ${
                          expanded ? 'dt-tr-selected' : rowIndex % 2 === 0 ? 'dt-tr-alt' : 'dt-tr'
                        } ${onRowClick ? 'dt-tr-clickable' : ''} ${stagger ? 'animate-rise' : ''}`}
                        style={
                          stagger
                            ? { animationDelay: `${240 + Math.min(rowIndex, STAGGER_CAP) * 15}ms` }
                            : undefined
                        }
                      >
                        {columns.map((column) => {
                          const align = column.align ?? 'left';
                          return (
                            <td
                              key={column.key}
                              className={`${cellPadding} ${ALIGN[align]} border-b border-[var(--color-border)] text-sm font-normal text-ink-700`}
                            >
                              <div className="min-w-0 max-w-full">
                                {column.render
                                  ? column.render(row)
                                  : String((row as Record<string, unknown>)[column.key] ?? '')}
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {expanded && (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="border-b border-[var(--color-border)] px-6 py-6"
                            style={{ background: 'var(--color-surface-subtle)' }}
                          >
                            {renderExpanded(row)}
                          </td>
                        </tr>
                      )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
