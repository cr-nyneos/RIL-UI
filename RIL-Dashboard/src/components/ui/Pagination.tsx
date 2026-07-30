import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageCount, pageSize, total, onPageChange }: PaginationProps) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  const atStart = page <= 1;
  const atEnd = page >= pageCount;

  return (
    <div
      className="flex h-14 items-center justify-between px-6"
      style={{ borderTop: '1px solid var(--color-glass-hairline)' }}
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
              className={`text-[13px] font-bold tabular-nums ${n === page ? 'bg-[var(--wash-brand-active)] text-brand-700' : ''}`}
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
