import { Link } from 'react-router-dom';
import { PRIORITY_SIGNALS } from '../../lib/mockData/dashboard';
import { formatDate } from '../../lib/format';

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const TONE_DOT: Record<string, string> = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-brand-600',
};

export default function GreetingHero() {
  const dateLabel = formatDate(new Date(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-page-title">{timeGreeting()}, Chaitanya</h1>
        <p className="text-meta mt-0.5">{dateLabel}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRIORITY_SIGNALS.map((s) => (
          <Link
            key={s.label}
            to={s.href}
            className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-input)] px-3 text-[13px] font-medium text-ink-700 transition-colors duration-150 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]"
          >
            <span className={`h-1.5 w-1.5 flex-none rounded-full ${TONE_DOT[s.tone]}`} />
            <span className="font-bold tabular-nums text-ink-900">{s.count}</span>
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
