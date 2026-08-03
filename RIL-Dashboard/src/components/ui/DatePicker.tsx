import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const POPOVER_WIDTH = 276;
const POPOVER_HEIGHT = 320;

function parseValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return date;
}

function toISO(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDisplay(date: Date) {
  return `${`${date.getDate()}`.padStart(2, '0')} ${SHORT_MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function DatePicker({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select date',
  className = '',
  id,
  name,
  ariaLabel,
}: DatePickerProps) {
  const selected = parseValue(value);
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selected ?? today);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const fieldId = id ?? name;

  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const flipUp = rect.bottom + POPOVER_HEIGHT + 8 > window.innerHeight && rect.top > POPOVER_HEIGHT + 8;
      setPosition({
        top: flipUp ? rect.top - POPOVER_HEIGHT - 8 : rect.bottom + 8,
        left: Math.min(Math.max(8, rect.left), window.innerWidth - POPOVER_WIDTH - 8),
      });
    };

    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);

    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const shiftMonth = (delta: number) => setViewDate(new Date(year, month + delta, 1));

  const pick = (day: number) => {
    onChange(toISO(new Date(year, month, day)));
    setOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-[15px] font-semibold text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          aria-label={ariaLabel ?? label}
          aria-invalid={Boolean(error)}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            if (!open && selected) setViewDate(selected);
            setOpen((previous) => !previous);
          }}
          className={`focus-bloom flex h-10 w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--color-surface-input)] px-3.5 text-left text-[15px] font-semibold outline-none transition-colors duration-150 ${
            error ? 'border-danger' : open ? 'border-brand-600' : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
          }`}
        >
          <CalendarDays size={17} strokeWidth={2.2} className="shrink-0 text-ink-400" />
          <span className={`min-w-0 flex-1 truncate ${selected ? 'text-ink-900' : 'font-medium text-ink-400'}`}>
            {selected ? formatDisplay(selected) : placeholder}
          </span>
        </button>

        {open && createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={`${label ?? 'Date'} calendar`}
            style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
            className="animate-menu fixed z-9990 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-menu)] p-3 shadow-[0_18px_40px_-18px_rgba(11,23,53,0.5)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-ink-500 transition-colors duration-150 hover:bg-[var(--color-surface-hover)] hover:text-ink-800"
              >
                <ChevronLeft size={16} strokeWidth={2.4} />
              </button>
              <span className="text-[14px] font-semibold text-ink-900">
                {MONTH_LABELS[month]} {year}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-ink-500 transition-colors duration-150 hover:bg-[var(--color-surface-hover)] hover:text-ink-800"
              >
                <ChevronRight size={16} strokeWidth={2.4} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {WEEKDAY_LABELS.map((weekday) => (
                <span key={weekday} className="flex h-7 items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  {weekday}
                </span>
              ))}
              {cells.map((day, index) => {
                if (day === null) return <span key={`blank-${index}`} className="h-8" />;
                const cellDate = new Date(year, month, day);
                const isSelected = selected ? isSameDay(cellDate, selected) : false;
                const isToday = isSameDay(cellDate, today);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => pick(day)}
                    className={`flex h-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[13px] transition-colors duration-150 ${
                      isSelected
                        ? 'bg-brand-600 font-semibold text-white'
                        : isToday
                          ? 'font-semibold text-brand-700 hover:bg-[var(--color-surface-hover)]'
                          : 'font-medium text-ink-800 hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border)] pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange(toISO(today));
                  setOpen(false);
                }}
                className="cursor-pointer rounded-[var(--radius-sm)] px-2 py-1 text-[13px] font-semibold text-brand-700 transition-colors duration-150 hover:bg-[var(--color-surface-hover)]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="cursor-pointer rounded-[var(--radius-sm)] px-2 py-1 text-[13px] font-semibold text-ink-500 transition-colors duration-150 hover:bg-[var(--color-surface-hover)] hover:text-ink-800"
              >
                Clear
              </button>
            </div>
          </div>,
          document.body,
        )}
      </div>
      {typeof error === 'string' && error && <p className="mt-1 text-[12px] font-semibold text-danger">{error}</p>}
    </div>
  );
}
