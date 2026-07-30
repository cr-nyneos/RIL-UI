import { Link } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
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
  info: 'bg-info',
};

export default function GreetingHero() {
  const dateLabel = formatDate(new Date(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <GlassCard className="relative overflow-hidden p-7 sm:p-8">
      <div
        className="hero-aurora pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45% 70% at 100% 0%, rgba(34,211,238,0.16), transparent 65%), radial-gradient(50% 80% at 92% 40%, rgba(139,92,246,0.14), transparent 70%)',
        }}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-[clamp(24px,3vw,32px)] font-semibold tracking-tight text-ink-900">
            {timeGreeting()}, Chaitanya
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-500">{dateLabel}</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {PRIORITY_SIGNALS.map((s) => (
            <Link
              key={s.label}
              to={s.href}
              className="glass-inset flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[12.5px] font-medium text-ink-700 transition-colors duration-200 hover:bg-glass-fill"
            >
              <span className={`h-2 w-2 flex-none rounded-full ${TONE_DOT[s.tone]}`} />
              <span className="font-semibold tabular-nums text-ink-900">{s.count}</span>
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
