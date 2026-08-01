import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** `entries` is the listing-page bar: page-size picker, prev/next, entry range. */
  variant?: 'pages' | 'entries';
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
  variant = 'pages',
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageSizeChange,
}: PaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  const atStart = page <= 1;
  const atEnd = page >= pageCount;

  if (variant === 'entries') {
    return (
      <div
        className="flex flex-col gap-3 px-6 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        style={{
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-brand-soft2)',
        }}
      >
        <div className="flex shrink-0 items-center gap-2 text-[13px] font-semibold text-ink-700">
          <span>Show</span>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
            disabled={!onPageSizeChange}
            className="focus-bloom cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-input)] px-2 py-1 text-[13px] font-semibold text-ink-900 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {Array.from(new Set([...pageSizeOptions, pageSize]))
              .sort((a, b) => a - b)
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
          <span>entries</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="sm"
            disabled={atStart}
            onClick={() => onPageChange(page - 1)}
            icon={<ChevronLeft size={16} strokeWidth={2.4} />}
          >
            Previous
          </Button>

          <span className="text-[13px] font-semibold text-ink-700">
            Page <strong className="text-brand-700 tabular-nums">{page} of {pageCount}</strong>
          </span>

          <Button
            size="sm"
            disabled={atEnd}
            onClick={() => onPageChange(page + 1)}
            icon={<ChevronRight size={16} strokeWidth={2.4} />}
            iconPosition="right"
          >
            Next
          </Button>
        </div>

        <div className="shrink-0 text-[13px] font-semibold text-ink-700">
          Showing <span className="text-brand-700 tabular-nums">{first}</span> to{' '}
          <span className="text-brand-700 tabular-nums">{last}</span> of{' '}
          <span className="text-brand-700 tabular-nums">{total}</span>{' '}
          {total === 1 ? 'entry' : 'entries'}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-14 items-center justify-between px-6"
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-brand-soft2)',
      }}
    >
      <span className="text-meta">
        Showing {first}-{last} of {total}
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          variant="icon"
          size="sm"
          aria-label="Previous page"
          disabled={atStart}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
        </Button>

        {pageCount <= 7 &&
          Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant="icon"
              size="sm"
              aria-current={n === page ? 'page' : undefined}
              onClick={() => onPageChange(n)}
              className={`text-[13px] font-bold tabular-nums ${n === page ? 'bg-[var(--color-surface-selected)] text-brand-700' : ''}`}
            >
              {n}
            </Button>
          ))}

        <Button
          variant="icon"
          size="sm"
          aria-label="Next page"
          disabled={atEnd}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} strokeWidth={2.4} />
        </Button>
      </div>
    </div>
  );
}
