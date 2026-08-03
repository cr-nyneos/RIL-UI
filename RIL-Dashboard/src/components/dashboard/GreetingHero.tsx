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
  danger: 'bg-[#FF9C8A]',
  warning: 'bg-[#FFC46B]',
  info: 'bg-[#7FB2FF]',
};

export default function GreetingHero() {
  const dateLabel = formatDate(new Date(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="dash-hero relative overflow-hidden px-6 py-7 sm:px-9 sm:py-8">
      <div className="relative flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
        <div className="min-w-0">
          <span className="dash-hero-eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] leading-4 font-semibold tracking-[0.14em] uppercase">
            <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#7FB2FF]" />
            Vendor Management
          </span>
          <h1 className="mt-4 text-[30px] leading-9 font-bold tracking-[-0.025em] text-white sm:text-[34px] sm:leading-11">
            {timeGreeting()}, Chaitanya
          </h1>
          <p className="mt-2.5 text-[13.5px] leading-5 font-medium text-[#A9C2F0]">
            {dateLabel}
            <span className="mx-2 text-[#4F6BA8]">|</span>
            Live network position across 5 plants
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {PRIORITY_SIGNALS.map((s) => (
            <Link
              key={s.label}
              to={s.href}
              className="dash-hero-chip flex h-12 items-center gap-2.5 rounded-[var(--radius-md)] px-3.5 text-[12.5px] font-semibold text-[#A9C2F0]"
            >
              <span className={`h-2 w-2 flex-none rounded-full ${TONE_DOT[s.tone]}`} />
              <span className="text-[17px] leading-5 font-semibold tabular-nums text-white">{s.count}</span>
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
